import { useTranslation } from '@/next-i18next'
import { newTestamentList, usfmFileNames } from '@/utils/config'
import { getCountChaptersAndVerses } from '@/utils/helper'
import supabaseApi from '@/utils/supabaseServer'
import axios from 'axios'
import { saveAs } from 'file-saver'
import JSZip from 'jszip'
import toast from 'react-hot-toast'

function ProjectDownloader({ project, bookCode, bookProperties }) {
  const { t } = useTranslation(['common', 'projects', 'books'])

  const createProjectFiles = (zip) => {
    const files = ['personal-notes.json', 'dictionary.json', 'team-notes.json']
    const folders = ['personal-notes', 'dictionary', 'team-notes', 'chapters']

    files.forEach((filename) => {
      zip.file(filename, JSON.stringify({}))
    })

    folders.forEach((foldername) => {
      zip.folder(foldername)
    })
  }

  const getResourcesUrls = async (resources) => {
    if (!resources) return null
    const urls = {}
    for (const resource in resources) {
      if (Object.hasOwnProperty(resource)) {
        const { owner, repo, commit, manifest } = resources[resource]

        const bookPath = manifest?.projects?.find(
          (el) => el.identifier === bookCode
        )?.path

        if (!bookPath) {
          console.error(`bookPath not found for resource: ${resource}`)
          //TODO решить стоит продолжать
          continue
        }

        const url = `${process.env.NEXT_PUBLIC_NODE_HOST ?? 'https://git.door43.org'}/${owner}/${repo}/raw/commit/${commit}/${bookPath.replace(/^\.\//, '')}`
        urls[resource] = url
      }
    }
    return urls
  }

  const downloadResources = async (resourcesUrls, zip) => {
    const resourcePromises = Object.entries(resourcesUrls).map(
      async ([resource, url]) => {
        try {
          const response = await axios.get(url)
          if (response.status === 200) {
            zip.file(`${resource}.${url.split('.').pop()}`, response.data)
          } else {
            throw new Error(`Failed to fetch resource: ${url}`)
          }
        } catch (error) {
          console.error(`Error loading: ${url}`, error)
        }
      }
    )

    await Promise.all(resourcePromises)
  }

  const getTwords = async (url) => {
    if (!url) {
      return null
    }
    try {
      const parts = url.split('/')
      const baseUrl = parts.slice(0, 3).join('/')
      //TODO уточнить почему обрезали      const repo = parts[4].slice(0, -1)
      const repo = parts[4]
      const owner = parts[3]

      const newUrl = `${baseUrl}/${owner}/${repo}/archive/master.zip`
      const response = await axios.get(newUrl, { responseType: 'arraybuffer' })

      const zip = new JSZip()
      await zip.loadAsync(response.data)
      const newZip = new JSZip()
      const tWordsFolder = newZip.folder('twords')
      const filePromises = []
      const regularExpression = /^[^\/]+\/bible\//
      for (const pathName in zip.files) {
        if (Object.hasOwnProperty.call(zip.files, pathName)) {
          regularExpression
          const file = zip.files[pathName]
          if (pathName.match(regularExpression)) {
            if (!file.dir) {
              const filePromise = file.async('arraybuffer').then((content) => {
                tWordsFolder.file(pathName.replace(regularExpression, ''), content)
              })
              filePromises.push(filePromise)
            }
          }
        }
      }
      await Promise.all(filePromises)
      const tWordsArrayBuffer = await newZip.generateAsync({ type: 'uint8array' })
      return Buffer.from(tWordsArrayBuffer)
    } catch (error) {
      console.error('Error fetching tWords:', error)
      return null
    }
  }

  const getOriginal = async (bookCode) => {
    if (!bookCode) {
      return null
    }
    const isGreek = Object.keys(newTestamentList).includes(bookCode)
    const newUrl = `${
      process.env.NEXT_PUBLIC_NODE_HOST ?? 'https://git.door43.org'
    }/unfoldingWord/${isGreek ? 'el-x-koine_ugnt' : 'hbo_uhb'}/raw/master/${
      usfmFileNames[bookCode]
    }`
    try {
      const response = await axios.get(newUrl)
      return response.data
    } catch (error) {
      console.error('Error fetching original USFM:', error)
      return null
    }
  }

  const addChaptersToZip = (zip, chapters) => {
    const chaptersFolder = zip.folder('chapters')
    if (chapters) {
      Object.keys(chapters).forEach((chapterNumber) => {
        const chapterData = chapters[chapterNumber]
        const chapterFileName = `${chapterNumber}.json`
        chaptersFolder.file(chapterFileName, JSON.stringify(chapterData))
      })
    }
  }

  const createConfig = async (project, bookCode, chapters) => {
    if (!chapters || !project) {
      return null
    }

    const initChapters = Object.keys(chapters).reduce((acc, chapter) => {
      acc[chapter] = 0
      return acc
    }, {})

    let supabase
    try {
      supabase = await supabaseApi()
    } catch (error) {
      console.error('Error connecting to Supabase:', error)
      return null
    }

    const { data: methodsData, error } = await supabase
      .from('methods_view')
      .select('*')
      .eq('title', project.method)
    if (error) {
      console.error('Error receiving data from Supabase:', error)
      return null
    }

    const method = methodsData?.[0]
    //TODO уточнить, актуально ли
    if (!method?.offline_steps) {
      return null
    }

    const bookName =
      bookProperties.scripture.toc2 || t('books:' + bookCode, { lng: 'en' })

    const config = {
      steps: method.offline_steps,
      method: method.title,
      project: { code: project.code, title: project.title },
      chapters: initChapters,
      book: { code: bookCode, name: bookName },
      resources: addResourceName(project.resources),
      mainResource: project.base_manifest.resource,
    }

    return JSON.stringify(config)
  }

  const addResourceName = (resources) => {
    if (!resources) return null
    const names = { tnotes: 'tNotes', twords: 'tWords', tquestions: 'tQuestions' }
    const resourceNames = Object.entries(resources).reduce((acc, [resource, value]) => {
      acc[resource] = {
        name: names[resource] || resource.charAt(0).toUpperCase() + resource.slice(1),
        title: value?.manifest?.dublin_core?.title || '',
      }
      return acc
    }, {})
    return resourceNames
  }

  const createOfflineProject = async (project, bookCode) => {
    try {
      const bookLink = project.base_manifest.books.find(
        (book) => book.name === bookCode
      )?.link
      if (!bookLink) throw new Error('Book link not found')

      const chapters = await createChapters(bookLink)
      if (!chapters) throw new Error('Chapters not created')

      const zip = new JSZip()
      createProjectFiles(zip)

      const resourcesUrls = await getResourcesUrls(project.resources)
      if (!resourcesUrls) throw new Error('Resource URLs not found')

      await downloadResources(resourcesUrls, zip)

      const tWordsBuffer = await getTwords(resourcesUrls['twords'])
      if (!tWordsBuffer) throw new Error('tWords not fetched')

      zip.file('twords.zip', tWordsBuffer)

      const original = await getOriginal(bookCode)
      if (original) zip.file('original.usfm', original)

      addChaptersToZip(zip, chapters)

      const config = await createConfig(project, bookCode, chapters)
      zip.file('config.json', config)

      return zip
    } catch (error) {
      console.error('Error creating offline project:', error)
      return null
    }
  }

  const createChapters = async (bookLink) => {
    if (!bookLink) return null

    const { data: jsonChapterVerse, error: errorJsonChapterVerse } =
      await getCountChaptersAndVerses({
        link: bookLink,
      })
    if (errorJsonChapterVerse) {
      return null
    }
    const chapters = {}
    for (const chapterNum in jsonChapterVerse) {
      if (Object.hasOwnProperty.call(jsonChapterVerse, chapterNum)) {
        const verses = jsonChapterVerse[chapterNum]
        const newVerses = {}
        for (let index = 1; index < verses + 1; index++) {
          newVerses[index] = { text: '', enabled: false, history: [] }
        }
        chapters[chapterNum] = newVerses
      }
    }
    return chapters
  }

  const createAndDownloadArchive = async () => {
    try {
      const downloadingToast = toast.loading(t('DownloadingProject'), {
        position: 'top-center',
        duration: Infinity,
      })

      const archive = await createOfflineProject(project, bookCode)
      if (!archive) throw new Error('Archive not created')

      const content = await archive.generateAsync({ type: 'blob' })
      const fileName = `${project.code}_${bookCode}.zip`

      saveAs(content, fileName)

      toast.success(t('DownloadComplete'), { id: downloadingToast, duration: 7000 })
    } catch (error) {
      toast.dismiss(downloadingToast)
      toast.error(t('DownloadError'))
      console.error('Error downloading archive:', error)
    }
  }

  return (
    <button
      className="btn-primary mb-4 w-fit text-base"
      onClick={createAndDownloadArchive}
    >
      {t('common:Download')}
    </button>
  )
}

export default ProjectDownloader
