class User < ApplicationRecord
  devise :database_authenticatable, :registerable,
  :recoverable, :rememberable, :validatable, :confirmable

  attr_accessor :terms_accepted
  validates :terms_accepted, acceptance: { accept: "1" }, on: :create

  # 6桁ワンタイムコード生成
  def issue_confirmation_code!
    self.confirmation_code = "%06d" % SecureRandom.random_number(1_000_000)
    self.confirmation_code_sent_at = Time.current
    self.confirmation_sent_at = Time.current
    save!(validate: false)
  end

  def confirmation_code_valid?(code)
    code.present? &&
      ActiveSupport::SecurityUtils.secure_compare(code.to_s, confirmation_code.to_s) &&
      confirmation_code_sent_at && confirmation_code_sent_at >= 30.minutes.ago
  end

  after_create_commit do
    # 開発用 1分
    ::CleanupUnconfirmedUsersJob.set(wait: 1.minute).perform_later(id)
    # こっちは本番用
    # ::CleanupUnconfirmedUsersJob.set(wait: 48.hours).perform_later(id)
  end
end
