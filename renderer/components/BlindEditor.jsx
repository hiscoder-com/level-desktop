import { useEffect, useRef, useState } from 'react'

import { checkedVersesBibleState } from '@/helpers/atoms'
import { useTranslation } from '@/next-i18next'
import { useSetRecoilState } from 'recoil'

import { obsCheckAdditionalVerses } from './Bible'
import Modal from './Modal'
import RtlTextArea from './RtlTextArea'

import Check from 'public/icons/check.svg'
import Pencil from 'public/icons/pencil.svg'

function BlindEditor({
  config: { id, chapter = false, language = {}, typeProject = '' },
}) {
  const { t } = useTranslation()
  const [isShowFinalButton, setIsShowFinalButton] = useState(false)
  const [translatedVerses, setTranslatedVerses] = useState([])
  const [enabledInputs, setEnabledInputs] = useState([])
  const [enabledIcons, setEnabledIcons] = useState([])
  const [verseObjects, setVerseObjects] = useState([])
  const [isOpenModal, setIsOpenModal] = useState(false)
  const [firstStepRef, setFirstStepRef] = useState({})

  const textAreaRef = useRef([])
  const isRtl = language?.is_rtl || false

  const setCheckedVersesBible = useSetRecoilState(checkedVersesBibleState)

  useEffect(() => {
    const savedVerses = Object.entries(
      window.electronAPI.getChapter(id, chapter, typeProject)
    )
      .map(([k, v]) => ({ num: k, verse: v.text, enabled: v.enabled }))
      .filter((v) => v.enabled)
    setVerseObjects(savedVerses)
    let updatedArray = []
    const _verseObjects = savedVerses
    savedVerses.forEach((el) => {
      if (el.verse) {
        updatedArray.push(el.num.toString())
      }
    })
    setCheckedVersesBible(updatedArray)
    setTranslatedVerses(updatedArray)
    if (!updatedArray.length) {
      return
    }
    if (updatedArray.length === _verseObjects.length) {
      setEnabledIcons(['0'])
    } else {
      for (let index = 0; index < _verseObjects.length; index++) {
        if (
          _verseObjects[index].num.toString() === updatedArray[updatedArray.length - 1] &&
          index < _verseObjects.length - 1
        ) {
          setEnabledIcons([_verseObjects[index + 1].num.toString()])
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!verseObjects || !verseObjects.length) {
      return
    }
    if (verseObjects[verseObjects.length - 1].verse) {
      setIsShowFinalButton(
        enabledIcons?.[0] === verseObjects[verseObjects.length - 1].num.toString()
      )
    }
  }, [enabledIcons, verseObjects])

  const updateVerse = (id, text) => {
    setVerseObjects((prev) => {
      prev[id].verse = text.trim()
      return [...prev]
    })
  }

  const sendToDb = async (index) => {
    setTranslatedVerses((prev) => [...prev, verseObjects[index].num.toString()])
    window.electronAPI.updateVerse(
      id,
      chapter,
      verseObjects[index].num.toString(),
      verseObjects[index].verse,
      typeProject
    )
  }
  const saveVerse = (ref) => {
    const { index, currentNumVerse, nextNumVerse, prevNumVerse, isTranslating } = ref
    if ((index !== 0 && !verseObjects[index - 1].verse) || isTranslating) {
      const prevTextArea = textAreaRef?.current?.[index - 1]
      if (prevTextArea) {
        prevTextArea.focus()
      } else {
        const currentTextArea = textAreaRef?.current?.[index]
        if (currentTextArea) {
          currentTextArea.focus()
        }
      }
      return
    }

    setEnabledIcons((prev) => {
      return [
        ...prev,
        ...(index === 0 ? [currentNumVerse, nextNumVerse] : [nextNumVerse]),
      ].filter((el) => el !== prevNumVerse)
    })
    setCheckedVersesBible((prev) => [...prev, currentNumVerse])

    setEnabledInputs((prev) =>
      [...prev, currentNumVerse].filter((el) => el !== prevNumVerse)
    )
    if (index === 0) {
      return
    }

    sendToDb(index - 1)
  }
  const handleSaveVerse = (ref) => {
    if (ref.index === 0 && !ref.isTranslating) {
      setIsOpenModal(true)
      setFirstStepRef(ref)
    } else {
      saveVerse(ref)
    }
  }

  return (
    <>
      <div>
        {verseObjects.map((verseObject, index) => {
          const currentNumVerse = verseObject.num.toString()
          const nextNumVerse =
            index < verseObjects.length - 1 ? verseObjects[index + 1].num.toString() : ''
          const prevNumVerse = index !== 0 ? verseObjects[index - 1].num.toString() : ''
          const disabledButton = !(
            (index === 0 && !enabledIcons.length) ||
            enabledIcons.includes(currentNumVerse)
          )
          const isTranslating = enabledInputs.includes(verseObject.num.toString())
          const isTranslated = translatedVerses.includes(currentNumVerse)
          return (
            <div
              key={verseObject.num}
              className="my-3 flex items-center"
              dir={isRtl ? 'rtl' : 'ltr'}
            >
              <button
                onClick={() =>
                  handleSaveVerse({
                    index,
                    currentNumVerse,
                    nextNumVerse,
                    prevNumVerse,
                    isTranslating,
                  })
                }
                className={`rounded-2xl p-3 ${
                  isTranslating ? 'cursor-auto bg-th-primary-100' : 'bg-th-secondary-100'
                }`}
                disabled={disabledButton}
              >
                {isTranslated ? (
                  <Check className="h-4 w-4 stroke-2" />
                ) : (
                  <Pencil
                    className={`h-4 w-4 stroke-2 ${
                      disabledButton
                        ? 'stroke-th-secondary-300'
                        : !isTranslating
                          ? 'fill-th-secondary-100'
                          : 'stroke-th-text-secondary-100'
                    }`}
                  />
                )}
              </button>

              <div className="mx-4">{obsCheckAdditionalVerses(verseObject.num)}</div>
              {isTranslating ? (
                <RtlTextArea
                  className="focus:inline-none w-full resize-none focus:outline-none"
                  ref={(el) => (textAreaRef.current[index] = el)}
                  value={verseObject.verse ?? ''}
                  onChange={(newText) => updateVerse(index, newText)}
                  defaultDirection={isRtl ? 'rtl' : 'ltr'}
                />
              ) : (
                <div className="whitespace-pre-line">{verseObject.verse}</div>
              )}
            </div>
          )
        })}

        {isShowFinalButton && (
          <div className="flex w-full">
            <button
              onClick={() => {
                setEnabledIcons(['201'])
                setEnabledInputs([])
                sendToDb(verseObjects.length - 1)
              }}
              className={`btn-base bg-th-primary-100 text-th-text-secondary-100 hover:opacity-70 ${isRtl ? 'ml-auto' : ''}`}
            >
              {t('Save')}
            </button>
          </div>
        )}
      </div>
      <Modal isOpen={isOpenModal} closeHandle={() => setIsOpenModal(false)}>
        <div className="flex flex-col items-center gap-7">
          <div className="text-center text-2xl">{t('AreYouSureWantStartBlind')}</div>
          <div className="flex w-1/2 gap-7">
            <button
              className="btn-secondary flex-1"
              onClick={() => {
                setIsOpenModal(false)
                saveVerse(firstStepRef)
                setTimeout(() => {
                  if (textAreaRef.current && textAreaRef.current[0]) {
                    textAreaRef.current[0].focus()
                  }
                }, 1000)
              }}
            >
              {t('Yes')}
            </button>
            <button
              className="btn-secondary flex-1"
              onClick={() => {
                setIsOpenModal(false)
              }}
            >
              {t('No')}
            </button>
          </div>
        </div>
      </Modal>
    </>
  )
}

export default BlindEditor
