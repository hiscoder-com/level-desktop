import React from 'react'
import Head from 'next/head'

import { useTranslation } from '@/next-i18next'

import StartPage from '../components/StartPage'

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
