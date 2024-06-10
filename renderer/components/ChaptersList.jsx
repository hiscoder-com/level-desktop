import Link from 'next/link'
import { useRouter } from 'next/router'

import { JsonToPdf } from '@texttree/obs-format-convert-rcl'
import { useTranslation } from 'react-i18next'

import DownloadPDF from '../public/icons/download-pdf.svg'

const styles = {
  currentPage: {
    fontSize: 16,
    alignment: 'center',
    bold: true,
    margin: [0, 10, 0, 0],
  },
  chapterTitle: { fontSize: 20, bold: true, margin: [0, 26, 0, 15] },
  verseNumber: { sup: true, bold: true, opacity: 0.8, margin: [0, 8, 8, 0] },
  defaultPageHeader: { bold: true, width: '50%' },
  text: { alignment: 'justify' },
}

function ChapterList({ id, chapters, steps, mutate }) {
  const {
    i18n: { language: locale },
    t,
  } = useTranslation(['projects', 'common'])
  const { pathname } = useRouter()

  const handleBackStep = (chapter, step) => {
    const backStep = window.electronAPI.goToStep(id, chapter, step - 1)
    if (backStep !== step) {
      mutate()
    }
  }
  const handleDownloadChapter = (chapter) => {
    const savedVerses = Object.entries(window.electronAPI.getChapter(id, chapter))
      .map(([k, v]) => ({ verse: k, text: v.text, enabled: v.enabled }))
      .filter((v) => v.enabled)

    const project = window.electronAPI.getProject(id)
    const currentDate = new Date().toISOString().split('T')[0]

    const fileName = `${project.project}_${project.book.code}_c_${chapter}_${currentDate}`

    JsonToPdf({
      data: [{ title: 'Chapter ' + chapter, verseObjects: savedVerses }],
      styles,
      fileName,
      showImages: false,
      combineVerses: false,
      showChapterTitlePage: false,
      showVerseNumber: true,
      bookPropertiesObs: {},
      showPageFooters: false,
    })
      .then(() => console.log('PDF creation completed'))
      .catch((error) => console.error('PDF creation failed:', error))
  }
  return (
    <table className="border-collapse table-auto w-full text-sm">
      <thead>
        <tr className="text-th-secondary-300 border-b border-th-secondary-200 cursor-default">
          <th className="font-medium pt-0 pr-4 pb-3 pl-8 text-left">{t('Chapter')}</th>
          <th className="font-medium pt-0 pr-4 pb-3 pl-8 text-left">{t('Step')}</th>
          <th className="font-medium pt-0 pr-4 pb-3 pl-8 text-center">{t('StepBack')}</th>
          <th className="font-medium pt-0 pr-4 pb-3 pl-8 text-center">
            {t('common:Download')}
          </th>
        </tr>
      </thead>
      <tbody className="bg-th-secondary-10">
        {chapters.map(([chapter, step]) => (
          <tr
            key={chapter}
            className="border-b border-th-secondary-200 text-th-primary-100"
          >
            <td className="p-4 pl-8">
              <Link
                href={`${pathname
                  .replace('[locale]', locale)
                  .replace('[id]', id)}/${chapter}/${step}`}
                legacyBehavior
              >
                <a className="font-bold hover:opacity-70">
                  {t('Chapter')} {chapter}
                </a>
              </Link>
            </td>
            <td className="p-4 pl-8 cursor-default">
              {steps[step].title} | {steps[step].intro}
            </td>
            <td className="p-4 pl-8">
              {step > 0 && (
                <div
                  className="btn-primary text-base select-none"
                  onClick={() => handleBackStep(chapter, step)}
                >
                  {t('BackToStep')} {step}
                </div>
              )}
            </td>
            <td className="p-4 pl-8">
              <div className="flex justify-center cursor-pointer">
                <DownloadPDF
                  className="w-8 hover:opacity-70"
                  onClick={() => handleDownloadChapter(chapter)}
                />
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export default ChapterList
