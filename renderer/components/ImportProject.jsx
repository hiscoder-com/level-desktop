import Link from 'next/link'
import Left from 'public/icons/left.svg'
import { useTranslation } from '@/next-i18next'
import { useState } from 'react'
import toast from 'react-hot-toast'

function ImportProject() {
  const { t } = useTranslation(['common', 'projects'])
  const [fileUrl, setFileUrl] = useState(false)
  const onSubmit = async (e) => {
    e.preventDefault()
    try {
      await window.electronAPI.addProject(fileUrl)
      toast.success(t('projects:SuccessfullyAddedProject'))
    } catch (error) {
      console.error('Failed to add project:', error)
      toast.error(t('projects:FailedAddProject'))
    }
  }

  return (
    <>
      <div className="h-7 bg-th-primary-100 rounded-t-lg"></div>
      <div className="flex h-16 border-b border-th-secondary-200 items-center text-lg bg-th-secondary-10 ">
        <Link className="pl-8 flex items-center" href="/account">
          <Left className="w-6 stroke-th-secondary-300" />
          <span className="text-th-secondary-300 text-sm ml-2.5">
            {t('common:Projects')}
          </span>
        </Link>
        <span className="ml-6 font-bold text-lg inline">{t('common:Import')}</span>
      </div>
      <div className="flex border-b border-th-secondary-200 items-center text-lg bg-th-secondary-10 rounded-b-lg px-8 py-8">
        <form onSubmit={onSubmit}>
          <div className="flex flex-col gap-4">
            <button
              className="btn-primary text-base mt-3 w-fit"
              onClick={async (e) => {
                e.preventDefault()
                const filePath = await window.electronAPI.openFile()
                setFileUrl(filePath)
              }}
            >
              {t('projects:SelectArchiveProject')}
            </button>
            <p className="my-6 text-center opacity-40">{fileUrl || t('NotSelected')}</p>
            <input
              className="btn-primary text-base mt-3 mr-3 w-fit"
              type="submit"
              value={t('Import')}
              disabled={!fileUrl}
            />
          </div>
        </form>
      </div>
    </>
  )
}

export default ImportProject
