const webpack = require('webpack')
require('dotenv').config({ path: './renderer/.env' })
module.exports = {
  webpack: (defaultConfig) => {
    defaultConfig.plugins.push(
      new webpack.DefinePlugin({
        'process.env.NEXT_PUBLIC_SUPABASE_URL': JSON.stringify(
          process.env.NEXT_PUBLIC_SUPABASE_URL
        ),
        'process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY': JSON.stringify(
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        ),
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
