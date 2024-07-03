import { useMemo } from 'react'

import ReactMarkdown from 'react-markdown'
import { useRecoilValue } from 'recoil'

import { Placeholder } from './Placeholder'

import { useScroll } from '@/hooks/useScroll'
import { useGetUsfmResource } from '@/hooks/useGetUsfmResource'
import { checkedVersesBibleState } from '@/helpers/atoms'

export const obsCheckAdditionalVerses = (numVerse) => {
  if (['0', '200'].includes(String(numVerse))) {
    return ''
  }
  return String(numVerse)
}

function Bible({
  config: { resource, id, chapter = false, isDraft = false, wholeChapter },
  toolName,
}) {
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
      ) : isDraft ? (
        <VersesExtended verseObjects={data} handleSaveScroll={handleSaveScroll} />
      ) : (
        <Verses
          verseObjects={data}
          handleSaveScroll={handleSaveScroll}
          currentScrollVerse={currentScrollVerse}
        />
      )}
    </>
  )
}

export default Bible

function Verses({ verseObjects, handleSaveScroll, currentScrollVerse = 1 }) {
  return (
    <>
      {verseObjects?.map((verseObject) => (
        <div
          key={verseObject.verse}
          id={'id' + verseObject.verse}
          className={`p-2 ${
            'id' + currentScrollVerse === 'id' + verseObject.verse
              ? 'bg-th-secondary-100'
              : ''
          }`}
          onClick={() => {
            handleSaveScroll(String(verseObject.verse))
          }}
        >
          <ReactMarkdown>
            {obsCheckAdditionalVerses(verseObject.verse) + ' ' + verseObject.text}
          </ReactMarkdown>
        </div>
      ))}
    </>
  )
}

function VersesExtended({ verseObjects, handleSaveScroll, currentScrollVerse = 1 }) {
  const checkedVersesBible = useRecoilValue(checkedVersesBibleState)
  return (
    <>
      {verseObjects?.map((verseObject) => {
        const checkedCurrent = checkedVersesBible.includes(verseObject.verse)

        return (
          <div
            key={verseObject.verse}
            onClick={() => {
              handleSaveScroll(verseObject.verse)
            }}
            className={`my-3 flex items-start select-none ${
              'id' + currentScrollVerse === 'id' + verseObject.verse && !checkedCurrent
                ? 'bg-th-secondary-100'
                : ''
            }`}
          >
            <div id={'id' + verseObject.verse} className={`ml-2`}>
              {obsCheckAdditionalVerses(verseObject.verse)}
            </div>
            {checkedCurrent ? (
              <Blur verse={verseObject.text} />
            ) : (
              <ReactMarkdown className={`ml-2`}>{verseObject.text}</ReactMarkdown>
            )}
          </div>
        )
      })}
    </>
  )
}

function Blur({ verse }) {
  const text = useMemo(
    () =>
      verse
        .split(' ')
        .map((el) => shuffle(el))
        .join(' '),
    [verse]
  )
  return (
    <ReactMarkdown className="ml-2 bg-th-secondary-100 text-th-secondary-100 rounded-lg select-none">
      {text}
    </ReactMarkdown>
  )
}

const shuffle = (text) => {
  const arr = text.split('')
  let j
  for (let i = arr.length - 1; i > 0; i--) {
    j = Math.floor(Math.random() * (i + 1))
    ;[arr[j], arr[i]] = [arr[i], arr[j]]
  }
  return arr.join('')
}
