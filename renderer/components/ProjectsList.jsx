import { useEffect, useState } from 'react'

import Link from 'next/link'
import { useRouter } from 'next/router'

import { useTranslation } from 'react-i18next'
import jszip from 'jszip'

import { JsonToPdf } from '@texttree/obs-format-convert-rcl'

import ListBox from './ListBox'
import Modal from './Modal'
import ChaptersMerger from './ChaptersMerger'

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

function ProjectsList({ projects, mutate }) {
  // const {
  //   i18n: { language: locale },
  //   t,
  // } = useTranslation(['common', 'projects'])
  const locale = 'ru'
  const t = () => {}
  const options = [
    { label: t('projects:ExportToPDF') || 'Export to PDF', value: 'pdf' },
    { label: t('projects:ExportToZIP') || 'Export to ZIP', value: 'zip' },
    // { label: t("projects:ExportToUSFM"), value: "usfm" },
  ]
  const { pathname } = useRouter()
  const [selectedOption, setSelectedOption] = useState(options[0].value)
  const [currentProject, setCurrentProject] = useState(null)
  const [isOpenModal, setIsOpenModal] = useState(false)

  useEffect(() => {
    mutate()
  }, [])

  const exportToPdf = (chapters) => {
    const book = []
    for (const chapterNum in chapters) {
      if (Object.hasOwnProperty.call(chapters, chapterNum)) {
        const chapter = Object.entries(chapters[chapterNum]).map(([k, v]) => ({
          verse: k,
          text: v.text,
          enabled: v.enabled,
        }))
        book.push({
          title: 'Chapter ' + chapterNum,
          verseObjects: chapter,
        })
      }
    }

    JsonToPdf({
      data: book,
      showImages: false,
      combineVerses: false,
      showChapterTitlePage: false,
      showVerseNumber: true,
      showPageFooters: false,
      styles,
    })
      .then(() => console.log('PDF creation completed'))
      .catch((error) => console.error('PDF creation failed:', error))
  }
  const exportToZip = (chapters) => {
    try {
      if (!chapters) {
        throw new Error(t('NoData' || 'No data'))
      }
      const jsonContent = JSON.stringify(chapters, null, 2)
      const zip = new jszip()
      const currentDate = new Date()
      const formattedDate = currentDate.toISOString().split('T')[0]
      const fileName = `chapters_${formattedDate}.json`
      zip.file(fileName, jsonContent)
      zip.generateAsync({ type: 'blob' }).then(function (content) {
        const blob = content
        const url = window.URL.createObjectURL(blob)
        const downloadLink = document.createElement('a')
        downloadLink.href = url
        downloadLink.download = `chapters_${formattedDate}.zip`
        document.body.appendChild(downloadLink)
        downloadLink.click()
        document.body.removeChild(downloadLink)
        window.URL.revokeObjectURL(url)
      })
    } catch (error) {
      console.log(error.message)
    }
  }
  const download = (project) => {
    const chapters = window.electronAPI.getBook(project.id)
    if (selectedOption === 'pdf') {
      exportToPdf(chapters)
    } else {
      exportToZip(chapters)
    }
  }
  return (
    <>
      <table className="border-collapse table-auto w-full text-sm">
        <thead>
          <tr>
            <th className="border-b font-medium p-4 pl-8 pt-0 pb-3 text-slate-400 text-left">
              {t('Book') || 'Book'}
            </th>
            <th className="border-b font-medium p-4 pl-8 pt-0 pb-3 text-slate-400 text-left">
              {t('projects:Project') || 'Project'}
            </th>
            <th className="border-b font-medium p-4 pl-8 pt-0 pb-3 text-slate-400 text-left">
              {t('projects:Method') || 'Method'}
            </th>
            <th className="border-b font-medium p-4 pl-8 pt-0 pb-3 text-slate-400 text-left">
              {t('ID') || 'ID'}
            </th>
            <th className="border-b font-medium p-4 pl-8 pt-0 pb-3 text-slate-400 text-left">
              {t('CreatedAt') || 'Created at'}
            </th>
            <th className="border-b font-medium p-4 pl-8 pt-0 pb-3 text-slate-400 text-left">
              {t('Download') || 'Download'}
            </th>
          </tr>
        </thead>
        <tbody className="bg-white">
          {projects.map((project) => (
            <tr key={project.id}>
              <td className="border-b border-slate-100 p-4 pl-8 text-slate-500">
                <Link
                  href={`${pathname.replace('[locale]', locale)}/project/${project.id}`}
                  legacyBehavior
                >
                  <a className="font-bold underline">
                    {project.book.name} ({project.book.code})
                  </a>
                </Link>
              </td>
              <td className="border-b border-slate-100 p-4 pl-8 text-slate-500">
                {project.name}
              </td>
              <td className="border-b border-slate-100 p-4 pl-8 text-slate-500">
                {project.method}
              </td>
              <td className="border-b border-slate-100 p-4 pl-8 text-slate-500">
                {project.id}
              </td>
              <td className="border-b border-slate-100 p-4 pl-8 text-slate-500">
                {new Date(project.createdAt).toLocaleDateString()}
              </td>
              <td className="border-b border-slate-100 p-4 pl-8 text-slate-500">
                <div
                  className="btn-primary w-fit"
                  onClick={() => {
                    setCurrentProject(project)
                    setIsOpenModal(true)
                  }}
                >
                  {t('Download') || 'Download'}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <Modal
        closeHandle={() => setIsOpenModal(false)}
        className={{
          dialogPanel:
            'w-full max-w-md align-middle p-6 bg-th-primary-100 text-th-text-secondary-100 overflow-y-visible rounded-3xl',
        }}
        isOpen={isOpenModal}
      >
        <ListBox
          selectedOption={selectedOption}
          setSelectedOption={setSelectedOption}
          options={options}
        />
        {selectedOption === 'usfm' && <ChaptersMerger book={currentProject.book.code} />}
        <div className="flex justify-center">
          <div className="flex gap-4 text-xl w-1/2">
            <button className="btn-primary flex-1" onClick={() => setIsOpenModal(false)}>
              {t('Close') || 'Close'}
            </button>
            {selectedOption !== 'usfm' && (
              <button
                className="btn-primary flex-1"
                onClick={() => download(currentProject)}
              >
                {t('Download') || 'Download'}
              </button>
            )}
          </div>
        </div>
      </Modal>
    </>
  )
}

export default ProjectsList
