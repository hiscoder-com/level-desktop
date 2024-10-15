import { useEffect, useState } from 'react'
import { parseChapter } from '@/helpers/usfm'

function sortVerses(a, b) {
  const extractNumber = (verse) => {
    const [start] = verse.split('-').map(Number);
    return start;
  };

  return extractNumber(a.verse) - extractNumber(b.verse);
};

function filterEnabledVerses(data, verses) {
  const versesEnabled = Object.keys(verses).reduce((acc, key) => {
    acc[key] = verses[key].enabled;
    return acc;
  }, {});

  return data.filter((v) => versesEnabled[v.verse]);
}

export function useGetUsfmResource({ id, resource, chapter, wholeChapter }) {
  const [isLoading, setIsLoading] = useState(true)
  const [data, setData] = useState([])
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const usfm = await window.electronAPI.getUsfm(id, resource, chapter);
      let _data = parseChapter(usfm).filter((el) => el.verse !== 'front');
      if (!wholeChapter) {
        const verses = await window.electronAPI.getChapter(id, chapter);
        _data = filterEnabledVerses(_data, verses);
      }
      _data = _data.sort(sortVerses);
      setData(_data);
      setIsLoading(false);
    };

    fetchData();
  }, [id, resource, chapter, wholeChapter])

  return { isLoading, data }
}
