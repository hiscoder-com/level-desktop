import { useEffect, useState } from 'react'

import dynamic from 'next/dynamic'

import { currentVerse } from '@/helpers/atoms'
import { checkLSVal } from '@/helpers/checkls'
import { useGetTwlResource } from '@/hooks/useGetTwlResource'
import { useTranslation } from '@/next-i18next'
import jszip from 'jszip'
import localforage from 'localforage'
import { useRecoilState } from 'recoil'

import { Placeholder } from './Placeholder'

import Back from 'public/icons/left.svg'

const TWords = dynamic(() => import('@texttree/v-cana-rcl').then((mod) => mod.TWords), {
  ssr: false,
})

const getWords = async ({ zip, repo, wordObjects }) => {
  if (!zip || !repo || !wordObjects) {
    return []
  }
  try {
    const promises = wordObjects.map(async (wordObject) => {
      const uriMd = repo + '/' + wordObject.TWLink.split('/').slice(-2).join('/') + '.md'
      const md = zip.files[uriMd]
      if (md) {
        const markdown = await zip.files[uriMd].async('string')
        const splitter = markdown?.search('\n')
        return {
          ...wordObject,
          title: markdown?.slice(0, splitter),
          text: markdown?.slice(splitter),
        }
      } else {
        console.log('this word got lost: ', uriMd)

        return { ...wordObject, title: uriMd, text: uriMd }
      }
    })
    return await Promise.all(promises)
  } catch (error) {
    console.log(error)
    return []
  }
}

function filterNotes(newNote, verse, notes) {
  if (Array.isArray(verse)) {
    verse.forEach((el) => {
      if (!notes[el]) {
        notes[el] = [newNote]
      } else {
        notes[el].push(newNote)
      }
    })
  } else {
    if (!notes[verse]) {
      notes[verse] = [newNote]
    } else {
      notes[verse].push(newNote)
    }
  }
}

function TWL({
  config: { resource, id, typeProject, mainResource, chapter = false, wholeChapter },
  toolName,
}) {
  const [currentScrollVerse, setCurrentScrollVerse] = useRecoilState(currentVerse)
  const [word, setWord] = useState(null)
  const [filter, setFilter] = useState('disabled')

  const { isLoading, data } = useGetTwlResource({
    id,
    resource,
    mainResource,
    chapter,
    wholeChapter,
    typeProject,
  })

  const [wordObjects, setWordObjects] = useState({})
  const [isLoadingTW, setIsLoadingTW] = useState(false)
  useEffect(() => {
    const getData = async () => {
      setIsLoadingTW(true)
      const zip = await getFile({
        id,
        resource,
        chapter,
      })
      const words = await getWords({
        zip,
        repo: resource,
        wordObjects: data,
      })
      const finalData = {}
      words?.forEach((word) => {
        if (word) {
          const {
            ID,
            Reference,
            TWLink,
            isRepeatedInBook,
            isRepeatedInChapter,
            isRepeatedInVerse,
            text,
            title,
          } = word
          const wordObject = {
            id: ID,
            title,
            text,
            url: TWLink,
            isRepeatedInBook,
            isRepeatedInChapter,
            isRepeatedInVerse,
          }

          const [, verse] = Reference.split(':')
          filterNotes(wordObject, verse, finalData)
        }
      })
      setIsLoadingTW(false)
      setWordObjects(finalData)
    }
    getData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data])
  return (
    <div id="container_tw" className="h-full overflow-y-auto">
      {!word && (
        <div className="mb-2 text-center">
          <FilterRepeated filter={filter} setFilter={setFilter} />
        </div>
      )}
      <TWords
        twords={wordObjects}
        nodeContentBack={
          <span>
            <Back className="w-8 stroke-th-primary-200" />
          </span>
        }
        classes={{
          main: 'relative h-full',
          content: {
            container:
              'absolute top-0 bottom-0 pr-2 bg-th-secondary-10 overflow-auto left-0 right-0',
            header: 'sticky flex top-0 pb-4 bg-th-secondary-10',
            backButton:
              'w-fit h-fit p-1 mr-2.5 cursor-pointer hover:opacity-70 rounded-full bg-th-secondary-100',
            title: 'font-bold text-xl mt-1',
            text: 'markdown-body',
          },
          list: {
            verseNumber: 'text-2xl',
            container:
              'divide-y divide-th-text-primary divide-dashed h-full overflow-auto',
            verseBlock: 'pl-7 flex-1',
            currentWord: 'bg-th-secondary-100',
            word: 'p-2 cursor-pointer rounded-lg hover:bg-th-secondary-100',
            verseWrapper: 'p-4 flex mx-4',
            filtered: 'text-th-secondary-300',
          },
        }}
        nodeLoading={<Placeholder />}
        isLoading={isLoadingTW || isLoading}
        scrollTopOffset={20}
        startHighlightIds={checkLSVal('highlightIds', {}, 'object')}
        currentScrollVerse={String(currentScrollVerse)}
        toolId={toolName}
        idContainerScroll={'container_tw'}
        setCurrentScrollVerse={setCurrentScrollVerse}
        filter={filter}
        word={word}
        setWord={setWord}
      />
    </div>
  )
}

export default TWL

function FilterRepeated({ setFilter, filter }) {
  const { t } = useTranslation(['common', 'projects'])

  const options = [
    { value: 'verse', name: t('projects:ByVerse') },
    { value: 'book', name: t('projects:ByBook') },
    { value: 'disabled', name: t('Disabled') },
  ]

  return (
    <div className="flex items-center justify-center">
      <div>{t('RepeatedWordsFilter')}</div>
      <select
        className="input m-2 !w-auto"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
      >
        {options?.map((option) => (
          <option value={option.value} key={option.value}>
            {option.name}
          </option>
        ))}
      </select>
    </div>
  )
}

const zipStore = localforage.createInstance({
  driver: [localforage.INDEXEDDB],
  name: 'zip-store',
})

const fetchFileFromServer = async ({ id, resource, chapter }) => {
  if (!id || !resource) {
    return null
  }
  const zip = window.electronAPI.getZip(id, resource, chapter)
  if (zip) {
    const uriZip = id + '/' + resource + '/' + chapter
    zipStore.setItem(uriZip, zip)
    return await jszip.loadAsync(zip)
  }
}

const getFileFromZip = async ({ id, resource }) => {
  let file
  const uriZip = id + '/' + resource
  try {
    const zipBlob = await zipStore.getItem(uriZip)
    if (zipBlob) {
      const zip = await jszip.loadAsync(zipBlob)
      file = zip
    }
    return file
  } catch (error) {
    console.log('Error accessing storage:', error)
    return null
  }
}

const getFile = async ({ id, resource, chapter }) => {
  const file = await getFileFromZip({ id, resource })
  if (!file) {
    return await fetchFileFromServer({ id, resource, chapter })
  } else {
    return file
  }
}
