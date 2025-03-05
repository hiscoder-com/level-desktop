import { useEffect, useState } from 'react'

import { obsCheckAdditionalVerses } from './Bible'
import RtlTextArea from './RtlTextArea'

function Editor({ config: { id, chapter = false, wholeChapter, typeProject = '' } }) {
  const [verseObjects, setVerseObjects] = useState([])

  useEffect(() => {
    const savedVerses = Object.entries(
      window.electronAPI.getChapter(id, chapter, typeProject)
    ).map(([k, v]) => ({ num: k, verse: v.text, enabled: v.enabled }))

    setVerseObjects(wholeChapter ? savedVerses : savedVerses.filter((v) => v.enabled))
  }, [id, chapter])

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
        <div key={verseObject.num} className="my-3 flex">
          <div>{obsCheckAdditionalVerses(verseObject.num)}</div>
          <RtlTextArea
            value={verseObject.verse}
            onChange={(text) => updateVerse(idx, verseObject.num, text)}
            className="mx-3 block w-full whitespace-pre-line focus:bg-th-secondary-10 focus:outline-none"
          />
        </div>
      ))}
      <div className="select-none">ㅤ</div>
    </div>
  )
}

export default Editor
