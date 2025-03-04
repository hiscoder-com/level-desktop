import { useEffect, useState } from 'react'

import useGetObsResource from '@/hooks/useGetObsResource'
import { useGetUsfmResource } from '@/hooks/useGetUsfmResource'
import { useScroll } from '@/hooks/useScroll'
import ReactMarkdown from 'react-markdown'

import CheckBox from './CheckBox'
import { Placeholder } from './Placeholder'

export const obsCheckAdditionalVerses = (numVerse) => {
  if (['0', '200'].includes(String(numVerse))) {
    return ''
  }
  return String(numVerse)
}

function Divider({
  config: { resource, id, typeProject, chapter = false },
  toolName,
  wholeChapter,
}) {
  let isLoading, data

  if (typeProject === 'OBS') {
    const response = useGetObsResource({
      chapter,
    })
    isLoading = response.isLoading
    data = response.data
  } else {
    const response = useGetUsfmResource({
      id,
      resource,
      chapter,
      wholeChapter,
    })
    isLoading = response.isLoading
    data = response.data
  }
  const { handleSaveScroll, currentScrollVerse } = useScroll({
    toolName,
    idPrefix: 'id',
    isLoading,
  })

  return (
    <>
      {isLoading ? (
        <Placeholder />
      ) : (
        <Verses
          typeProject={typeProject}
          verseObjects={data}
          handleSaveScroll={handleSaveScroll}
          currentScrollVerse={currentScrollVerse}
          id={id}
          chapter={chapter}
        />
      )}
    </>
  )
}

export default Divider

function Verses({ typeProject, verseObjects, id, chapter, currentScrollVerse = 1 }) {
  const t = () => {}
  const [versesDivide, setVersesDivide] = useState({})

  useEffect(() => {
    const verses = window.electronAPI.getChapter(id, typeProject, chapter)
    const versesEnabled = Object.keys(verses).reduce((acc, key) => {
      acc[key] = verses[key].enabled

      return acc
    }, {})

    setVersesDivide(versesEnabled)
  }, [])

  const divideVerse = (verseNum, enabled) => {
    window.electronAPI.divideVerse(id, typeProject, chapter, verseNum.toString(), enabled)
    setVersesDivide((prev) => ({
      ...prev,
      [verseNum]: enabled,
    }))
  }

  return (
    <>
      {verseObjects?.map((verseObject) => (
        <div
          key={verseObject.verse}
          id={'id' + verseObject.verse}
          className={`flex items-start gap-2 p-2 ${
            'id' + currentScrollVerse === 'id' + verseObject.verse ? 'bg-gray-200' : ''
          }`}
          // onClick={() => {
          //   handleSaveScroll(String(verseObject.verse));
          // }} // убрал - автоскролл на время теста, он раздражает, если понадобится- верну
        >
          <CheckBox
            onChange={() => {
              const checked = !versesDivide[verseObject.verse]
              divideVerse(verseObject.verse, checked)
            }}
            checked={versesDivide[verseObject.verse]}
            className={{
              accent:
                'border-th-secondary bg-th-secondary-10 checked:border-th-secondary-400 checked:bg-th-primary-100 checked:before:bg-th-secondary-400',
              cursor: 'fill-th-secondary-10 stroke-th-secondary-10 text-th-secondary-10',
            }}
            id={`checkBox-${verseObject.verse}`}
            label={t('Done')}
          />
          <ReactMarkdown>
            {obsCheckAdditionalVerses(verseObject.verse) + ' ' + verseObject.text}
          </ReactMarkdown>
        </div>
      ))}
    </>
  )
}
