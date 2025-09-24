class AddResetCodeToUsers < ActiveRecord::Migration[8.0]
  def change
    add_column :users, :reset_password_code, :string
    add_column :users, :reset_password_code_sent_at, :datetime
    add_index  :users, :reset_password_code
  end
end
