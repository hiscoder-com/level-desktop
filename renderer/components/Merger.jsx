import JSZip from 'jszip'
import { useRef, useState } from 'react'
import ChaptersMerger from './ChaptersMerger'
import Close from '../public/icons/close.svg'

function Merger({ config }) {
  const [importedChapter, setImportedChapter] = useState(null)
  const fileInputRef = useRef()
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
  }

  return (
    <div className="flex flex-col gap-4">
      <button onClick={() => exportChapterToZip()} className="btn-primary w-fit">
        Export archive
      </button>

      <input
        ref={fileInputRef}
        type="file"
        onChange={(e) => e.target.files.length > 0 && importChapter(e.target.files)}
      />

      {importedChapter && (
        <div className="flex items-center gap-2">
          <p>Chapter {Object.keys(importedChapter)[0]}</p>
          <Close
            className="w-5 h-5 cursor-pointer"
            onClick={() => {
              setImportedChapter(null)
              if (fileInputRef.current) {
                fileInputRef.current.value = ''
              }
            }}
          />
        </div>
      )}
      <button
        onClick={() => merge()}
        className="btn-primary w-fit"
        disabled={!importedChapter}
      >
        Merge with your verses
      </button>
      <ChaptersMerger />
    </div>
  )
}

export default Merger
