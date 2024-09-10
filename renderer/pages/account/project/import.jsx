import Head from 'next/head'

import { useTranslation } from '@/next-i18next'
import ImportProject from '@/components/ImportProject'

function Project() {
  const { t } = useTranslation(['common', 'projects'])

  return (
    <>
      <Head>
        <title>{t('V-CANA')}</title>
      </Head>
      <div className="py-4 mb-10 max-w-xs md:max-w-2xl xl:max-w-5xl 2xl:max-w-7xl mx-auto">
        <ImportProject />
      </div>
    </>
  )
}

export default Project
