import { useCallback, useEffect, useRef, useState } from 'react'

import { useTranslation } from 'react-i18next'

import Retelling from './Retelling'
import Bible from './Bible'
import BlindEditor from './BlindEditor'
import Dictionary from './Dictionary'
import Editor from './Editor'
import Info from './Info'
import PersonalNotes from './PersonalNotes'
import TN from './TN'
import TQ from './TQ'
import TWL from './TWL'
import Divider from './Divider'
import TeamNotes from './TeamNotes'
import Merger from './Merger'

function Tool({ config, toolName, isSingleTab }) {
  const { t } = useTranslation()
  let CurrentTool
  let title = toolName

  switch (toolName) {
    case 'bible':
      CurrentTool = Bible
      title = t('bible')
      break
    case 'divider':
      CurrentTool = Divider
      title = t('divider')
      break

    case 'merger':
      CurrentTool = Merger
      break

    case 'twl':
      CurrentTool = TWL
      break

    case 'tn':
      CurrentTool = TN
      break

    case 'tq':
      CurrentTool = TQ
      break

    case 'editor':
      CurrentTool = Editor
      title = t('translate')
      break

    case 'blindEditor':
      CurrentTool = BlindEditor
      title = t('translate')
      break

    case 'personalNotes':
      CurrentTool = PersonalNotes
      title = t('personalNotes')
      break

    case 'teamNotes':
      CurrentTool = TeamNotes
      title = t('teamNotes')
      break

    case 'retelling':
      CurrentTool = Retelling
      title = t('retelling')
      break

    case 'dictionary':
      CurrentTool = Dictionary
      title = t('dictionary')
      break

    case 'info':
      CurrentTool = Info
      title = t('info')
      break

    default:
      return <div>{t('WrongResource')}</div>
  }
  const contentRef = useRef(null)
  const [hasVerticalScroll, setHasVerticalScroll] = useState(false)

  const checkVerticalScroll = useCallback(() => {
    const contentElement = contentRef.current
    if (contentElement) {
      const hasScroll = contentElement.scrollHeight > contentElement.clientHeight
      setHasVerticalScroll(hasScroll)
    }
  }, [])

  useEffect(() => {
    const handleResize = () => {
      checkVerticalScroll()
    }

    window.addEventListener('resize', handleResize)
    checkVerticalScroll()

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [checkVerticalScroll])

  useEffect(() => {
    checkVerticalScroll()
  }, [toolName, checkVerticalScroll])

  useEffect(() => {
    const contentElement = contentRef.current
    if (contentElement) {
      const observer = new MutationObserver(checkVerticalScroll)
      observer.observe(contentElement, { subtree: true, childList: true })

      return () => {
        observer.disconnect()
      }
    }
  }, [checkVerticalScroll])

  return (
    <>
      <div
        className={`h-10 bg-th-primary-200 ${
          isSingleTab
            ? 'rounded-tr-xl'
            : 'pt-2.5 px-4 font-bold truncate text-th-text-secondary-100 rounded-t-xl'
        }`}
      >
        {!isSingleTab && title}
      </div>
      <div className="adaptive-card border border-b-th-secondary-300 border-l-th-secondary-300 border-r-th-secondary-300 rounded-b-lg box-border">
        <div
          className={`h-full overflow-x-hidden overflow-y-auto py-4 pl-4 ${
            hasVerticalScroll ? 'pr-1' : 'pr-5'
          }`}
          ref={contentRef}
        >
          <CurrentTool config={config} toolName={toolName} />
        </div>
      </div>
    </>
  )
}

export default Tool
