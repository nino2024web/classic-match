class StaticController < ApplicationController
  helper_method :signup_or_main_path
  def terms

  end
  def privacy

  end

  private

  # 未ログイン→登録へ / ログイン済→メインへ
  def signup_or_main_path
    if user_signed_in?
      (Rails.application.routes.url_helpers.method_defined?(:authenticated_root_path) ?
        authenticated_root_path : root_path)
    else
      new_user_registration_path
    end
  end

end
