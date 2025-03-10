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
        twl = rawTwl.flatMap((items, index) =>
          Array.isArray(items)
            ? items.map((item) => ({ verse: (index + 1).toString(), ...item }))
            : [{ verse: (index + 1).toString(), ...items }]
        )
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
