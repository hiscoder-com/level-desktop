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
    const twl = window.electronAPI.getTWL(id, resource, mainResource, chapter)
    if (wholeChapter === false) {
      const verses = window.electronAPI.getChapter(id, chapter, typeProject)
      const versesEnabled = Object.keys(verses).reduce((acc, key) => {
        acc[key] = verses[key].enabled
        return acc
      }, {})
      setData(twl.filter((v) => versesEnabled[v.verse]))
    } else {
      setData(twl)
    }
    setIsLoading(false)
  }, [id, resource, chapter])

  return { isLoading, data }
}
