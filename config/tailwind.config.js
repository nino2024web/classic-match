// config/tailwind.config.js
module.exports = {
    content: [
      "./app/views/**/*.{erb,html}",
      "./app/helpers/**/*.rb",
      "./app/assets/stylesheets/**/*.{css,scss}",
      "./app/javascript/**/*.{js,ts}"
    ],
    theme: { extend: {} },
    plugins: []
  }
  