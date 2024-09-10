import dynamic from 'next/dynamic'

import { useTranslation } from '@/next-i18next'

import Modal from './Modal'

import Back from 'public/icons/left.svg'
import Trash from 'public/icons/trash.svg'

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
            <div className="mt-4 cursor-default opacity-40">
              {searchQuery !== '' ? t('NoMatches') : t('NoWords')}
            </div>
          ) : (
            <div className="mt-2">
              {words.data.map((el) => (
                <div
                  key={el.id}
                  className="group my-3 flex cursor-pointer items-start justify-between rounded-lg bg-th-secondary-100"
                  onClick={() => setWordId(el.id)}
                >
                  <div className="mr-4 p-2 font-bold">{el.title}</div>
                  <button
                    className="top-0 m-1 p-2 opacity-0 group-hover:opacity-100"
                    onClick={(e) => {
                      e.stopPropagation()
                      setIsOpenModal(true)
                      setWordToDel(el)
                    }}
                  >
                    <Trash className={'h-4 w-4 text-cyan-800'} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        <>
          <div
            className="absolute flex w-fit cursor-pointer rounded-full bg-th-secondary-100 p-1 hover:opacity-70"
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
        <div className="flex flex-col items-center gap-7">
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
