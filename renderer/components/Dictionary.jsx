import { useEffect, useMemo, useState } from 'react'

import { generateUniqueId } from '@/helpers/noteEditor'
import { useGetDictionary } from '@/hooks/useGetDictionary'
import { useTranslation } from '@/next-i18next'
import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/react'
import toast from 'react-hot-toast'

import Alphabet from './Alphabet'
import LoadingPage from './LoadingPage'
import SearchAndAddWords from './SearchAndAddWords'
import WordList from './WordList'

import Down from 'public/icons/arrow-down.svg'
import LeftArrow from 'public/icons/left-arrow.svg'
import RightArrow from 'public/icons/right-arrow.svg'

const countWordsOnPage = 10

function Dictionary({ config: { id, language } }) {
  const { t } = useTranslation(['common', 'projects'])
  const [isLoading, setIsLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(0)
  const [isOpenModal, setIsOpenModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [wordToDel, setWordToDel] = useState(null)
  const [activeWord, setActiveWord] = useState()
  const [wordId, setWordId] = useState('')
  const [words, setWords] = useState({ data: [], count: 0 })
  const { data: dictionary, alphabet, mutate } = useGetDictionary(id)
  const is_rtl = language.is_rtl

  const totalPageCount = useMemo(
    () => Math.ceil(words?.count / countWordsOnPage),
    [words]
  )

  const getAll = () => {
    setCurrentPage(0)
    setSearchQuery('')
    getWords()
  }

  const getWords = (searchQuery = '', pageNumber = 0) => {
    const getPagination = (page, size) => {
      const from = page ? page * size : 0
      const to = page ? from + size : size
      return { from, to }
    }
    const { from, to } = getPagination(pageNumber, countWordsOnPage)
    let data = dictionary.filter(({ title }) => {
      return title.toLocaleLowerCase().startsWith(searchQuery.toLocaleLowerCase())
    })
    const wordsCount = data.length
    if (wordsCount === 0) {
      setWords({ data: [], count: wordsCount })
      return
    }

    data = data.slice(from, to)
    if (data?.length) {
      setWords({ data, count: wordsCount })
    }
  }

  useEffect(() => {
    if (dictionary && !searchQuery) {
      getWords()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dictionary])

  useEffect(() => {
    getWords(searchQuery, currentPage)
  }, [searchQuery])

  useEffect(() => {
    if (!wordId) {
      return
    }
    const currentWord = words?.data?.find((el) => el.id === wordId)
    if (!currentWord) {
      setActiveWord()
      return
    }
    const currentWordData = window.electronAPI.getWord(id, wordId)
    setActiveWord(JSON.parse(currentWordData))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wordId])

  useEffect(() => {
    if (!activeWord) {
      return
    }
    saveWord()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeWord])

  const saveWord = async () => {
    window.electronAPI.updateWord(id, activeWord)
    mutate()
    setCurrentPage(0)
  }

  function checkAndAppendNewTitle(title, allWords) {
    const existingTitles = allWords.map((word) => word.title.toLowerCase())
    let newTitle = title

    while (existingTitles.includes(newTitle.toLowerCase())) {
      newTitle += '_new'
    }
    return newTitle
  }

  const importWords = async () => {
    const fileInput = document.createElement('input')
    fileInput.type = 'file'
    fileInput.accept = '.json'
    fileInput.addEventListener('change', async (event) => {
      try {
        setIsLoading(true)
        const file = event.target.files[0]
        if (!file) {
          throw new Error(t('NoFileSelected'))
        }
        const fileContents = await file.text()

        if (!fileContents.trim()) {
          throw new Error(t('EmptyFileContent'))
        }

        const importedData = JSON.parse(fileContents)

        if (importedData.type !== 'dictionary') {
          throw new Error(t('ContentError'))
        }

        for (const word of importedData.data) {
          const newWord = {
            id: generateUniqueId(dictionary.map(({ id }) => id)),
            title: checkAndAppendNewTitle(word.title, dictionary),
            data: word.data,
          }
          window.electronAPI.importWord(id, newWord)
        }
        getAll()
        mutate()
        toast.success(t('projects:ImportSuccess'))
      } catch (error) {
        console.log(error.message)
        toast.error(t('projects:ImportError'))
      } finally {
        setTimeout(() => {
          setIsLoading(false)
        }, 1000)
      }
    })

    fileInput.click()
  }

  function exportWords() {
    setSearchQuery('')
    try {
      if (!dictionary || !dictionary.length) {
        throw new Error(t('NoData'))
      }
      const wordIds = dictionary.map(({ id }) => id)
      const words = window.electronAPI.getWordsWithData(id, wordIds)
      const data = words.map((word) => {
        return {
          is_folder: word.is_folder,
          parent: word.parent,
          title: word.title,
          data: word.data,
          created_at: word.created_at,
        }
      })

      const jsonString = JSON.stringify({ type: 'dictionary', data }, null, 2)

      const blob = new Blob([jsonString], { type: 'application/json' })

      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)

      const currentDate = new Date()
      const formattedDate = currentDate.toISOString().split('T')[0]

      const fileName = `dictionary_${formattedDate}.json`

      link.download = fileName
      document.body.appendChild(link)
      link.click()

      document.body.removeChild(link)
    } catch (error) {
      console.log(error.message)
    }
  }

  const listUpdate = () => {
    mutate()
    setCurrentPage(0)
  }

  const sharedProps = {
    searchQuery,
    setSearchQuery,
    projectId: id,
    listUpdate,
    activeWord,
  }

  return (
    <>
      <LoadingPage loadingPage={isLoading} />
      <div className="relative">
        <SearchAndAddWords
          {...sharedProps}
          importWords={importWords}
          exportWords={exportWords}
          defaultDirection={is_rtl ? 'rtl' : 'ltr'}
        />
        {alphabet.length ? (
          <Card t={t}>
            <div className="mt-4">
              <Alphabet
                alphabet={alphabet}
                getAll={getAll}
                setSearchQuery={setSearchQuery}
                setCurrentPage={setCurrentPage}
                disabled={activeWord}
              />
            </div>
          </Card>
        ) : (
          <p className="cursor-default py-8 opacity-40">{t('EmptyAlphabet')}</p>
        )}

        <div className="relative">
          <WordList
            {...sharedProps}
            words={words}
            setWordId={setWordId}
            isOpenModal={isOpenModal}
            setActiveWord={setActiveWord}
            setIsOpenModal={setIsOpenModal}
            wordToDel={wordToDel}
            saveWord={saveWord}
            setWordToDel={setWordToDel}
          />
        </div>
        {totalPageCount > 1 && !activeWord && (
          <div className="flex w-full justify-center gap-10">
            <button
              className="rounded-full px-5 py-5 duration-300 hover:bg-white active:bg-gray-100 disabled:opacity-50 disabled:hover:bg-transparent"
              disabled={currentPage === 0}
              onClick={() =>
                setCurrentPage((prev) => {
                  getWords(searchQuery, prev - 1)
                  return prev - 1
                })
              }
            >
              <LeftArrow className="h-6 w-6" />
            </button>
            <button
              className="rounded-full px-5 py-5 duration-300 hover:bg-white active:bg-gray-100 disabled:opacity-50 disabled:hover:bg-transparent"
              disabled={currentPage >= totalPageCount - 1}
              onClick={() => {
                setCurrentPage((prev) => {
                  getWords(searchQuery, prev + 1)
                  return prev + 1
                })
              }}
            >
              <RightArrow className="h-6 w-6" />
            </button>
          </div>
        )}
      </div>
    </>
  )
}

export default Dictionary

function Card({ children, t, isOpen = true, isHidden = false }) {
  return (
    <div className="mt-6 flex w-full flex-col gap-3 bg-th-secondary-10">
      <Disclosure defaultOpen={isOpen}>
        {({ open }) => (
          <>
            <DisclosurePanel>{children}</DisclosurePanel>
            <DisclosureButton>
              {!isHidden && (
                <div className="flex w-full justify-center gap-1 border-t border-th-secondary-300 pt-3 text-th-secondary-300">
                  <span>{t(open ? 'Hide' : 'Open')}</span>
                  <Down
                    className={`w-6 max-w-[1.5rem] stroke-th-secondary-300 ${
                      open ? 'rotate-180 transform' : ''
                    }`}
                  />
                </div>
              )}
            </DisclosureButton>
          </>
        )}
      </Disclosure>
    </div>
  )
}
