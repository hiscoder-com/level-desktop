import { useEffect, useState } from 'react';

export function useGetTqResource({ id, resource, mainResource, chapter }) {
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState([]);
  useEffect(() => {
    const tq = window.electronAPI.getTQ(id, resource, mainResource, chapter);
    setData(tq);
    setIsLoading(false);
  }, [id, resource, chapter]);

  return { isLoading, data };
}
