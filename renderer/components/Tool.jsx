import { useCallback, useEffect, useRef, useState } from 'react'

import { useTranslation } from '@/next-i18next'

import Bible from './Bible'
import BlindEditor from './BlindEditor'
import Dictionary from './Dictionary'
import Divider from './Divider'
import Editor from './Editor'
import Info from './Info'
import Merger from './Merger'
import PersonalNotes from './PersonalNotes'
import Questions from './Questions'
import Retelling from './Retelling'
import TeamNotes from './TeamNotes'
import TN from './TN'
import TQ from './TQ'
import TWL from './TWL'

function Tool({ config, toolName, isSingleTab, resourceTitle }) {
  const { t } = useTranslation(['common', 'books'])
  let CurrentTool
  let title = toolName

  switch (toolName) {
    case 'obs':
      CurrentTool = Bible
      title = t('OBS')
      break
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
      title = t('tWords')
      break
    case 'tn':
      CurrentTool = TN
      title = t('tNotes')
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
    case 'translationQuestions':
    case 'observationQuestions':
    case 'discourseQuestions':
    case 'theologicalQuestions':
    case 'reflectionQuestions':
      CurrentTool = Questions
      title = t(toolName)
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

  const isSpecialTool = [
    'translate',
    'commandTranslate',
    'draftTranslate',
    'teamNotes',
    'personalNotes',
    'retelling',
    'dictionary',
  ].includes(toolName)

  const displayBookChapter =
    !isSpecialTool && config.book?.code
      ? `${t('books:' + config.book?.code)} ${config.chapter}, `
      : ''

  return (
    <>
      <div
        className={`h-10 bg-th-primary-200 pt-3 ${
          isSingleTab
            ? 'rounded-t-xl px-4 font-bold text-th-text-secondary-100'
            : 'truncate rounded-t-xl px-4 pt-2.5 font-bold text-th-text-secondary-100'
        }`}
      >
        <span>{displayBookChapter}</span>
        <span>{resourceTitle || title}</span>
      </div>
      <div className="adaptive-card box-border rounded-b-lg border border-b-th-secondary-300 border-l-th-secondary-300 border-r-th-secondary-300">
        <div
          className={`h-full overflow-y-auto overflow-x-hidden py-4 pl-4 ${
            hasVerticalScroll ? 'pr-1' : 'pr-5'
          }`}
          ref={contentRef}
        >
          <CurrentTool
            config={config}
            toolName={toolName}
            resourceTitle={resourceTitle}
            wholeChapter={config.wholeChapter}
          />
        </div>
      </div>
    </>
  )
}

export default Tool
