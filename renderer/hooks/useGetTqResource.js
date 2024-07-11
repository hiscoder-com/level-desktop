import { useEffect, useState } from 'react'

export function useGetTqResource({ id, resource, mainResource, chapter, wholeChapter }) {
  const [isLoading, setIsLoading] = useState(true)
  const [data, setData] = useState({})
  useEffect(() => {
    const tq = window.electronAPI.getTQ(id, resource, mainResource, chapter)
    if (wholeChapter === false) {
      const verses = window.electronAPI.getChapter(id, chapter)
      const versesEnabled = Object.keys(verses).reduce((acc, key) => {
        acc[key] = verses[key].enabled
        return acc
      }, {})
      const filteredTq = Object.keys(tq).reduce((acc, key) => {
        if (versesEnabled[key] === true) {
          acc[key] = tq[key]
        }
        return acc
      }, {})
      setData(filteredTq)
    } else {
      setData(tq)
    }
    setIsLoading(false)
  }, [id, resource, chapter])
  return { isLoading, data }
}
