const webpack = require('webpack')
const dotenv = require('dotenv')
const path = require('path')

const ENV = process.env.NODE_ENV || 'local'

const envPath = path.resolve(__dirname, `./renderer/.env.${ENV}`)
dotenv.config({ path: envPath })

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
        'process.env.CONNECT_TO_WEB': JSON.stringify(process.env.CONNECT_TO_WEB),
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
