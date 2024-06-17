import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import backend from 'i18next-electron-fs-backend'

i18n
  .use(backend)
  .use(initReactI18next)
  .init({
    backend: {
      loadPath: './app/localization/locales/{{lng}}/{{ns}}.json',
      addPath: './app/localization/locales/{{lng}}/{{ns}}.missing.json',
      contextBridgeApiKey: 'api', // needs to match first parameter of contextBridge.exposeInMainWorld in preload file; defaults to "api"
    },

    // other options you might configure
    debug: true,
    // saveMissing: true,
    // saveMissingTo: 'current',
    lng: 'en',
  })

export default i18n
