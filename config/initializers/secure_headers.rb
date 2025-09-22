SecureHeaders::Configuration.default do |config|
  config.cookies = {
    secure:   Rails.env.production? ? true : SecureHeaders::OPT_OUT,
    httponly: true,
    samesite: { lax: true }
  }

  config.x_frame_options = "DENY"
  config.x_content_type_options = "nosniff"
  config.referrer_policy = %w[strict-origin-when-cross-origin]
  config.hsts = "max-age=31536000; includeSubDomains" if Rails.env.production?
  config.csp = {
    default_src: %w['self'],
    img_src:     %w['self' data: blob:],
    style_src:   %w['self' 'unsafe-inline'],
    script_src:  %w['self'],
    font_src:    %w['self' data:],
    connect_src: %w['self' ws: wss:],
    frame_ancestors: %w['none']
  }
end
