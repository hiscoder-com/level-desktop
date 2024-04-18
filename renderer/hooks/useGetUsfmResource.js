import { useEffect, useState } from 'react';
import { parseChapter } from '../helpers/usfm';

export function useGetUsfmResource({ id, resource, chapter }) {
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState([]);
  useEffect(() => {
    const usfm = window.electronAPI.getUsfm(id, resource, chapter);
    const _data = parseChapter(usfm).filter((el) => el.verse !== 'front');
    setData(_data);
    setIsLoading(false);
  }, [id, resource, chapter]);

  return { isLoading, data };
}
