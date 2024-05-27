import { useEffect, useState } from 'react'

export const useTranslation = (ns = 'common') => {
  if (!Array.isArray(ns)) {
    ns = [ns]
  }
  const [translation, setTranslation] = useState({})
  const [language, setLanguage] = useState('en')
  useEffect(() => {
    if (window) {
      setTranslation(window?.electronAPI?.getI18n(ns) ?? {})
      setLanguage(window?.electronAPI?.getLang() ?? 'en')
    }
  }, [ns.join(',')])
  useEffect(() => {
    window.electronAPI.localeChanged((data) => {
      setLanguage(data)
    })

    return () => {
      window.electronAPI.removeLocaleChanged()
    }
  }, [])
  return {
    t: (key) => {
      let ns
      if (key.split(':').length > 1) {
        ;[ns, key] = key.split(':')
      } else {
        ns = 'common'
      }
      return translation?.[ns]?.[key] || key
    },
    i18n: { changeLanguage: () => {}, language },
  }
}
