import { useEffect, useState } from 'react'

export function useGetTwlResource({
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
    async function fetchData() {
      let twl

      if (typeProject === 'obs') {
        const rawTwl = window.electronAPI.getTWLObs(id, resource, mainResource, chapter)

        twl = rawTwl.flatMap((items) => {
          const parts = items.Reference?.split(':') || []
          const versesStr = parts[1] || ''
          const verseArr = versesStr.split(',')

          return [
            {
              ...items,
              verse: verseArr,
            },
          ]
        })
      } else {
        twl = window.electronAPI.getTWL(id, resource, mainResource, chapter)
      }

      if (wholeChapter === false) {
        const verses = window.electronAPI.getChapter(id, chapter, typeProject)
        const versesEnabled = Object.keys(verses).reduce((acc, key) => {
          acc[key] = verses[key].enabled
          return acc
        }, {})
        twl = twl.filter((item) => versesEnabled[item.verse])
      }
      setData(twl)
      setIsLoading(false)
    }
    fetchData()
  }, [id, resource, mainResource, chapter, wholeChapter, typeProject])

  return { isLoading, data }
}
