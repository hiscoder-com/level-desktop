import { useState, useEffect } from 'react'

import Link from 'next/link'
import { useRouter } from 'next/router'

import { useTranslation } from 'react-i18next'
import jszip from 'jszip'

import { JsonToPdf } from '@texttree/obs-format-convert-rcl'

import ListBox from './ListBox'
import Modal from './Modal'
import ChaptersMerger from './ChaptersMerger'
import Property from './Property'

import DownloadIcon from '../public/icons/download.svg'
import Gear from '../public/icons/gear.svg'

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

function ProjectsList() {
  const {
    i18n: { language: locale },
    t,
  } = useTranslation(['common', 'projects'])
  const options = [
    { label: t('projects:ExportToPDF'), value: 'pdf' },
    { label: t('projects:ExportToZIP'), value: 'zip' },
    { label: t('projects:ExportToUSFM'), value: 'usfm' },
  ]

  const { pathname } = useRouter()
  const [projectsList, setProjectsList] = useState([])
  const [selectedOption, setSelectedOption] = useState(options[0].value)
  const [currentProject, setCurrentProject] = useState(null)
  const [isOpenModal, setIsOpenModal] = useState(false)
  const [isOpenSettingsModal, setIsOpenSettingsModal] = useState(false)
  const [properties, setProperties] = useState(null)
  const [editedProperties, setEditedProperties] = useState({})

  useEffect(() => {
    setProjectsList(window.electronAPI.getProjects())
  }, [])

  useEffect(() => {
    if (currentProject) {
      const loadedProperties = window.electronAPI.getProperties(currentProject.id)

      if (loadedProperties.h === '') {
        loadedProperties.h = currentProject.book.name
      }

      setProperties(loadedProperties)
      setEditedProperties(loadedProperties)
    }
  }, [currentProject])

  useEffect(() => {
    const handleProjectNameUpdate = (event) => {
      const { projectId, newName } = event.detail
      setProjectsList((prevProjects) =>
        prevProjects.map((project) =>
          project.id === projectId
            ? { ...project, book: { ...project.book, name: newName } }
            : project
        )
      )
    }

    window.addEventListener('project-name-updated', handleProjectNameUpdate)

    return () => {
      window.removeEventListener('project-name-updated', handleProjectNameUpdate)
    }
  }, [])

  const exportToPdf = (chapters, project) => {
    const formattedDate = new Date().toISOString().split('T')[0]
    const fileName = `${project.name}_${project.book.code}_${formattedDate}`

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
      fileName,
      styles,
    })
      .then(() => console.log('PDF creation completed'))
      .catch((error) => console.error('PDF creation failed:', error))
  }

  const exportToZip = (chapters, project) => {
    try {
      if (!chapters || !project) {
        throw new Error(t('NoData'))
      }

      const jsonContent = JSON.stringify(chapters, null, 2)
      const zip = new jszip()
      const formattedDate = new Date().toISOString().split('T')[0]
      const fileName = `${project.name}_${project.book.code}_chapters_${formattedDate}.json`
      zip.file(fileName, jsonContent)
      zip.generateAsync({ type: 'blob' }).then(function (content) {
        const blob = content
        const url = window.URL.createObjectURL(blob)
        const downloadLink = document.createElement('a')
        downloadLink.href = url
        downloadLink.download = `${project.name}_${project.book.code}_chapters_${formattedDate}.zip`
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
      exportToPdf(chapters, project)
    } else {
      exportToZip(chapters, project)
    }
  }

  const updateEditedProperty = (text, property) => {
    setEditedProperties((prev) => ({
      ...prev,
      [property]: property === 'h' && text === '' ? currentProject.book.name : text,
    }))
  }

  const saveProperties = () => {
    setProperties(editedProperties)
    window.electronAPI.updateProperties(currentProject.id, editedProperties)
    if (editedProperties.h) {
      window.electronAPI.updateProjectName(currentProject.id, editedProperties.h)
    }
  }

  const handleSettingsModalClose = () => {
    setEditedProperties(properties)
    setIsOpenSettingsModal(false)
  }

  const renderProperties =
    properties &&
    Object.entries(properties)?.map(([property, content], index) => (
      <Property
        t={t}
        key={index}
        property={property}
        content={editedProperties[property] || content}
        onContentChange={updateEditedProperty}
      />
    ))

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
          {projectsList.map((project) => (
            <tr
              key={project.id}
              className="border-b border-th-secondary-200 text-th-primary-100"
            >
              <td className="p-4 pl-8">
                <Link
                  href={`${pathname.replace('[locale]', locale)}/project/${project.id}`}
                  legacyBehavior
                >
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
                <div className="flex justify-center gap-5 cursor-pointer">
                  <DownloadIcon
                    className="w-8 hover:opacity-70"
                    onClick={() => {
                      setCurrentProject(project)
                      setIsOpenModal(true)
                    }}
                  />
                  <Gear
                    className="w-8 hover:opacity-70"
                    onClick={() => {
                      setCurrentProject(project)
                      setIsOpenSettingsModal(true)
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
      <Modal
        title={`Project Settings`} //TODO перевод
        closeHandle={handleSettingsModalClose}
        isOpen={isOpenSettingsModal}
      >
        <div className="flex flex-col gap-4 mt-7">
          {renderProperties}
          <button className="btn-primary mt-2.5" onClick={saveProperties}>
            {t('Save')}
          </button>
        </div>
      </Modal>
    </>
  )
}

export default ProjectsList
