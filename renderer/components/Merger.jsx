import { useEffect, useRef, useState } from 'react'

import { useTranslation } from '@/next-i18next'
import JSZip from 'jszip'
import toast from 'react-hot-toast'

import Close from 'public/icons/close.svg'

function Merger({ config }) {
  const { t } = useTranslation(['common', 'projects', 'merger'])
  const [importedChapter, setImportedChapter] = useState(null)

  const fileInputRef = useRef()

  useEffect(() => {
    const handleUpdate = () => {
      setImportedChapter(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }

    window.electronAPI.onUpdateChapter(handleUpdate)

    return () => {
      window.electronAPI.removeUpdateChapterListener(handleUpdate)
    }
  }, [])
  function cleanData(obj) {
    return Object.fromEntries(
      Object.entries(obj).map(([key, value]) => {
        if (value.enabled === false) {
          return [key, { ...value, text: '', history: [] }]
        }
        return [key, value]
      })
    )
  }

  const exportChapterToZip = () => {
    const chapter = window.electronAPI.getChapter(config.id, config.chapter)

    try {
      if (!chapter) {
        throw new Error('error:NoData')
      }
      const ownedVerses = cleanData(chapter)
      const jsonContent = JSON.stringify({ [config.chapter]: ownedVerses }, null, 2)
      const zip = new JSZip()
      const currentDate = new Date()
      const formattedDate = currentDate.toISOString().replace(/:/g, '-').split('.')[0]
      const project = window.electronAPI.getProject(config.id)

      const fileName = `${project.project.code || 'project'}_${project.book.code || 'book'}_chapter${config.chapter ?? ''}_${config?.id.split('-')[0] || formattedDate}`

      zip.file(fileName + '.json', jsonContent)
      zip.generateAsync({ type: 'blob' }).then(function (content) {
        const blob = content
        const url = window.URL.createObjectURL(blob)
        const downloadLink = document.createElement('a')
        downloadLink.href = url
        downloadLink.download = fileName + '.zip'
        document.body.appendChild(downloadLink)
        downloadLink.click()
        document.body.removeChild(downloadLink)
        window.URL.revokeObjectURL(url)
      })
    } catch (error) {
      console.log(error.message)
    }
  }

  const importChapter = async (file) => {
    const zip = new JSZip()
    try {
      const zipContents = await zip.loadAsync(file[0])
      const fileNames = Object.keys(zipContents.files)
      const firstFileName = fileNames[0]
      if (firstFileName) {
        const fileContent = await zip.file(firstFileName).async('string')
        const jsonContent = JSON.parse(fileContent)
        setImportedChapter(jsonContent)
      } else {
        throw new Error('ZIP file is empty')
      }
    } catch (error) {
      console.error('Error reading ZIP file:', error)
    }
  }

  const merge = () => {
    if (!importedChapter || !importedChapter[config.chapter]) {
      return toast.error(t('WrongImportedData'))
    }
    const isUpdated = window.electronAPI.updateChapter(
      config.id,
      config.chapter,
      Object.values(importedChapter)[0]
    )
    if (isUpdated) {
      toast.success(t('ChapterUpdated'))
    } else {
      toast.error(t('WrongImportedData'))
    }
  }

  return (
    <div className="mx-auto flex w-1/2 flex-col gap-4">
      <div className="flex gap-2.5 border-b pb-4">
        <div>{t('merger:ExportText')}</div>
        <button onClick={() => exportChapterToZip()} className="btn-strong h-fit w-fit">
          {t('Export')}
        </button>
      </div>
      <div className="border-b pb-4">{t('merger:WaitModerator')}</div>
      <div className="flex gap-2.5 border-b pb-4">
        <div>{t('merger:Importext')}</div>
        <button
          className="btn-strong h-fit w-fit"
          onClick={() => {
            if (fileInputRef.current) {
              fileInputRef.current.click()
            }
          }}
          disabled={importedChapter}
        >
          {t('Import')}
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        onChange={(e) => e.target.files.length > 0 && importChapter(e.target.files)}
        style={{ display: 'none' }}
      />
      {importedChapter && (
        <>
          <div className="flex gap-2.5 border-b pb-4">
            <div className="flex w-fit items-center gap-2.5 rounded-full border border-th-text-primary px-5 py-4">
              <p>
                {t('Projects:Chapter')} {Object.keys(importedChapter)[0]}
              </p>
              <Close
                className="h-5 w-5 cursor-pointer stroke-2"
                onClick={() => {
                  setImportedChapter(null)
                  if (fileInputRef.current) {
                    fileInputRef.current.value = ''
                  }
                }}
              />
            </div>
          </div>
          <div className="flex justify-center gap-2.5 border-b pb-4">
            <button
              onClick={merge}
              className="btn-strong-quaternary w-fit"
              disabled={!importedChapter}
            >
              {t('Merge')}
            </button>
          </div>
        </>
      )}
    </div>
  )
}

export default Merger
