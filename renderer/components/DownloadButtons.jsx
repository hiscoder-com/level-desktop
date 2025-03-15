import { useTranslation } from '@/next-i18next'
import {
  exportToPdf,
  exportToPdfObs,
  exportToUsfm,
  exportToZip,
} from '@/utils/exportHelpers'
import toast from 'react-hot-toast'

const DownloadButtons = ({ project }) => {
  const { t } = useTranslation(['projects'])

  const handleDownload = async (type) => {
    try {
      const chapters = window.electronAPI.getBook(project.id)
      if (type === 'pdf') {
        if (project.typeProject !== 'obs') {
          exportToPdf(t, chapters, project)
        } else {
          await exportToPdfObs(t, chapters, project)
        }
      } else if (type === 'usfm') {
        exportToUsfm(t, chapters, project)
      } else if (type === 'zip') {
        exportToZip(t, chapters, project)
      }
    } catch (error) {
      console.error('Download error:', error)
      toast.error(t('projects:FailedToDownload'))
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
    </div>
  )
}

export default DownloadButtons
