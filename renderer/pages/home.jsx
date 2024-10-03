import Head from 'next/head'

import StartPage from '@/components/StartPage'
import { useTranslation } from '@/next-i18next'

export default function Home() {
  const { t } = useTranslation()
  return (
    <>
      <Head>
        <title>{t('LEVEL')}</title>
      </Head>
      <div className="w-full text-2xl">
        <StartPage />
      </div>
    </>
  )
}
