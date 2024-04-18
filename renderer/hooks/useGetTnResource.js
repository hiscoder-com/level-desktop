import { useEffect, useState } from 'react';

export function useGetTnResource({ id, resource, mainResource, chapter }) {
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState([]);
  useEffect(() => {
    const tn = window.electronAPI.getTN(id, resource, mainResource, chapter);
    setData(tn);
    setIsLoading(false);
  }, [id, resource, chapter]);

  return { isLoading, data };
}
