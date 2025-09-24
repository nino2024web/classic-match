class Users::PasswordsController < Devise::PasswordsController
  def new
    super
  end

  def edit
    super
  end

  # メール送信（6桁コード発行＋Deviseのリセットメール）
  def create
    email = resource_params[:email].to_s.strip
    if (user = User.find_by(email: email))
      # 6桁発行
      user.issue_reset_password_code!
      raw_token = user.send(:set_reset_password_token)
      Devise::Mailer.reset_password_instructions(user, raw_token).deliver_later
      session[:reset_email] = user.email
      session[:reset_raw_token] = raw_token
    end
    redirect_to verify_password_path
  end

  #  6桁入力画面
  def verify
    @email = session[:reset_email]
    redirect_to(new_user_password_path) unless @email.present?
  end

  #  6桁検証
  def verify_submit
    user = User.find_by(email: session[:reset_email])
    code = params[:code].to_s.strip
    return redirect_to(new_user_password_path) unless user

    if user.reset_password_code_valid?(code)
      raw_token = session[:reset_raw_token].presence || user.send(:set_reset_password_token)

      session.delete(:reset_email)
      session.delete(:reset_raw_token)
      redirect_to edit_user_password_path(reset_password_token: raw_token)
    else
      @email = user.email
      @invalid_code = true
      render :verify, status: :unprocessable_entity
    end
  end

  # 6桁再送（30分ルール内は静かに抑止）
  def resend
    user = User.find_by(email: session[:reset_email])
    redirect_to verify_password_path and return unless user

    if user.reset_password_code_sent_at && user.reset_password_code_sent_at > 60.seconds.ago
      return redirect_to verify_password_path
    end

    user.issue_reset_password_code!
    raw_token = user.send(:set_reset_password_token)
    Devise::Mailer.reset_password_instructions(user, raw_token).deliver_later
    session[:reset_raw_token] = raw_token
    redirect_to verify_password_path
  end

  private

  def resource_params
    return super if action_name == "update"
    params.require(resource_name).permit(:email)
  end
end
