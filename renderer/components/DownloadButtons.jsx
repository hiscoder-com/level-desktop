import { useState } from 'react'

import { useTranslation } from '@/next-i18next'
import {
  exportToPdf,
  exportToPdfObs,
  exportToUsfm,
  exportToZip,
} from '@/utils/exportHelpers'
import { Switch } from '@headlessui/react'
import toast from 'react-hot-toast'

import Modal from './Modal'

const DownloadButtons = ({ project, includeImages: includeImagesProp }) => {
  const { t } = useTranslation(['projects'])
  const isRtl = project?.language?.is_rtl || false

  const [showPdfOptionsModal, setShowPdfOptionsModal] = useState(false)
  const [includeImages, setIncludeImages] = useState(
    typeof includeImagesProp === 'boolean' ? includeImagesProp : false
  )
  const [doubleSided, setDoubleSided] = useState(false)

  const handlePdfExport = async () => {
    try {
      const chapters = window.electronAPI.getBook(project.id)
      await exportToPdfObs(t, chapters, project, isRtl, includeImages, doubleSided)
      setShowPdfOptionsModal(false)
    } catch (error) {
      console.error('Download error:', error)
      toast.error(t('projects:FailedToDownload'))
    }
  }

  const handleDownload = async (type) => {
    if (type === 'pdf') {
      if (project.typeProject === 'obs') {
        setShowPdfOptionsModal(true)
      } else {
        const chapters = window.electronAPI.getBook(project.id)
        exportToPdf(t, chapters, project)
      }
    } else {
      try {
        const chapters = window.electronAPI.getBook(project.id)
        if (type === 'usfm') {
          exportToUsfm(t, chapters, project)
        } else if (type === 'zip') {
          exportToZip(t, chapters, project)
        }
      } catch (error) {
        console.error('Download error:', error)
        toast.error(t('projects:FailedToDownload'))
      }
    }
  }

  return (
    <div className="flex cursor-pointer justify-end gap-5">
      {project.typeProject === 'obs' ? (
        <button
          className="rounded-md bg-th-primary-100 p-1 text-th-secondary-10 hover:opacity-70"
          onClick={(e) => {
            e.stopPropagation()
            handleDownload('zip')
          }}
        >
          ZIP
        </button>
      ) : (
        <button
          className="rounded-md bg-th-primary-100 p-1 text-th-secondary-10 hover:opacity-70"
          onClick={(e) => {
            e.stopPropagation()
            handleDownload('usfm')
          }}
        >
          USFM
        </button>
      )}
      <button
        className="rounded-md bg-th-primary-100 p-1 text-th-secondary-10 hover:opacity-70"
        onClick={(e) => {
          e.stopPropagation()
          handleDownload('pdf')
        }}
      >
        PDF
      </button>

      {showPdfOptionsModal && (
        <Modal
          title={t('projects:PrintingSettings')}
          isOpen={showPdfOptionsModal}
          closeHandle={() => setShowPdfOptionsModal(false)}
          className={{ contentBody: 'max-h-[70vh] overflow-y-auto px-6' }}
          isCloseButton
          buttons={
            <div className="flex w-full justify-center gap-7 pt-6">
              <button
                className="btn-secondary flex-1"
                onClick={() => setShowPdfOptionsModal(false)}
              >
                {t('projects:Cancel')}
              </button>
              <button className="btn-red flex-1" onClick={handlePdfExport}>
                {t('projects:Print')}
              </button>
            </div>
          }
        >
          <div
            className="flex flex-col gap-4"
            onClick={(e) => {
              e.stopPropagation()
            }}
          >
            <div className="flex items-center gap-4">
              <Switch
                checked={includeImages}
                onChange={setIncludeImages}
                className={`${
                  includeImages ? 'bg-th-secondary-200' : 'bg-th-secondary-400'
                } relative inline-flex h-6 w-11 items-center rounded-full transition-colors`}
              >
                <span
                  className={`${
                    includeImages ? 'translate-x-6' : 'translate-x-1'
                  } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                />
              </Switch>
              <span className="ml-3">{t('projects:PrintWithoutPics')}</span>
            </div>

            <div className="flex items-center gap-4">
              <Switch
                checked={doubleSided}
                onChange={setDoubleSided}
                className={`${
                  doubleSided ? 'bg-th-secondary-200' : 'bg-th-secondary-400'
                } relative inline-flex h-6 w-11 items-center rounded-full transition-colors`}
              >
                <span
                  className={`${
                    doubleSided ? 'translate-x-6' : 'translate-x-1'
                  } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                />
              </Switch>
              <span className="ml-3">{t('projects:OneSidedPrinting')}</span>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}

export default DownloadButtons
