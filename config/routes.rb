Rails.application.routes.draw do
  get "app/home"
  devise_for :users, controllers: {
    registrations: "users/registrations",
    passwords: "users/passwords"
  }

  # 未ログイン → landing
  unauthenticated do
    root "landing#show"
  end

  # ログイン後 root
  authenticated :user do
    root "app#home", as: :authenticated_root
  end

  # メール認証（ワンタイムコード）
  get  "/verify",     to: "users/confirmations#new",    as: :verify_email
  post "/verify",     to: "users/confirmations#create"
  post "/verify/resend", to: "users/confirmations#resend", as: :resend_verify_email

  # 6桁コード入力ページ
  devise_scope :user do
    # 6桁コード入力ページ（パスワード再発行フロー）
    get  "/password/verify",  to: "users/passwords#verify",         as: :verify_password
    post "/password/verify",  to: "users/passwords#verify_submit",  as: :verify_password_submit
    post "/password/resend",  to: "users/passwords#resend",         as: :resend_password_code
  end

  # 規約
  get  "/terms",   to: "static#terms",   as: :terms
  get  "/privacy", to: "static#privacy", as: :privacy
end
