import { useEffect, useRef, useState } from 'react'

import { useRouter } from 'next/router'

import { useTranslation } from '@/next-i18next'
import CheckBox from '../components/CheckBox'

export default function UserAgreement() {
  const endOfTextRef = useRef(null)
  const [isChecked, setIsChecked] = useState(false)
  const [isDisabled, setIsDisabled] = useState(true)
  const [hasReadText, setHasReadText] = useState(false)
  const router = useRouter()
  const { t } = useTranslation(['user-agreement', 'common', 'users'])

  const handleClick = async () => {
    const agreements = JSON.parse(window.electronAPI.getItem('agreements'))
    window.electronAPI.setItem(
      'agreements',
      JSON.stringify({ ...agreements, userAgreement: isChecked })
    )
    router.push(`/agreements`)
  }

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasReadText) {
          setIsDisabled(false)
          setHasReadText(true)
        }
      },
      { root: null, rootMargin: '0px', threshold: 1 }
    )

    if (endOfTextRef.current) {
      observer.observe(endOfTextRef.current)
    }

    return () => {
      if (endOfTextRef.current) {
        observer.unobserve(endOfTextRef.current)
      }
    }
  }, [hasReadText])

  return (
    <div className="layout-appbar">
      <div
        className="max-w-7xl pb-6 px-6 lg:px-8 bg-th-secondary-10 rounded-lg text-justify overflow-auto text-th-text-primary"
        style={{ height: 'calc(100vh - 15rem)' }}
      >
        <h1 className="pt-4 text-2xl md:text-4xl">{t('users:Agreement')}:</h1>
        <div className="mt-7 text-sm">
          <b className="font-bold">{t('License')}</b>
          <p
            dangerouslySetInnerHTML={{
              __html: t('TextLicense', {
                interpolation: { escapeValue: false },
              }),
            }}
            className="py-4"
          />
          <b className="font-bold">{t('Recommendations')}</b>
          <p
            dangerouslySetInnerHTML={{
              __html: t('TextRecommendation', {
                interpolation: { escapeValue: false },
              }),
            }}
            className="py-4"
          />
          <b className="font-bold">{t('Definition')}</b>
          <p
            dangerouslySetInnerHTML={{
              __html: t('TextDefinition', {
                interpolation: { escapeValue: false },
              }),
            }}
            className="pt-4"
          />
          <div ref={endOfTextRef} className="h-0.5"></div>
        </div>
      </div>
      <div className="flex flex-row items-center space-x-6">
        <CheckBox
          onChange={() => setIsChecked((prev) => !prev)}
          checked={isChecked}
          disabled={isDisabled}
          label={t('users:Agree')}
        />
        <button className="btn-primary" onClick={handleClick} disabled={!isChecked}>
          {t('common:Next')}
        </button>
      </div>
    </div>
  )
}
