import { useEffect, useState } from 'react'
import { parseChapter } from '@/helpers/usfm'

export function useGetUsfmResource({ id, resource, chapter, wholeChapter }) {
  const [isLoading, setIsLoading] = useState(true)
  const [data, setData] = useState([])
  useEffect(() => {
    const usfm = window.electronAPI.getUsfm(id, resource, chapter)
    const _data = parseChapter(usfm).filter((el) => el.verse !== 'front')
    if (wholeChapter === false) {
      const verses = window.electronAPI.getChapter(id, chapter)
      const versesEnabled = Object.keys(verses).reduce((acc, key) => {
        acc[key] = verses[key].enabled
        return acc
      }, {})
      setData(_data.filter((v) => versesEnabled[v.verse]))
    } else {
      setData(_data)
    }
    setIsLoading(false)
  }, [id, resource, chapter, wholeChapter])

  return { isLoading, data }
}
