import { useEffect, useState } from 'react'

export default function useGetObsResource({ chapter }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchObs() {
      try {
        setLoading(true)
        if (!window.electron || !window.electron.readOBSZipFile) {
          throw new Error('The window.electron API is unavailable')
        }
        const result = await window.electron.readOBSZipFile(chapter)
        setData(result)
        setLoading(false)
      } catch (err) {
        setError(err)
        setLoading(false)
      }
    }

    fetchObs()
  }, [chapter])

  return { data, loading, error }
}
