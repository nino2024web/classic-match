class Users::ConfirmationsController < ApplicationController
  before_action :redirect_if_confirmed

  def new
    @email = session[:verify_email]
  end

  def create
    @user = User.find_by(email: session[:verify_email])
    code  = params[:code].to_s.strip

    unless @user
      redirect_to new_user_registration_path, alert: and return
    end

    if @user.confirmation_code_valid?(code)
      @user.confirm
      sign_in(@user)
      redirect_to (defined?(authenticated_root_path) ? authenticated_root_path : root_path)
    else
      if code.present? && ActiveSupport::SecurityUtils.secure_compare(code.to_s, (@user.confirmation_code || "").to_s)
        @expired = true
      end
      render :new, status: :unprocessable_entity
    end
  end

  def resend
    @user = User.find_by(email: session[:verify_email])
    if @user
      @user.issue_confirmation_code!
      UserMailer.confirmation_code(@user).deliver_later
      redirect_to verify_email_path
    else
      redirect_to new_user_registration_path
    end
  end

  private

  def redirect_if_confirmed
    if current_user&.confirmed?
      redirect_to (defined?(authenticated_root_path) ? authenticated_root_path : root_path)
    end
  end
end
