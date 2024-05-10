import { useEffect, useState } from 'react';

export function useGetTeamNotes({ id }) {
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState([]);
  const mutate = () => {
    const notes = window.electronAPI.getNotes('team-notes');
    setData(notes);
  };
  useEffect(() => {
    mutate(id);
    setIsLoading(false);
  }, [id]);

  return { isLoading, data, mutate };
}
