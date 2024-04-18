import { useEffect, useState } from 'react';

export function useGetDictionary({ id }) {
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState([]);
  const [alphabet, setAlphabet] = useState([]);
  const mutate = (id) => {
    const words = window.electronAPI.getWords(id);
    setData(
      Object.values(words).sort((a, b) =>
        new Intl.Collator(undefined, {
          numeric: true,
          ignorePunctuation: true,
          sensitivity: 'base',
        }).compare(a.name.toLocaleLowerCase(), b.name.toLocaleLowerCase())
      )
    );
    const alphabetMap = new Map(
      Object.values(words)
        .sort((a, b) =>
          new Intl.Collator(undefined, {
            numeric: true,
            ignorePunctuation: true,
            sensitivity: 'base',
          }).compare(a.name.toLocaleLowerCase(), b.name.toLocaleLowerCase())
        )
        .map((el) => [
          el.name.toLocaleUpperCase()[0],
          el.name.toLocaleUpperCase()[0],
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
