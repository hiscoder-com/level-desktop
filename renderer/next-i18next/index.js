export const useTranslation = (ns) => {
  const lang = useParams()
  window.electronAPI.getLanguage()
  const ret = useTranslationOrg(ns)
  const [translation, setTranslation] = useState(ret)
  const { i18n } = translation
  // if (runsOnServerSide && i18n.resolvedLanguage !== lang.lng) {
  //   i18n.changeLanguage(lang.lng)
  // }
  useEffect(() => {
    // if(!runsOnServerSide && i18n.resolvedLanguage !== lang.lng){
    //   i18n.changeLanguage(lang.lng)
    // }
    setTranslation((state) => ({ ...state, t: i18n.getFixedT(lang.lng, ns) }))
  }, [lang.lng])
  // return translation
  return {
    t: (key) => key,
    i18n: { changeLanguage: () => {}, language: 'en' },
  }
}
