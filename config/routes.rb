Rails.application.routes.draw do
  get "app/home"
  devise_for :users, controllers: {
    registrations: "users/registrations"
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

  # 規約
  get  "/terms",   to: "static#terms",   as: :terms
  get  "/privacy", to: "static#privacy", as: :privacy
end
