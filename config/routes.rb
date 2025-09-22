Rails.application.routes.draw do
  get "app/home"
  devise_for :users

  # 未ログイン → landing
  unauthenticated do
    root "landing#show"
  end

  # ログイン後 root
  authenticated :user do
    root "app#home", as: :authenticated_root
  end

  # 規約
  get  "/terms",   to: "static#terms",   as: :terms
  get  "/privacy", to: "static#privacy", as: :privacy
end
