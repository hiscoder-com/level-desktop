import ChaptersMerger from '@/components/ChaptersMerger'
import { t } from 'i18next'
import Head from 'next/head'

export default function ChapterMergerPage() {
  return (
    <>
      <Head>
        <title>{t('V-CANA')}</title>
      </Head>
      <div className="py-4 mb-10 max-w-xs md:max-w-2xl xl:max-w-5xl 2xl:max-w-7xl mx-auto">
        <ChaptersMerger />
      </div>
    </>
  )
}
