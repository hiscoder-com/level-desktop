import { useEffect, useMemo, useState } from 'react'

import ReactMarkdown from 'react-markdown'

import { useScroll } from '../hooks/useScroll'
import { useGetUsfmResource } from '../hooks/useGetUsfmResource'
import { Placeholder } from './Placeholder'
import CheckBox from './CheckBox'

export const obsCheckAdditionalVerses = (numVerse) => {
  if (['0', '200'].includes(String(numVerse))) {
    return ''
  }
  return String(numVerse)
}

function Divider({ config: { resource, id, chapter = false }, toolName, wholeChapter }) {
  const { isLoading, data } = useGetUsfmResource({
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

  return (
    <>
      {isLoading ? (
        <Placeholder />
      ) : (
        <Verses
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

function Verses({ verseObjects, handleSaveScroll, currentScrollVerse = 1, id, chapter }) {
  const t = () => {}
  const [versesDivide, setVersesDivide] = useState({})
  useEffect(() => {
    const verses = window.electronAPI.getChapter(id, chapter)
    const versesEnabled = Object.keys(verses).reduce((acc, key) => {
      acc[key] = verses[key].enabled

      return acc
    }, {})

    setVersesDivide(versesEnabled)
  }, [])

  const divideVerse = (verseNum, enabled) => {
    window.electronAPI.divideVerse(id, chapter, verseNum.toString(), enabled)
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
          className={`p-2 flex gap-2 items-start ${
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
                'bg-th-secondary-10 checked:bg-th-primary-100 checked:border-th-secondary-400 checked:before:bg-th-secondary-400 border-th-secondary',
              cursor: 'fill-th-secondary-10 text-th-secondary-10 stroke-th-secondary-10',
            }}
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
