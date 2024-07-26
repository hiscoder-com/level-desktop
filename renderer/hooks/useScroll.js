import { useEffect, useState } from 'react'
import { useRecoilState } from 'recoil'
import { checkLSVal } from '@/helpers/checkls'
import { currentVerse } from '@/helpers/atoms'

export function useScroll({ toolName, isLoading, idPrefix }) {
  const [currentScrollVerse, setCurrentScrollVerse] = useRecoilState(currentVerse)
  const [highlightIds, setHighlightIds] = useState(() => {
    return checkLSVal('highlightIds', {}, 'object')
  })

  useEffect(() => {
    setTimeout(() => {
      document?.getElementById(idPrefix + currentScrollVerse)?.scrollIntoView()
    }, 100)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentScrollVerse, isLoading])

  const handleSaveScroll = (verse, id) => {
    if (id) {
      window.electronAPI.setItem(
        'highlightIds',
        JSON.stringify({ ...highlightIds, [toolName]: 'id' + id })
      )
      setHighlightIds((prev) => ({ ...prev, [toolName]: 'id' + id }))
    }
    window.electronAPI.setItem('currentScrollVerse', verse)
    setCurrentScrollVerse(verse)
  }
  return {
    highlightId: highlightIds[toolName],
    currentScrollVerse,
    handleSaveScroll,
  }
}
