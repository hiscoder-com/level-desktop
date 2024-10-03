import Head from 'next/head'

import ChaptersMerger from '@/components/ChaptersMerger'
import { t } from 'i18next'

export default function ChapterMergerPage() {
  return (
    <>
      <Head>
        <title>{t('LEVEL')}</title>
      </Head>
      <div className="mx-auto mb-10 max-w-xs py-4 md:max-w-2xl xl:max-w-5xl 2xl:max-w-7xl">
        <ChaptersMerger />
      </div>
    </>
  )
}
