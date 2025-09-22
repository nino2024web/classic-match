module Users
  class RegistrationsController < Devise::RegistrationsController
    def create
      super do |resource|
        if resource.persisted? && !resource.confirmed?
          resource.issue_confirmation_code!

          UserMailer.confirmation_code(resource).deliver_later
          session[:verify_email] = resource.email
        end
      end
    end

    protected

    def after_inactive_sign_up_path_for(_resource)
      verify_email_path
    end
  end
end
