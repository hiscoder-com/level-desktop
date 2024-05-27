import { useState } from 'react'

import Link from 'next/link'
import { useRouter } from 'next/router'

import { useTranslation } from '@/next-i18next'
import jszip from 'jszip'

import { JsonToPdf } from '@texttree/obs-format-convert-rcl'

import ListBox from './ListBox'
import Modal from './Modal'
import ChaptersMerger from './ChaptersMerger'

import DownloadIcon from '../public/icons/download.svg'

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

function ProjectsList({ projects }) {
  const { t } = useTranslation(['common', 'projects'])
  const options = [
    { label: t('projects:ExportToPDF'), value: 'pdf' },
    { label: t('projects:ExportToZIP'), value: 'zip' },
    { label: t('projects:ExportToUSFM'), value: 'usfm' },
  ]
  const [selectedOption, setSelectedOption] = useState(options[0].value)
  const [currentProject, setCurrentProject] = useState(null)
  const [isOpenModal, setIsOpenModal] = useState(false)
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
        throw new Error(t('NoData'))
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
          <tr className="text-left text-th-secondary-300 border-b border-th-secondary-200 cursor-default">
            <th className="font-medium pt-0 pr-4 pb-3 pl-8">{t('Book')}</th>
            <th className="font-medium pt-0 pr-4 pb-3 pl-8">{t('projects:Project')}</th>
            <th className="font-medium pt-0 pr-4 pb-3 pl-8">{t('projects:Method')}</th>
            <th className="font-medium pt-0 pr-4 pb-3 pl-8">{t('ID')}</th>
            <th className="font-medium pt-0 pr-4 pb-3 pl-8">{t('CreatedAt')}</th>
            <th className="font-medium pt-0 pr-4 pb-3 pl-8"></th>
          </tr>
        </thead>
        <tbody className="bg-th-secondary-10">
          {projects.map((project) => (
            <tr
              key={project.id}
              className="border-b border-th-secondary-200 text-th-primary-100"
            >
              <td className="p-4 pl-8">
                <Link href={`/account/project/${project.id}`} legacyBehavior>
                  <a className="font-bold underline">
                    {project.book.name} ({project.book.code})
                  </a>
                </Link>
              </td>
              <td className="p-4 pl-8">{project.name}</td>
              <td className="p-4 pl-8">{project.method}</td>
              <td className="p-4 pl-8">{project.id}</td>
              <td className="p-4 pl-8">
                {new Date(project.createdAt).toLocaleDateString()}
              </td>
              <td className="p-4 pl-8">
                <div className="flex justify-center cursor-pointer">
                  <DownloadIcon
                    className="w-8 hover:opacity-70"
                    onClick={() => {
                      setCurrentProject(project)
                      setIsOpenModal(true)
                    }}
                  />
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
              {t('Close')}
            </button>
            {selectedOption !== 'usfm' && (
              <button
                className="btn-primary flex-1"
                onClick={() => download(currentProject)}
              >
                {t('Download')}
              </button>
            )}
          </div>
        </div>
      </Modal>
    </>
  )
}

export default ProjectsList
