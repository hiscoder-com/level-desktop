import { useEffect, useMemo, useState } from "react";

import dynamic from "next/dynamic";

import RightArrow from "../public/icons/right-arrow.svg";
import LeftArrow from "../public/icons/left-arrow.svg";
import Close from "../public/icons/close.svg";
import Trash from "../public/icons/trash.svg";
import Plus from "../public/icons/plus.svg";
import Down from "../public/icons/arrow-down.svg";
import Back from "../public/icons/left.svg";

import { useGetDictionary } from "../hooks/useGetDictionary";
import Modal from "./Modal";
import { Disclosure } from "@headlessui/react";

const t = (str) => str;

const Redactor = dynamic(
  () => import("@texttree/notepad-rcl").then((mod) => mod.Redactor),
  {
    ssr: false,
  }
);

const countWordsOnPage = 10;

function Dictionary({ config: { id }, toolName }) {
  const isRtl = false;
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
    let data = dictionary.filter(({ title }) => {
      return title
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
    <div className="relative h-full">
      <div className="flex gap-4 w-full items-center">
        <div className="relative w-full flex items-center ">
          <input
            className="input-primary"
            value={searchQuery}
            onChange={(e) => {
              // setCurrentPageWords(0);
              setSearchQuery(e.target.value);
            }}
            placeholder={t("common:Search")}
          />
          {searchQuery && (
            <Close
              className={`absolute р-6 w-6 z-10 cursor-pointer ${
                isRtl ? "left-2" : "right-2 "
              }`}
              onClick={getAll}
            />
          )}
        </div>
        <button className="btn-tertiary p-3" onClick={addWord}>
          <Plus className="w-6 h-6 stroke-th-text-secondary stroke-2" />
        </button>
      </div>
      <Card>
        <div className="mt-4">
          <Alphabet
            alphabet={alphabet}
            getAll={getAll}
            setSearchQuery={setSearchQuery}
            setCurrentPage={setCurrentPage}
            t={t}
          />
        </div>
      </Card>
      <div className="relative">
        {!activeWord ? (
          <>
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
                    className="flex justify-between items-start group my-3 bg-th-secondary-100 rounded-lg cursor-pointer"
                    onClick={() => {
                      setWordId(el.id);
                    }}
                  >
                    <div className="p-2 mr-4 font-bold">{el.title}</div>
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
              </div>
            ) : (
              <div className="mt-2">{t("NoMatches")}</div>
            )}
          </>
        ) : (
          <>
            <div
              className="flex w-fit p-1 cursor-pointer hover:opacity-70 rounded-full bg-th-secondary-100 absolute"
              onClick={() => {
                saveWord();
                setActiveWord(null);
                setWordId(null);
              }}
            >
              <Back className="w-8 stroke-th-primary-200" />
            </div>
            <Redactor
              classes={{
                title:
                  "bg-th-secondary-100 p-2 my-4 ml-12 font-bold rounded-lg",
                redactor:
                  "p-4 my-4 pb-20 bg-th-secondary-100 overflow-hidden break-words rounded-lg",
              }}
              activeNote={activeWord}
              setActiveNote={setActiveWord}
              readOnly={false}
              placeholder={t("TextDescriptionWord")}
              isSelectableTitle
            />
          </>
        )}

        <Modal isOpen={isOpenModal} closeHandle={() => setIsOpenModal(false)}>
          <div className="flex flex-col gap-7 items-center">
            <div className="text-center text-2xl">
              {t("AreYouSureDelete") + " " + wordToDel?.title + "?"}
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
      <div
        className={`flex bottom-0 justify-center absolute w-full gap-10 ${
          totalPageCount > 1 ? "opacity-100" : "opacity-0"
        }`}
      >
        <button
          className="px-5 py-5 rounded-full duration-300 hover:bg-white active:bg-gray-100 disabled:opacity-50 disabled:hover:bg-transparent"
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
          className="px-5 py-5 rounded-full duration-300 hover:bg-white active:bg-gray-100 disabled:opacity-50 disabled:hover:bg-transparent"
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
    </div>
  );
}

export default Dictionary;

function Alphabet({ alphabet, setCurrentPage, setSearchQuery, t }) {
  return (
    <div className="flex flex-wrap py-3 px-4 bg-th-secondary-100 rounded-lg w-full font-bold">
      {alphabet &&
        alphabet.map((letter) => (
          <div
            onClick={() => {
              setCurrentPage(0);
              setSearchQuery(letter.toLowerCase());
            }}
            className="px-1.5 cursor-pointer hover:opacity-50"
            key={letter}
          >
            {letter}
          </div>
        ))}
    </div>
  );
}
function Card({ children, isOpen = true, isHidden = false }) {
  return (
    <div className="flex flex-col w-full gap-3 bg-th-secondary-10 mt-2">
      <Disclosure defaultOpen={isOpen}>
        {({ open }) => (
          <>
            <Disclosure.Panel>{children}</Disclosure.Panel>
            <Disclosure.Button>
              {!isHidden && (
                <div className="flex gap-1 justify-center w-full pt-3 border-t border-th-secondary-300 text-th-secondary-300">
                  <span>{t(open ? "Hide" : "Open")}</span>
                  <Down
                    className={`w-6 max-w-[1.5rem] stroke-th-secondary-300 ${
                      open ? "rotate-180 transform" : ""
                    }`}
                  />
                </div>
              )}
            </Disclosure.Button>
          </>
        )}
      </Disclosure>
    </div>
  );
}
