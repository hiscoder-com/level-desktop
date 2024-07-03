import { useRef, useState, useEffect } from 'react'

import { useTranslation } from '@/next-i18next'
import JSZip from 'jszip'
import toast from 'react-hot-toast'

import Close from 'public/icons/close.svg'

function Merger({ config }) {
  const { t } = useTranslation(['common', 'projects'])
  const [importedChapter, setImportedChapter] = useState(null)

  const fileInputRef = useRef()

  useEffect(() => {
    const handleUpdate = () => {
      setImportedChapter(null)
    }

    window.electronAPI.onUpdateChapter(handleUpdate)

    return () => {
      window.electronAPI.removeUpdateChapterListener(handleUpdate)
    }
  }, [])

  const exportChapterToZip = () => {
    const chapter = window.electronAPI.getChapter(config.id, config.chapter)
    try {
      if (!chapter) {
        throw new Error('error:NoData')
      }
      const jsonContent = JSON.stringify({ [config.chapter]: chapter }, null, 2)
      const zip = new JSZip()
      const currentDate = new Date()
      const formattedDate = currentDate.toISOString().replace(/:/g, '-').split('.')[0]
      const fileName = `chapter_${formattedDate}.json`
      zip.file(fileName, jsonContent)
      zip.generateAsync({ type: 'blob' }).then(function (content) {
        const blob = content
        const url = window.URL.createObjectURL(blob)
        const downloadLink = document.createElement('a')
        downloadLink.href = url
        downloadLink.download = `chapter${config.chapter ?? ''}_${formattedDate}.zip`
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
    window.electronAPI.updateChapter(
      config.id,
      config.chapter,
      Object.values(importedChapter)[0]
    )
    toast.success(t('ChapterUpdated'))
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2.5 pb-4 border-b">
        <button onClick={() => exportChapterToZip()} className="w-fit btn-strong">
          {t('ExportArchive')}
        </button>
        <button
          className="w-fit btn-strong"
          onClick={() => fileInputRef.current.click()}
          disabled={importedChapter}
        >
          {t('ImportArchive')}
        </button>
        <button
          onClick={() => merge()}
          className="btn-strong w-fit"
          disabled={!importedChapter}
        >
          {t('MergeVerses')}
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        onChange={(e) => e.target.files.length > 0 && importChapter(e.target.files)}
        style={{ display: 'none' }}
      />

      {importedChapter && (
        <div className="flex items-center gap-2.5 py-4 px-5 border w-fit rounded-full border-th-text-primary">
          <p>
            {t('Projects:Chapter')} {Object.keys(importedChapter)[0]}
          </p>
          <Close
            className="w-5 h-5 cursor-pointer stroke-2"
            onClick={() => {
              setImportedChapter(null)
              if (fileInputRef.current) {
                fileInputRef.current.value = ''
              }
            }}
          />
        </div>
      )}
    </div>
  )
}

export default Merger
