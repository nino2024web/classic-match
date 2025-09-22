class UserMailer < ApplicationMailer
  default from: "no-reply@example.com"

  def confirmation_code(user)
    @user = user
    mail(to: @user.email, subject: "【#{Rails.application.class.module_parent_name}】メール確認コード")
  end
end
