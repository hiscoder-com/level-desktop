import { useEffect, useMemo, useState } from 'react'

import { useRouter } from 'next/router'

import { convertBookChapters, convertToUsfm } from '@/helpers/usfm'
import { useTranslation } from '@/next-i18next'
import { Field, Label, Switch } from '@headlessui/react'
import { JsonToPdf } from '@texttree/obs-format-convert-rcl'
import toast from 'react-hot-toast'

import Modal from './Modal'
import Property from './Property'

import Gear from 'public/icons/gear.svg'

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

  const [currentProject, setCurrentProject] = useState(null)
  const [isOpenSettingsModal, setIsOpenSettingsModal] = useState(false)
  const [properties, setProperties] = useState(null)
  const [editedProperties, setEditedProperties] = useState({})
  const [isConfirmDelete, setIsConfirmDelete] = useState(false)
  const [showIntro, setShowIntro] = useState(true)

  useEffect(() => {
    const loadProjects = () => {
      try {
        const projects = window.electronAPI.getProjects()
        if (projects) {
          setProjectsList(projects)
        } else {
          throw new Error('No projects found')
        }
      } catch (error) {
        console.error('Failed to load projects:', error)
        toast.error(t('common:FailedToLoadProjects'))
      }
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
    if (!currentProject) return
    try {
      const loadedProperties = window.electronAPI.getProperties(currentProject.id)
      if (!loadedProperties) throw new Error('Failed to load project properties')

      if (loadedProperties.h === '') {
        loadedProperties.h = currentProject.book.name
      }

      setProperties(loadedProperties)
      setEditedProperties(loadedProperties)
    } catch (error) {
      console.error('Failed to load project properties:', error)
      toast.error(t('projects:FailedToLoadProperties'))
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
    try {
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
        .catch((error) => {
          console.error('PDF creation failed:', error)
          toast.error(t('projects:FailedToCreatePDF'))
        })
    } catch (error) {
      console.error('Error during PDF export:', error)
      toast.error(t('projects:ErrorExportingPDF'))
    }
  }

  const exportToUsfm = (chapters, project) => {
    if (!project) {
      return
    }
    try {
      const bookProperties = window.electronAPI.getProperties(project.id)
      if (!bookProperties) throw new Error('Failed to load book properties')

      const convertedBook = convertBookChapters(chapters)
      const { h, toc1, toc2, toc3, mt, chapter_label } = bookProperties
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
      document.body.removeChild(link)
    } catch (error) {
      console.error('Error during USFM export:', error)
      toast.error(t('projects:ErrorExportingUSFM'))
    }
  }

  const download = (project, type) => {
    try {
      const chapters = window.electronAPI.getBook(project.id)

      if (type === 'pdf') {
        exportToPdf(chapters, project)
      } else if (type === 'usfm') {
        exportToUsfm(chapters, project)
      }
    } catch (error) {
      console.error('Download error:', error)
      toast.error(t('projects:FailedToDownload'))
    }
  }

  const updateEditedProperty = (text, property) => {
    setEditedProperties((prev) => ({
      ...prev,
      [property]: property === 'h' && text === '' ? currentProject.book.name : text,
    }))
  }

  const saveProperties = () => {
    try {
      setProperties(editedProperties)
      toast.success(t('projects:UpdatedProjectSettings'))
      window.electronAPI.updateProperties(currentProject.id, editedProperties)
      if (editedProperties.h) {
        window.electronAPI.updateProjectName(currentProject.id, editedProperties.h)
      }
    } catch (error) {
      console.error('Failed to save properties:', error)
      toast.error(t('projects:FailedToSaveProperties'))
    }
    setIsOpenSettingsModal(false)
  }

  const handleSettingsModalClose = () => {
    setEditedProperties(properties)
    setIsOpenSettingsModal(false)
  }

  const renderProperties = useMemo(() => {
    return (
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
    )
  }, [properties, editedProperties])

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
      <div className="h-7 rounded-t-lg bg-th-primary-100"></div>
      <div className="flex h-16 items-center border-b border-th-secondary-200 bg-th-secondary-10 pl-8 text-lg font-bold">
        {t('common:Projects')}
      </div>
      <table className="w-full table-auto border-collapse text-sm">
        <thead>
          <tr className="text-th-primary cursor-default border-b border-th-secondary-200 bg-th-secondary-10 text-left font-bold">
            <th className="py-4 pl-8">{t('Book')}</th>
            <th className="py-4 pl-8">{t('projects:Project')}</th>
            <th className="py-4 pl-8">{t('CreatedAt')}</th>
            <th className="py-4 pl-8">{t('common:Settings')}</th>
            <th className="flex justify-end px-8 py-4">
              <span>{t('common:Download')}</span>
            </th>
          </tr>
        </thead>
        <tbody className="bg-th-secondary-10">
          {projectsList.map((project) => (
            <tr
              key={project.id}
              className="cursor-pointer border-b border-th-secondary-200 text-th-primary-100 hover:bg-th-secondary-20"
              onClick={() => router.push(`/account/project/${project.id}`)}
            >
              <td className="py-4 pl-8">
                <span className="rounded bg-th-secondary-100 px-3 py-2">
                  {project.book.name}
                </span>
              </td>
              <td className="py-4 pl-8">
                <span className="rounded bg-th-secondary-100 px-3 py-2">
                  {project.name}
                </span>
              </td>
              <td className="py-4 pl-8">
                <span className="rounded bg-th-secondary-100 px-3 py-2">
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
              <td className="px-8 py-4">
                <div className="flex cursor-pointer justify-end gap-5">
                  <button
                    className="rounded-md bg-th-primary-100 p-1 text-th-secondary-10 hover:opacity-70"
                    onClick={(e) => {
                      e.stopPropagation()
                      download(project, 'usfm')
                    }}
                  >
                    USFM
                  </button>
                  <button
                    className="rounded-md bg-th-primary-100 p-1 text-th-secondary-10 hover:opacity-70"
                    onClick={(e) => {
                      e.stopPropagation()
                      download(project, 'pdf')
                    }}
                  >
                    PDF
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
            <div className="flex w-2/3 justify-center gap-7 self-center pt-6">
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
            <div className="flex w-2/3 justify-center gap-7 self-center">
              <button className="btn-red flex-1" onClick={() => setIsConfirmDelete(true)}>
                {t('projects:Delete')}
              </button>
              <button className="btn-secondary flex-1" onClick={saveProperties}>
                {t('Save')}
              </button>
            </div>
          )
        }
      >
        {isConfirmDelete ? (
          <div className="flex flex-col items-center gap-7">
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
                  className={`pointer-events-none inline-block size-5 rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    showIntro ? 'translate-x-0' : 'translate-x-7'
                  }`}
                />
              </Switch>
              <Label>
                {showIntro
                  ? t('projects:DisableStepDescription')
                  : t('projects:EnableStepDescription')}
              </Label>
            </Field>
          </div>
        )}
      </Modal>
    </>
  )
}

export default ProjectsList
