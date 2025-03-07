import { useEffect, useState } from 'react'

import { useGetTranslatedResource } from '@/hooks/useGetTranslatedResource'
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
  config: { resource, id, chapter = false, typeProject = '' },
  toolName,
  wholeChapter,
}) {
  const { data, isLoading, error } = useGetTranslatedResource({
    typeProject,
    id,
    resource,
    chapter,
    wholeChapter,
  })

  const { handleSaveScroll, currentScrollVerse } = useScroll({
    toolName,
    idPrefix: 'id',
    isLoading,
  })

  if (error) {
    return <div>Error: {error.message}</div>
  }

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

function Verses({ verseObjects, id, chapter, currentScrollVerse = 1, typeProject = '' }) {
  const t = () => {}
  const [versesDivide, setVersesDivide] = useState({})

  useEffect(() => {
    const verses = window.electronAPI.getChapter(id, chapter, typeProject)
    const versesEnabled = Object.keys(verses).reduce((acc, key) => {
      acc[key] = verses[key].enabled

      return acc
    }, {})

    setVersesDivide(versesEnabled)
  }, [])

  const divideVerse = (verseNum, enabled) => {
    window.electronAPI.divideVerse(id, chapter, verseNum.toString(), enabled, typeProject)
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
