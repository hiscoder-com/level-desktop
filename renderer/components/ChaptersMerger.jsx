import { useRef, useState } from 'react'

import { useTranslation } from '@/next-i18next'
import toast from 'react-hot-toast'
import JSZip from 'jszip'

import { convertToUsfm } from '@/helpers/usfm'

import Close from 'public/icons/close.svg'

export default function ChaptersMerger({ book }) {
  const { t } = useTranslation(['common', 'projects'])

  const [jsonDataArray, setJsonDataArray] = useState([])
  const [conflicts, setConflicts] = useState(null)
  const [mergedContent, setMergedContent] = useState(null)
  const fileInputRef = useRef()

  const checkEqualFiles = (file) => {
    const existingFile = jsonDataArray.find((f) => f.filename === file)
    return existingFile
  }
  const exportToZip = (exportedData, name = 'exported') => {
    try {
      if (!exportedData) {
        throw new Error('error:NoData')
      }
      const jsonContent = JSON.stringify(exportedData, null, 2)
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
        downloadLink.download = `${name}_${formattedDate}.zip`
        document.body.appendChild(downloadLink)
        downloadLink.click()
        document.body.removeChild(downloadLink)
        window.URL.revokeObjectURL(url)
      })
    } catch (error) {
      console.log(error.message)
    }
  }

  const handleFiles = async (files) => {
    const jsonPromises = []

    for (let file of files) {
      if (!file.name.toLowerCase().endsWith('.zip')) {
        toast.error(t('projects:FileTypeIncorrect'))
        continue
      }

      const zip = new JSZip()
      try {
        const zipContents = await zip.loadAsync(file)
        let hasJsonFile = false

        for (let filename in zipContents.files) {
          if (filename.toLowerCase().endsWith('.json')) {
            hasJsonFile = true
            const existingFile = checkEqualFiles(filename)
            if (!existingFile) {
              const filePromise = zipContents.files[filename]
                .async('text')
                .then((fileData) => {
                  try {
                    const data = JSON.parse(fileData)
                    return { filename, content: data }
                  } catch (parseError) {
                    toast.error(t('projects:ErrorParsing'))
                    console.error(`Error parsing JSON in file ${filename}:`, parseError)

                    return null
                  }
                })
              jsonPromises.push(filePromise)
            } else {
              console.log(`File ${filename} already exists and will be skipped`)
            }
          }
        }
        if (!hasJsonFile) {
          toast.error(t('projects:NoJsonFiles'))
          console.error(`ZIP archive ${file.name} does not contain JSON files`)
        }
      } catch (error) {
        toast.error(t('projects:ErrorDownloadingZip'))
        console.error('Error downloading ZIP file:', error)
      }
    }

    try {
      const jsonObjects = await Promise.all(jsonPromises)
      const validJsonObjects = jsonObjects.filter((obj) => obj !== null)
      setJsonDataArray((prevData) => [...prevData, ...validJsonObjects])
    } catch (error) {
      toast.error(t('projects:ErrorProcessingFiles'))
      console.error('File processing error', error)
    }
  }

  function mergeJsonContents(jsonDataArray) {
    const mergedContent = {}
    const conflicts = []
    if (jsonDataArray.length < 2) {
      return
    }

    jsonDataArray.forEach(({ content }) => {
      const chapters = content
      Object.keys(chapters).forEach((chapter) => {
        if (!mergedContent[chapter]) {
          mergedContent[chapter] = {}
        }
        Object.keys(chapters[chapter]).forEach((verse) => {
          if (chapters[chapter][verse].text && !mergedContent[chapter][verse]) {
            mergedContent[chapter][verse] = chapters[chapter][verse]
          } else if (
            chapters[chapter][verse].text &&
            mergedContent[chapter][verse].text
          ) {
            conflicts.push({
              chapter,
              verse,
              existingText: mergedContent[chapter][verse].text,
              newText: chapters[chapter][verse].text,
            })
          }
        })
      })
    })

    if (conflicts.length > 0) {
      conflicts.forEach((conflict, index) => {
        console.log(
          `${index + 1}. Chapter: ${conflict.chapter}, Verse: ${
            conflict.verse
          }, Existing Text: "${conflict.existingText}", New Text: "${conflict.newText}"`
        )
      })
    }
    return {
      mergedContent,
      conflicts,
    }
  }

  const mergeChapters = () => {
    const { mergedContent, conflicts } = mergeJsonContents(jsonDataArray)
    if (conflicts.length > 0) {
      setConflicts(conflicts)
    } else {
      setMergedContent(mergedContent)
    }
  }
  const convertJson = (chapters) => {
    const convertedChapters = []
    for (const num in chapters) {
      if (Object.hasOwnProperty.call(chapters, num)) {
        const chapter = chapters[num]
        const convertedChapter = Object.keys(chapter).reduce((acc, verse) => {
          return { ...acc, [verse]: chapter[verse].text }
        }, {})
        convertedChapters.push({ num: num, text: convertedChapter })
      }
    }
    return convertedChapters
  }
  const downloadUsfm = (chapters) => {
    const convertedChapters = convertJson(chapters)
    const merge = convertToUsfm({
      jsonChapters: convertedChapters,
      book: {
        code: '',
        properties: {
          scripture: {
            h: '',
            toc1: '',
            toc2: '',
            toc3: '',
            mt: '',
            chapter_label: '',
          },
        },
      },
      project: { code: '', language: { code: '', orig_name: '' }, title: '' },
    })

    const blob = new Blob([merge], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `${book ?? 'book'}.usfm`)
    document.body.appendChild(link)
    link.click()
  }

  return (
    <div className="flex flex-col gap-4 self-start">
      <h2 className="my-6 text-4xl">{t('projects:VerseMerge')}</h2>
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".zip"
        onChange={(e) => handleFiles(e.target.files)}
        style={{ display: 'none' }}
      />
      <div className="flex gap-4 items-center">
        <button className="w-fit btn-strong" onClick={() => fileInputRef.current.click()}>
          {t('projects:SelectFiles')}
        </button>
      </div>
      {jsonDataArray.length > 0 && (
        <div className="py-5 border-y">
          <p>{t('UploadedFiles')}</p>
          <div className="flex gap-2.5 pt-4">
            {jsonDataArray.map((json, index) => (
              <div
                className="flex items-center gap-2.5 py-4 px-5 border w-fit rounded-full border-th-text-primary"
                key={index}
              >
                <p>{json.filename}</p>
                <Close
                  className="w-5 h-5 cursor-pointer stroke-2"
                  onClick={() => {
                    setJsonDataArray(jsonDataArray.filter((_, i) => i !== index))
                    setConflicts(null)
                    if (fileInputRef.current) {
                      fileInputRef.current.value = ''
                    }
                    setMergedContent(null)
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      )}
      {jsonDataArray.length > 0 && (
        <button
          className="w-fit btn-strong"
          disabled={jsonDataArray.length < 2}
          onClick={() => mergeChapters()}
        >
          {t('Merge')}
        </button>
      )}
      {conflicts ? (
        <>
          <p className="font-bold">{t('ConflictTitle')}</p>
          {conflicts.map((conflict, index) => (
            <div key={index} className="py-5 border-y">
              <p>
                {t('projects:Chapter')} {conflict.chapter}, {t('projects:Verse')}
                {conflict.verse}
              </p>
              <p>
                {t('projects:ExistingText')} {conflict.existingText}
              </p>
              <p>
                {t('projects:NewText')} {conflict.newText}
              </p>
            </div>
          ))}
        </>
      ) : (
        mergedContent && (
          <>
            <p>{t('projects:NoConflicts')}</p>
            <div className="flex gap-2.5 pt-5 border-t">
              <button
                className="w-fit btn-strong"
                onClick={() => downloadUsfm(mergedContent)}
              >
                {t('USFM')}
              </button>

              <button
                className="w-fit btn-strong"
                onClick={() => exportToZip(mergedContent, 'merged')}
              >
                {t('ArchiveTranslators')}
              </button>
            </div>
          </>
        )
      )}
    </div>
  )
}

ChaptersMerger.backgroundColor = 'bg-th-secondary-100'
