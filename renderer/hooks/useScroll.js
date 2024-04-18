import { useEffect, useState } from 'react';
import { atom, useRecoilState } from 'recoil';
import { checkLSVal } from '../helpers/checkls';

const localStorageEffect =
  (key) =>
  ({ setSelf, onSet }) => {
    if (typeof window !== 'undefined') {
      const savedValue = window.electronAPI.getItem(key);
      if (savedValue != null) {
        setSelf(JSON.parse(savedValue));
      }

      onSet((newValue, _, isReset) => {
        isReset
          ? window.electronAPI.removeItem(key)
          : window.electronAPI.setItem(key, JSON.stringify(newValue));
      });
    }
  };

export const currentVerse = atom({
  key: 'currentVerse',
  default: '1',
  effects: [localStorageEffect('currentScrollVerse')],
});

export function useScroll({ toolName, isLoading, idPrefix }) {
  const [currentScrollVerse, setCurrentScrollVerse] =
    useRecoilState(currentVerse);
  const [highlightIds, setHighlightIds] = useState(() => {
    return checkLSVal('highlightIds', {}, 'object');
  });

  useEffect(() => {
    setTimeout(() => {
      document?.getElementById(idPrefix + currentScrollVerse)?.scrollIntoView();
    }, 100);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentScrollVerse, isLoading]);

  const handleSaveScroll = (verse, id) => {
    if (id) {
      window.electronAPI.setItem(
        'highlightIds',
        JSON.stringify({ ...highlightIds, [toolName]: 'id' + id })
      );
      setHighlightIds((prev) => ({ ...prev, [toolName]: 'id' + id }));
    }
    window.electronAPI.setItem('currentScrollVerse', verse);
    setCurrentScrollVerse(verse);
  };
  return {
    highlightId: highlightIds[toolName],
    currentScrollVerse,
    handleSaveScroll,
  };
}
