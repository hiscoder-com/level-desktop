import { useEffect, useState } from 'react';

export function useGetPersonalNotes({ id }) {
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState([]);
  const mutate = (id) => {
    const notes = window.electronAPI.getNotes(id);
    setData(notes);
  };
  useEffect(() => {
    mutate(id);
    setIsLoading(false);
  }, [id]);

  return { isLoading, data, mutate };
}
