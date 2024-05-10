import { useEffect, useState } from 'react';

export function useGetDictionary({ id }) {
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState([]);
  const [alphabet, setAlphabet] = useState([]);
  const mutate = () => {
    const words = window.electronAPI.getWords();
    setData(
      Object.values(words).sort((a, b) =>
        new Intl.Collator(undefined, {
          numeric: true,
          ignorePunctuation: true,
          sensitivity: 'base',
        }).compare(a.title.toLocaleLowerCase(), b.title.toLocaleLowerCase())
      )
    );
    const alphabetMap = new Map(
      Object.values(words)
        .sort((a, b) =>
          new Intl.Collator(undefined, {
            numeric: true,
            ignorePunctuation: true,
            sensitivity: 'base',
          }).compare(a.title.toLocaleLowerCase(), b.title.toLocaleLowerCase())
        )
        .map((el) => [
          el.title.toLocaleUpperCase()[0],
          el.title.toLocaleUpperCase()[0],
        ])
    );
    setAlphabet(Array.from(alphabetMap.values()));
  };
  useEffect(() => {
    mutate(id);
    setIsLoading(false);
  }, [id]);
  return { isLoading, data, alphabet, mutate };
}
