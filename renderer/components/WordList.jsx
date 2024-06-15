import React from 'react'

import dynamic from 'next/dynamic'

import { useTranslation } from '@/next-i18next'

import Modal from './Modal'

import Trash from '../public/icons/trash.svg'
import Back from '../public/icons/left.svg'

const Redactor = dynamic(
  () => import('@texttree/notepad-rcl').then((mod) => mod.Redactor),
  {
    ssr: false,
  }
)

const WordList = ({
  setIsOpenModal,
  setActiveWord,
  isOpenModal,
  activeWord,
  wordToDel,
  projectId,
  words,
  saveWord,
  setWordId,
  listUpdate,
  searchQuery,
  setWordToDel,
  setSearchQuery,
}) => {
  const { t } = useTranslation()

  const removeWord = (wordid) => {
    window.electronAPI.removeWord(projectId, wordid)
    setSearchQuery('')
    listUpdate()
  }

  return (
    <>
      {!activeWord ? (
        <>
          {!words?.data?.length ? (
            <div className="mt-4 opacity-40 cursor-default">
              {searchQuery !== '' ? t('NoMatches') : t('NoWords')}
            </div>
          ) : (
            <div className="mt-2">
              {words.data.map((el) => (
                <div
                  key={el.id}
                  className="flex justify-between items-start group my-3 bg-th-secondary-100 rounded-lg cursor-pointer"
                  onClick={() => setWordId(el.id)}
                >
                  <div className="p-2 mr-4 font-bold">{el.title}</div>
                  <button
                    className="p-2 m-1 top-0 opacity-0 group-hover:opacity-100"
                    onClick={(e) => {
                      e.stopPropagation()
                      setIsOpenModal(true)
                      setWordToDel(el)
                    }}
                  >
                    <Trash className={'w-4 h-4 text-cyan-800'} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        <>
          <div
            className="absolute flex w-fit p-1 cursor-pointer hover:opacity-70 rounded-full bg-th-secondary-100"
            onClick={() => {
              saveWord()
              setActiveWord(null)
              setWordId(null)
            }}
          >
            <Back className="w-8 stroke-th-primary-200" />
          </div>
          <Redactor
            classes={{
              title: 'bg-th-secondary-100 p-2 my-4 ml-12 font-bold rounded-lg',
              redactor: 'p-4 my-4 pb-20 bg-th-secondary-100 break-words rounded-lg',
            }}
            activeNote={activeWord}
            setActiveNote={setActiveWord}
            readOnly={false}
            placeholder={t('TextDescriptionWord')}
            isSelectableTitle
          />
        </>
      )}

      <Modal isOpen={isOpenModal} closeHandle={() => setIsOpenModal(false)}>
        <div className="flex flex-col gap-7 items-center">
          <div className="text-center text-2xl">
            {t('AreYouSureDelete') + ' ' + wordToDel?.title + '?'}
          </div>
          <div className="flex w-1/2 gap-7">
            <button
              className="btn-secondary flex-1"
              onClick={() => {
                setIsOpenModal(false)
                if (wordToDel) {
                  removeWord(wordToDel.id)
                  setWordToDel(null)
                }
              }}
            >
              {t('Yes')}
            </button>
            <button
              className="btn-secondary flex-1"
              onClick={() => {
                setWordToDel(null)
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

export default WordList
