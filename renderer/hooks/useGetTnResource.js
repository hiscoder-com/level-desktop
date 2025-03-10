import { useEffect, useState } from 'react'

export function useGetTnResource({
  id,
  resource,
  mainResource,
  chapter,
  wholeChapter,
  typeProject,
}) {
  const [isLoading, setIsLoading] = useState(true)
  const [data, setData] = useState([])

  useEffect(() => {
    let tn

    if (typeProject === 'obs') {
      tn = window.electronAPI
        .getTNObs(id, resource, mainResource, chapter)
        .flatMap((notesArray, index) =>
          Array.isArray(notesArray)
            ? notesArray.map((note) => ({
                verse: (index + 1).toString(),
                ID: note.id,
                Note: note.text,
                Quote: note.title,
              }))
            : [
                {
                  verse: (index + 1).toString(),
                  ID: notesArray.id,
                  Note: notesArray.text,
                  Quote: notesArray.title,
                },
              ]
        )
    } else {
      tn = window.electronAPI.getTN(id, resource, mainResource, chapter)
    }

    if (!wholeChapter) {
      const verses = window.electronAPI.getChapter(id, chapter, typeProject)
      const versesEnabled = Object.keys(verses).reduce((acc, key) => {
        acc[key] = verses[key].enabled
        return acc
      }, {})
      tn = tn.filter((item) => versesEnabled[item.verse])
    }

    setData(tn)
    setIsLoading(false)
  }, [id, resource, mainResource, chapter, wholeChapter, typeProject])

  return { isLoading, data }
}
