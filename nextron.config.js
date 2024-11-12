const webpack = require('webpack')
require('dotenv').config({ path: './renderer/.env' })
module.exports = {
  webpack: (defaultConfig) => {
    defaultConfig.plugins.push(
      new webpack.DefinePlugin({
        'process.env': JSON.stringify(process.env),
      })
    )

    return Object.assign(defaultConfig, {
      entry: {
        preload: './main/preload.js',
        background: './main/background.js',
      },
    })
  },
}
