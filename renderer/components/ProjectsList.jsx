import { useState, useEffect } from 'react'

import toast from 'react-hot-toast'
import jszip from 'jszip'
import { JsonToPdf } from '@texttree/obs-format-convert-rcl'

import Modal from './Modal'
import Property from './Property'

import { useTranslation } from '@/next-i18next'
import { convertToUsfm, convertBookChapters } from '@/helpers/usfm'

import Gear from 'public/icons/gear.svg'
import { useRouter } from 'next/router'
import { Switch, Label, Field } from '@headlessui/react'

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

function ProjectsList({ projectsList, setProjectsList }) {
  const { t } = useTranslation(['common', 'projects'])
  const router = useRouter()

  const options = [
    { label: t('projects:ExportToPDF'), value: 'pdf' },
    { label: t('projects:ExportToZIP'), value: 'zip' },
    { label: t('projects:ExportToUSFM'), value: 'usfm' },
  ]

  const [selectedOption, setSelectedOption] = useState(options[0].value)
  const [currentProject, setCurrentProject] = useState(null)
  const [isOpenSettingsModal, setIsOpenSettingsModal] = useState(false)
  const [properties, setProperties] = useState(null)
  const [editedProperties, setEditedProperties] = useState({})
  const [isConfirmDelete, setIsConfirmDelete] = useState(false)
  const [showIntro, setShowIntro] = useState(true)

  useEffect(() => {
    const loadProjects = () => {
      const projects = window.electronAPI.getProjects()
      setProjectsList(projects || [])
    }

    loadProjects()

    const handleProjectsUpdated = (updatedProjects) => {
      setProjectsList(updatedProjects || [])
    }

    const unsubscribe = window.ipc.on('projects-updated', handleProjectsUpdated)

    return () => {
      unsubscribe()
    }
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

  useEffect(() => {
    if (!currentProject) return

    const config = window.electronAPI.getProject(currentProject.id)
    setShowIntro(config.showIntro)
  }, [currentProject])

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
      styles,
      fileName,
      showImages: false,
      showChapterTitlePage: false,
      showVerseNumber: true,
      showPageFooters: false,
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

  const exportToUsfm = (chapters, project) => {
    const convertedBook = convertBookChapters(chapters)
    const { h, toc1, toc2, toc3, mt, chapter_label } = properties
    const formattedDate = new Date().toISOString().split('T')[0]
    const fileName = `${project.name}_${project.book.code}_${formattedDate}`

    const merge = convertToUsfm({
      jsonChapters: convertedBook,
      book: {
        code: project.book.code,
        properties: {
          scripture: {
            h,
            toc1,
            toc2,
            toc3,
            mt,
            chapter_label,
          },
        },
      },
      project: { code: '', language: { code: '', orig_name: '' }, title: '' },
    })

    const blob = new Blob([merge], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `${fileName}.usfm`)
    document.body.appendChild(link)
    link.click()
  }

  const download = (project) => {
    const chapters = window.electronAPI.getBook(project.id)

    if (selectedOption === 'pdf') {
      exportToPdf(chapters, project)
    } else if (selectedOption === 'usfm') {
      exportToUsfm(chapters, project)
    } else {
      exportToZip(chapters, project)
    }
    setSelectedOption(null)
  }

  const updateEditedProperty = (text, property) => {
    setEditedProperties((prev) => ({
      ...prev,
      [property]: property === 'h' && text === '' ? currentProject.book.name : text,
    }))
  }

  const saveProperties = () => {
    setProperties(editedProperties)
    toast.success(t('projects:UpdatedProjectSettings'))
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

  const projectRemove = (id) => {
    window.electronAPI.deleteProject(id)
  }

  const handleShowIntroChange = (e) => {
    setShowIntro((prev) => {
      window.electronAPI.updateProjectConfig(currentProject.id, { showIntro: !prev })
      return !prev
    })
  }

  return (
    <>
      <div className="h-7 bg-th-primary-100 rounded-t-lg"></div>
      <div className="pl-8 h-16 bg-th-secondary-10 border-b border-th-secondary-200 flex items-center font-bold text-lg">
        {t('common:Projects')}
      </div>
      <table className="border-collapse table-auto w-full text-sm">
        <thead>
          <tr className="text-left font-bold text-th-primary border-b border-th-secondary-200 bg-th-secondary-10 cursor-default">
            <th className="py-4 pl-8">{t('Book')}</th>
            <th className="py-4 pl-8">{t('projects:Project')}</th>
            <th className="py-4 pl-8">{t('CreatedAt')}</th>
            <th className="py-4 pl-8">{t('Settings')}</th>
            <th className="py-4 px-8 flex justify-end">
              <span>{t('common:Download')}</span>
            </th>
          </tr>
        </thead>
        <tbody className="bg-th-secondary-10">
          {projectsList.map((project) => (
            <tr
              key={project.id}
              className="border-b border-th-secondary-200 text-th-primary-100 hover:bg-th-secondary-20
               cursor-pointer"
              onClick={() => router.push(`/account/project/${project.id}`)}
            >
              <td className="py-4 pl-8">
                <span className="px-3 py-2 bg-th-secondary-100 rounded">
                  {project.book.name}
                </span>
              </td>
              <td className="py-4 pl-8">
                <span className="px-3 py-2 bg-th-secondary-100 rounded">
                  {project.name}
                </span>
              </td>
              <td className="py-4 pl-8">
                <span className="px-3 py-2 bg-th-secondary-100 rounded">
                  {new Date(project.createdAt).toLocaleDateString()}
                </span>
              </td>
              <td className="py-4 pl-8">
                <Gear
                  className="w-5 hover:opacity-70"
                  onClick={(e) => {
                    e.stopPropagation()
                    setCurrentProject(project)
                    setIsOpenSettingsModal(true)
                  }}
                />
              </td>
              <td className="py-4 px-8">
                <div className="flex justify-end gap-5 cursor-pointer">
                  <button
                    className="bg-th-primary-100 text-th-secondary-10 p-1 rounded-md hover:opacity-70"
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedOption('usfm')
                      download(project)
                    }}
                  >
                    USFM
                  </button>
                  <button
                    className="bg-th-primary-100 text-th-secondary-10 p-1 rounded-md hover:opacity-70"
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedOption('pdf')
                      download(project)
                    }}
                  >
                    PDF
                  </button>
                  <button
                    className="bg-th-primary-100 text-th-secondary-10 p-1 rounded-md hover:opacity-70"
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedOption('zip')
                      download(project)
                    }}
                  >
                    ZIP
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <Modal
        title={
          isConfirmDelete ? t('projects:ProjectDelete') : t('projects:ProjectSettings')
        }
        closeHandle={
          isConfirmDelete ? () => setIsConfirmDelete(false) : handleSettingsModalClose
        }
        isOpen={isOpenSettingsModal}
        className={{
          contentBody: 'max-h-[70vh] overflow-y-auto px-6',
        }}
        isCloseButton
        buttons={
          isConfirmDelete ? (
            <div className="flex justify-center self-center gap-7 w-2/3 pt-6">
              <button
                className="btn-secondary flex-1"
                onClick={() => {
                  projectRemove(currentProject.id)
                  setIsOpenSettingsModal(false)
                  setIsConfirmDelete(false)
                  toast.success(t('projects:ProjectDeleted'))
                }}
              >
                {t('Yes')}
              </button>
              <button
                className="btn-secondary flex-1"
                onClick={() => setIsConfirmDelete(false)}
              >
                {t('No')}
              </button>
            </div>
          ) : (
            <div className="flex justify-center self-center gap-7 w-2/3">
              <button className="btn-red flex-1" onClick={() => setIsConfirmDelete(true)}>
                {t('Delete')}
              </button>
              <button className="btn-secondary flex-1" onClick={saveProperties}>
                {t('Save')}
              </button>
            </div>
          )
        }
      >
        {isConfirmDelete ? (
          <div className="flex flex-col gap-7 items-center">
            <div className="text-center text-2xl">
              {t('AreYouSureDelete') + ' ' + currentProject?.book.name + '?'}
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {renderProperties}
            <Field className="flex items-center gap-4 font-bold">
              <Switch
                checked={showIntro}
                onChange={handleShowIntroChange}
                className={`group relative flex h-7 w-14 cursor-pointer rounded-full p-1 transition-colors duration-200 ease-in-out focus:outline-none data-[focus]:outline-1 data-[focus]:outline-white ${
                  !showIntro ? 'bg-th-secondary-400' : 'bg-th-secondary-200'
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`pointer-events-none inline-block size-5 rounded-full bg-white ring-0 shadow-lg transition duration-200 ease-in-out ${
                    showIntro ? 'translate-x-0' : 'translate-x-7'
                  }`}
                />
              </Switch>
              <Label>
                {showIntro ? t('projects:DisableIntro') : t('projects:EnableIntro')}
              </Label>
            </Field>
          </div>
        )}
      </Modal>
    </>
  )
}

export default ProjectsList
