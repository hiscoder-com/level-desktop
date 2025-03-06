import { useEffect, useState } from 'react'

import { parseChapter } from '@/helpers/usfm'

function sortVerses(a, b) {
  const extractNumber = (verse) => {
    const [start] = verse.split('-').map(Number)
    return start
  }
  return extractNumber(a.verse) - extractNumber(b.verse)
}

function filterEnabledVerses(data, verses) {
  const versesEnabled = Object.keys(verses).reduce((acc, key) => {
    acc[key] = verses[key].enabled
    return acc
  }, {})
  return data.filter((v) => versesEnabled[v.verse])
}

export function useGetTranslatedResource({
  typeProject,
  id,
  resource,
  chapter,
  wholeChapter,
}) {
  const [data, setData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true)
      try {
        if (typeProject === 'obs') {
          if (!window.electron || !window.electron.readOBSZipFile) {
            throw new Error('API window.electron недоступен')
          }
          let result = await window.electron.readOBSZipFile(chapter)
          if (!wholeChapter) {
            const verses = await window.electronAPI.getChapter(id, chapter, typeProject)
            result = filterEnabledVerses(result, verses)
          }
          setData(result)
        } else {
          const usfm = await window.electronAPI.getUsfm(id, resource, chapter)
          let _data = parseChapter(usfm).filter((el) => el.verse !== 'front')
          if (!wholeChapter) {
            const verses = await window.electronAPI.getChapter(id, chapter)
            _data = filterEnabledVerses(_data, verses)
          }
          _data = _data.sort(sortVerses)
          setData(_data)
        }
      } catch (err) {
        setError(err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [typeProject, id, resource, chapter, wholeChapter])

  return { data, isLoading, error }
}
