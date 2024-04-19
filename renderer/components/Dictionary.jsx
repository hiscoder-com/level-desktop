import { useEffect, useMemo, useState } from "react";

import dynamic from "next/dynamic";
import RightArrow from "../public/icons/right-arrow.svg";
import LeftArrow from "../public/icons/left-arrow.svg";
import Close from "../public/icons/close.svg";
import Trash from "../public/icons/trash.svg";
import { useGetDictionary } from "../hooks/useGetDictionary";
import Modal from "./Modal";

const t = (str) => str;

const Redactor = dynamic(
  () => import("@texttree/notepad-rcl").then((mod) => mod.Redactor),
  {
    ssr: false,
  }
);

const countWordsOnPage = 3000;

function Dictionary({ config: { id }, toolName }) {
  const [currentPage, setCurrentPage] = useState(0);
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [errorText, setErrorText] = useState(false);
  const [wordToDel, setWordToDel] = useState(null);
  const [activeWord, setActiveWord] = useState();
  const [wordId, setWordId] = useState("");
  const [words, setWords] = useState({ data: [], count: 0 });
  const { data: dictionary, alphabet, mutate } = useGetDictionary(id);

  const totalPageCount = useMemo(
    () => Math.ceil(words?.count / countWordsOnPage),
    [words]
  );

  const getAll = () => {
    setCurrentPage(0);
    setSearchQuery("");
    getWords();
  };

  const getWords = (searchQuery = "", pageNumber = 0) => {
    const getPagination = (page, size) => {
      const from = page ? page * size : 0;
      const to = page ? from + size : size;
      return { from, to };
    };
    const { from, to } = getPagination(pageNumber, countWordsOnPage);
    let data = dictionary.filter(({ name }) => {
      return name
        .toLocaleLowerCase()
        .startsWith(searchQuery.toLocaleLowerCase());
    });
    const wordsCount = data.length;
    if (wordsCount === 0) {
      setWords({ data: [], count: wordsCount });
      return;
    }

    data = data.slice(from, to);
    if (data?.length) {
      setWords({ data, count: wordsCount });
    }
  };

  useEffect(() => {
    if (dictionary) {
      getWords();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dictionary]);

  useEffect(() => {
    getWords(searchQuery, currentPage);
  }, [searchQuery]);

  useEffect(() => {
    if (!wordId) {
      return;
    }
    const currentWord = words?.data?.find((el) => el.id === wordId);
    if (!currentWord) {
      setActiveWord();
      return;
    }
    console.log(currentWord);
    const currentWordData = window.electronAPI.getWord(id, wordId);
    setActiveWord(JSON.parse(currentWordData));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wordId]);

  const addWord = () => {
    const wordId = (
      "000000000" + Math.random().toString(36).substring(2)
    ).slice(-9);
    window.electronAPI.addWord(id, wordId);
    mutate();
  };

  const removeWord = (wordid) => {
    window.electronAPI.removeWord(id, wordid);
    mutate();
  };

  const saveWord = async () => {
    window.electronAPI.updateWord(id, activeWord);
    mutate();
    // getWords(searchQuery, currentPage);
  };

  const showError = (err, placeholder) => {
    if (err?.response?.data?.error) {
      setErrorText(`${t("WordExist")} "${placeholder}"`);
    }
    setTimeout(() => {
      setErrorText(null);
    }, 2000);
  };

  useEffect(() => {
    if (!activeWord) {
      return;
    }
    const timer = setTimeout(() => {
      saveWord();
    }, 2000);
    return () => {
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeWord]);
  return (
    <div className="relative">
      {!activeWord ? (
        <>
          <div className="mr-11">
            <Alphabet
              alphabet={alphabet}
              getAll={getAll}
              setSearchQuery={setSearchQuery}
              setCurrentPage={setCurrentPage}
              t={t}
            />
            <input
              className="input max-w-xs mt-2"
              value={searchQuery}
              onChange={(e) => {
                setCurrentPage(0);
                setSearchQuery(e.target.value);
              }}
            />
          </div>
          <div className="absolute top-0 right-0">
            <button
              className="mb-4 right-0 btn-cyan text-xl font-bold"
              onClick={addWord}
            >
              +
            </button>
          </div>
          <div
            className={`${
              errorText ? "block" : "hidden"
            } absolute top-11 right-0 p-3 bg-red-200`}
          >
            {errorText}
          </div>
          {words?.data?.length ? (
            <div className="mt-2">
              {words.data.map((el) => (
                <div
                  key={el.id}
                  className="flex justify-between items-start group my-3 bg-cyan-50 rounded-lg cursor-pointer shadow-md"
                  onClick={() => {
                    setWordId(el.id);
                  }}
                >
                  <div className="p-2 mr-4 font-bold">{el.name}</div>
                  <button
                    className="p-2 m-1 top-0 opacity-0 group-hover:opacity-100"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsOpenModal(true);
                      setWordToDel(el);
                    }}
                  >
                    <Trash className={"w-4 h-4 text-cyan-800"} />
                  </button>
                </div>
              ))}
              {totalPageCount > 1 && (
                <div className="flex justify-around bottom-0 left-0">
                  <button
                    className="px-5 py-5 rounded-full duration-300 hover:bg-white active:bg-gray-100 disabled:opacity-0 disabled:hover:bg-transparent"
                    disabled={currentPage === 0}
                    onClick={() =>
                      setCurrentPage((prev) => {
                        getWords(searchQuery, prev - 1);
                        return prev - 1;
                      })
                    }
                  >
                    <LeftArrow className="w-6 h-6" />
                  </button>
                  <button
                    className="px-5 py-5 rounded-full duration-300 hover:bg-white active:bg-gray-100 disabled:opacity-0 disabled:hover:bg-transparent"
                    disabled={currentPage >= totalPageCount - 1}
                    onClick={() => {
                      setCurrentPage((prev) => {
                        getWords(searchQuery, prev + 1);
                        return prev + 1;
                      });
                    }}
                  >
                    <RightArrow className="w-6 h-6" />
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="mt-2">{t("NoMatches")}</div>
          )}
        </>
      ) : (
        <>
          <div
            className="absolute top-0 right-0 pr-3 w-10 cursor-pointer"
            onClick={() => {
              saveWord();
              setActiveWord(null);
              setWordId(null);
            }}
          >
            <Close />
          </div>
          <Redactor
            classes={{
              wrapper: "",
              title: "bg-cyan-50 p-2 my-4 mr-12 font-bold rounded-lg shadow-md",
              redactor:
                "p-4 my-4 pb-20 bg-cyan-50 overflow-hidden break-words rounded-lg shadow-md",
            }}
            activeNote={activeWord}
            setActiveNote={setActiveWord}
            readOnly={false}
            placeholder={t("TextDescriptionWord")}
          />
        </>
      )}

      <Modal isOpen={isOpenModal} closeHandle={() => setIsOpenModal(false)}>
        <div className="flex flex-col gap-7 items-center">
          <div className="text-center text-2xl">
            {t("AreYouSureDelete") + " " + wordToDel?.name + "?"}
          </div>
          <div className="flex w-1/2 gap-7">
            <button
              className="btn-secondary flex-1"
              onClick={() => {
                setIsOpenModal(false);
                if (wordToDel) {
                  removeWord(wordToDel.id);
                  setWordToDel(null);
                }
              }}
            >
              {t("Yes")}
            </button>
            <button
              className="btn-secondary flex-1"
              onClick={() => {
                setWordToDel(null);
                setIsOpenModal(false);
              }}
            >
              {t("No")}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default Dictionary;

function Alphabet({ alphabet, getAll, setCurrentPage, setSearchQuery, t }) {
  return (
    <div className="flex flex-wrap">
      {alphabet &&
        alphabet.map((el) => (
          <div
            onClick={() => {
              setCurrentPage(0);
              setSearchQuery(el.toLowerCase());
            }}
            className="py-1 px-3 rounded-md cursor-pointer hover:bg-gray-200"
            key={el}
          >
            {el}
          </div>
        ))}
      <div
        className="py-1 px-3 rounded-md cursor-pointer hover:bg-gray-200"
        onClick={getAll}
      >
        {t("ShowAll")}
      </div>
    </div>
  );
}
