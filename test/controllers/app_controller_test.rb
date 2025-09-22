require "test_helper"

class AppControllerTest < ActionDispatch::IntegrationTest
  test "should get home" do
    get app_home_url
    assert_response :success
  end
end
