import { useState } from 'react'

import { useRouter } from 'next/router'

import { useTranslation } from 'next-i18next'
import CheckBox from '../../components/CheckBox'
import { getStaticPaths, makeStaticProperties } from '../../lib/get-static'

export default function UserAgreement() {
  const [isChecked, setIsChecked] = useState(false)
  const router = useRouter()
  const {
    i18n: { language: locale },
    t,
  } = useTranslation(['user-agreement', 'common', 'users'])
  const handleClick = async () => {
    const agreements = JSON.parse(window.electronAPI.getItem('agreements'))
    window.electronAPI.setItem(
      'agreements',
      JSON.stringify({ ...agreements, userAgreement: isChecked })
    )
    router.push(`/${locale}/agreements`)
  }

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
        </div>
      </div>
      <CheckBox
        onChange={() => setIsChecked((prev) => !prev)}
        checked={isChecked}
        label={t('users:Agree')}
      />

      <button className="btn-primary" onClick={handleClick} disabled={!isChecked}>
        {t('common:Next')}
      </button>
    </div>
  )
}

export const getStaticProps = makeStaticProperties(['user-agreement', 'common', 'users'])

export { getStaticPaths }
