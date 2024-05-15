import JSZip from 'jszip'
import { useRef, useState } from 'react'
import Close from '../public/icons/close.svg'
import Progress from '../public/icons/progress.svg'

function Merger({ config }) {
  const [importedChapter, setImportedChapter] = useState(null)
  const [isMerge, setIsMerge] = useState(false)
  const [success, setSuccess] = useState(false)
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
    setIsMerge(true)
    try {
      window.electronAPI.updateChapter(
        config.id,
        config.chapter,
        Object.values(importedChapter)[0]
      )
    } catch (error) {
    } finally {
      setTimeout(() => {
        setIsMerge(false)
        setSuccess(true)
      }, 1000)
    }
  }

  return (
    <div className="flex flex-col gap-4 justify-center items-center mt-10">
      <p className="font-bold">На этом шаге мы будем обьединять стихи всей главы</p>
      <p className="font-bold">
        Вы должны сначала нажать кнопку 'Export archive', скачать архив и отправить его
        координатору
      </p>

      <button onClick={() => exportChapterToZip()} className="btn-primary w-fit">
        Export archive
      </button>

      <p className="font-bold">После этого ожидайте от координатора новый архив</p>
      <p className="font-bold">
        Когда вы его получите - то нажмите на кнопку 'Выберите файл' и выберите тот архив,
        который вам прислали
      </p>
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
              setSuccess(false)
              if (fileInputRef.current) {
                fileInputRef.current.value = ''
              }
            }}
          />
        </div>
      )}
      <p className="font-bold">
        После успешной загрузки кнопка 'Merge with your verses' станет активной - нажмите
        её для того чтобы стихи всей главы загрузились в вашу программу
      </p>
      <button
        onClick={() => merge()}
        className="btn-primary w-fit relative"
        disabled={!importedChapter || isMerge}
      >
        Merge with your verses
        {isMerge && (
          <Progress className="progress-custom-colors w-6 inset-0 animate-spin stroke-th-primary-100 m-auto absolute" />
        )}
      </button>
      {success && <p className="font-bold">Успешно!</p>}
      {/* <ChaptersMerger /> */}
    </div>
  )
}

export default Merger
