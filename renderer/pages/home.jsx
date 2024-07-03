import Head from 'next/head'

import StartPage from '@/components/StartPage'

import { useTranslation } from '@/next-i18next'

export default function Home() {
  const { t } = useTranslation()
  return (
    <>
      <Head>
        <title>{t('V-CANA')}</title>
      </Head>
      <div className="text-2xl w-full">
        <StartPage />
      </div>
    </>
  )
}
