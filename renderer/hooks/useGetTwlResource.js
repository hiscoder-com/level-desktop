import { useEffect, useState } from 'react';

export function useGetTwlResource({ id, resource, mainResource, chapter }) {
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState([]);
  useEffect(() => {
    const twl = window.electronAPI.getTWL(id, resource, mainResource, chapter);
    setData(twl);
    setIsLoading(false);
  }, [id, resource, chapter]);

  return { isLoading, data };
}
