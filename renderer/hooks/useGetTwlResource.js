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
        twl = window.electronAPI.getTWLObs(id, resource, mainResource, chapter)
      } else {
        twl = window.electronAPI.getTWL(id, resource, mainResource, chapter)
        if (wholeChapter === false) {
          const verses = window.electronAPI.getChapter(id, chapter, typeProject)
          const versesEnabled = Object.keys(verses).reduce((acc, key) => {
            acc[key] = verses[key].enabled
            return acc
          }, {})
          twl = twl.filter((v) => versesEnabled[v.verse])
        }
      }
      setData(twl)
      setIsLoading(false)
    }
    fetchData()
  }, [id, resource, mainResource, chapter, wholeChapter, typeProject])

  return { isLoading, data }
}
