import { useEffect, useState } from 'react'

export default function useGetObsResource({ chapter, verses }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchObs() {
      try {
        if (!window.electron || !window.electron.readOBSZipFile) {
          throw new Error('window.electron API недоступен')
        }
        const result = await window.electron.readOBSZipFile(chapter, verses)
        setData(result)
        setLoading(false)
      } catch (err) {
        setError(err)
        setLoading(false)
      }
    }

    fetchObs()
  }, [chapter, verses])

  return { data, loading, error }
}
