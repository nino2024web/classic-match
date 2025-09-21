Rails.application.routes.draw do
  devise_for :users

  root "landing#show"
  get  "/terms",   to: "static#terms",   as: :terms
  get  "/privacy", to: "static#privacy", as: :privacy
end
