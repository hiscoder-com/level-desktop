import Head from 'next/head'

import ImportProject from '@/components/ImportProject'
import { useTranslation } from '@/next-i18next'

function Project() {
  const { t } = useTranslation(['common', 'projects'])

  return (
    <>
      <Head>
        <title>{t('LEVEL')}</title>
      </Head>
      <div className="mx-auto mb-10 max-w-xs py-4 md:max-w-2xl xl:max-w-5xl 2xl:max-w-7xl">
        <ImportProject />
      </div>
    </>
  )
}

export default Project
