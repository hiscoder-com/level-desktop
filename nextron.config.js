module.exports = {
  webpack: (defaultConfig) => {
    return Object.assign(defaultConfig, {
      entry: {
        preload: './main/preload.js',
        background: './main/background.js',
      },
    })
  },
}
