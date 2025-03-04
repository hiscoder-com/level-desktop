import { useEffect, useState } from 'react'

export function useGetTnObsResource({
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
    const tn = window.electronAPI.getTNObs(id, resource, mainResource, chapter)
    setData(tn)
    setIsLoading(false)
  }, [id, resource, chapter])

  return { isLoading, data }
}
