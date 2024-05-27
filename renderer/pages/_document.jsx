import Document, { Head, Html, Main, NextScript } from 'next/document'
// import i18next from '@/next-i18next.config.js'

export default class MyDocument extends Document {
  render() {
    const currentLocale = 'en'
    // this.props.__NEXT_DATA__.query.locale || i18next.i18n.defaultLocale
    return (
      <Html lang={currentLocale}>
        <Head />
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}
