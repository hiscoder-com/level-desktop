import { useEffect, useState } from 'react'

import { obsCheckAdditionalVerses } from './Bible'
import RtlTextArea from './RtlTextArea'

function Editor({
  config: { id, chapter = false, wholeChapter, language = {}, typeProject = '' },
}) {
  const [verseObjects, setVerseObjects] = useState([])
  const is_rtl = language.is_rtl

  useEffect(() => {
    const savedVerses = Object.entries(
      window.electronAPI.getChapter(id, chapter, typeProject)
    ).map(([k, v]) => ({ num: k, verse: v.text, enabled: v.enabled }))

    setVerseObjects(wholeChapter ? savedVerses : savedVerses.filter((v) => v.enabled))
  }, [id, chapter, wholeChapter, typeProject])

  const updateVerse = (idx, verseNum, text) => {
    setVerseObjects((prev) => {
      prev[idx].verse = text
      window.electronAPI.updateVerse(id, chapter, verseNum.toString(), text, typeProject)
      return [...prev]
    })
  }

  return (
    <div>
      {verseObjects.map((verseObject, idx) => (
        <div
          key={verseObject.num}
          className={`my-3 flex ${is_rtl ? 'flex-row-reverse' : ''}`}
        >
          <div>{obsCheckAdditionalVerses(verseObject.num)}</div>
          <RtlTextArea
            value={verseObject.verse}
            onChange={(text) => updateVerse(idx, verseObject.num, text)}
            className="mx-3 block w-full whitespace-pre-line focus:bg-th-secondary-10 focus:outline-none"
            defaultDirection={is_rtl ? 'rtl' : 'ltr'}
          />
        </div>
      ))}
      <div className="select-none">ㅤ</div>
    </div>
  )
}

export default Editor
