import { convertBookChapters, convertToUsfm } from '@/helpers/usfm'
import { JsonToMd, JsonToPdf, MdToZip } from '@texttree/obs-format-convert-rcl'
import toast from 'react-hot-toast'

import { createObjectToTransform, findEmptyJsonElements } from './helper'

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

export const exportToPdf = (t, chapters, project) => {
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

export const exportToUsfm = (t, chapters, project) => {
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

export const exportToZip = async (t, chapters, project) => {
  if (!project) {
    return
  }
  try {
    const bookProperties = window.electronAPI.getProperties(project.id)
    if (!bookProperties) throw new Error('Failed to load book properties')
    const obs = convertBookChapters(chapters)
    if (!obs || !Array.isArray(obs)) {
      throw new Error('Failed to load OBS book data')
    }
    const fileData = { name: 'content', isFolder: true, content: [] }
    const incompleteChapters = []

    for (const story of obs) {
      if (!story || story.text === null) continue
      const emptyChunks = findEmptyJsonElements(story.text)

      if (emptyChunks.length > 0) {
        incompleteChapters.push(story.num)
        continue
      }

      let objectToTransform
      try {
        objectToTransform = createObjectToTransform(
          {
            json: story.text,
            chapterNum: story.num,
          },
          bookProperties.chapter_label,
          project.typeProject
        )
      } catch (err) {
        throw new Error(`${err.message}`)
      }
      const text = JsonToMd(objectToTransform)
      if (text) {
        fileData.content.push({
          name: `${story.num}.md`,
          content: text,
        })
      }
    }

    if (fileData.content.length === 0) {
      throw new Error('No fully translated chapters available for export.')
    }

    if (incompleteChapters.length > 0) {
      toast.error(
        `Attention: the stories of ${incompleteChapters.join(', ')} have not been fully translated`
      )
    }

    const frontContent = []
    if (bookProperties?.intro) {
      frontContent.push({
        name: 'intro.md',
        content: bookProperties.intro,
      })
    }
    if (bookProperties?.title) {
      frontContent.push({
        name: 'title.md',
        content: bookProperties.title,
      })
    }
    if (frontContent.length > 0) {
      fileData.content.push({
        name: 'front',
        isFolder: true,
        content: frontContent,
      })
    }
    if (bookProperties?.back) {
      fileData.content.push({
        name: 'back',
        isFolder: true,
        content: [
          {
            name: 'intro.md',
            content: bookProperties.back,
          },
        ],
      })
    }
    const projectName = project.name ?? project.title
    const formattedDate = new Date().toISOString().split('T')[0]
    const fileName = `${projectName}_${project.book.code}_${formattedDate}.zip`
    await MdToZip({
      fileData,
      fileName,
    })
  } catch (error) {
    console.error('Error during ZIP export:', error)
    toast.error(t('projects:ErrorExportingZip'))
  }
}
