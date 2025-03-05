import { useEffect, useState } from 'react'

export function useGetTwlObsResource({
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
    const twl = window.electronAPI.getTWLObs(id, resource, mainResource, chapter)
    setData(twl)
    setIsLoading(false)
  }, [id, resource, chapter])

  return { isLoading, data }
}
