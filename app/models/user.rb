class User < ApplicationRecord
  attr_accessor :terms_accepted
  validates :terms_accepted, acceptance: { accept: "1" }, on: :create
  
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :validatable
end
