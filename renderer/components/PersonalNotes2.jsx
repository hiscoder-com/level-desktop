import { useEffect, useState } from "react";

import dynamic from "next/dynamic";

// import Back from "../public/icons/back.svg";
import Trash from "../public/icons/trash.svg";
import FileIcon from "../public/icons/file-icon.svg";
import CloseFolder from "../public/icons/close-folder.svg";
import OpenFolder from "../public/icons/open-folder.svg";
import ArrowDown from "../public/icons/folder-arrow-down.svg";
import ArrowRight from "../public/icons/folder-arrow-right.svg";
import Export from "../public/icons/export.svg";
import Import from "../public/icons/import.svg";
import Rename from "../public/icons/rename.svg";
import Close from "../public/icons/close.svg";
import { useGetPersonalNotes } from "../hooks/useGetPersonalNotes";
import Modal from "./Modal";
const icons = {
  file: <FileIcon className="w-6 h-6" />,
  arrowDown: <ArrowDown className="stroke-2" />,
  arrowRight: <ArrowRight className="stroke-2" />,
  openFolder: <OpenFolder className="w-6 h-6 stroke-[1.7]" />,
  closeFolder: <CloseFolder className="w-6 h-6" />,
};
const t = (str) => str;

const Redactor = dynamic(
  () => import("@texttree/notepad-rcl").then((mod) => mod.Redactor),
  {
    ssr: false,
  }
);

export default function PersonalNotes2({ config: { id }, toolName }) {
  const [noteId, setNoteId] = useState("");
  const [activeNote, setActiveNote] = useState(null);
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [noteToDel, setNoteToDel] = useState(null);
  const { data: notes, mutate } = useGetPersonalNotes(id);

  const saveNote = () => {
    window.electronAPI.updateNote(id, activeNote);
  };

  useEffect(() => {
    if (noteId && notes?.[noteId]) {
      const currentNote = window.electronAPI.getNote(id, noteId);
      setActiveNote(JSON.parse(currentNote));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [noteId]);

  const addNote = () => {
    const noteId = (
      "000000000" + Math.random().toString(36).substring(2)
    ).slice(-9);
    window.electronAPI.addNote(id, noteId);
    mutate();
  };

  const removeNote = (noteId) => {
    window.electronAPI.removeNote(id, noteId);
    mutate();
  };

  useEffect(() => {
    if (!activeNote) {
      mutate();
      return;
    }
    const timer = setTimeout(() => {
      saveNote();
    }, 2000);
    return () => {
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeNote]);

  const removeAllNotes = () => {
    window.electronAPI.removeAllNotes(id);
    mutate();
  };
  const classes = {
    container: "relative",
    back: "flex w-fit p-1 cursor-pointer hover:opacity-70 rounded-full bg-th-secondary-100",
    redactor: {
      title: "p-2 my-4 font-bold rounded-lg shadow-md",
      redactor:
        "pb-20 pt-4 px-4 my-4 overflow-hidden break-words rounded-lg shadow-md",
    },
    treeView: {
      nodeWrapper: "flex px-5 leading-[47px] text-lg cursor-pointer rounded-lg",
      nodeTextBlock: "items-center truncate",
    },
    search: {
      input:
        "py-2 text-th-text-primary border-gray focus:border-gray placeholder:text-gray flex-1 px-4 w-full text-sm md:text-base rounded-lg border focus:outline-none",
      container: "relative flex items-center mb-4",
      close: "absolute р-6 w-6 right-1 z-10 cursor-pointer",
    },
  };
  const menuItems = {
    contextMenu: [
      {
        id: "adding_note",
        buttonContent: (
          <span className="flex items-center gap-2.5 py-1 pr-7 pl-2.5">
            <FileIcon /> {t("common:NewDocument")}
          </span>
        ),
        action: () => addNode(),
      },
      {
        id: "adding_folder",
        buttonContent: (
          <span className="flex items-center gap-2.5 py-1 pr-7 pl-2.5">
            <CloseFolder /> {t("common:NewFolder")}
          </span>
        ),
        action: () => addNode(true),
      },
      {
        id: "rename",
        buttonContent: (
          <span className="flex items-center gap-2.5 py-1 pr-7 pl-2.5">
            <Rename /> {t("common:Rename")}
          </span>
        ),
        action: handleRename,
      },
      {
        id: "delete",
        buttonContent: (
          <span className="flex items-center gap-2.5 py-1 pr-7 pl-2.5">
            <Trash className="w-4" /> {t("common:Delete")}
          </span>
        ),
        action: () => setIsOpenModal(true),
      },
    ],
    menu: [
      {
        id: "export",
        buttonContent: (
          <span className="flex items-center gap-2.5 py-1 pr-7 pl-2.5">
            <Export className="w-4 stroke-2" /> {t("common:Export")}
          </span>
        ),
        action: () => exportNotes(),
      },
      {
        id: "import",
        buttonContent: (
          <span className="flex items-center gap-2.5 py-1 pr-7 pl-2.5">
            <Import className="w-4 stroke-2" /> {t("common:Import")}
          </span>
        ),
        action: () => importNotes(true),
      },
      {
        id: "remove",
        buttonContent: (
          <span className="flex items-center gap-2.5 py-1 pr-7 pl-2.5">
            <Trash className="w-4 stroke-2" /> {t("common:RemoveAll")}
          </span>
        ),
        action: () => {
          setCurrentNodeProps(null);
          setIsOpenModal(true);
        },
      },
    ],
    container: {
      className:
        "absolute border rounded z-[100] whitespace-nowrap bg-white shadow",
    },
    item: {
      className: "cursor-pointer bg-th-secondary-100 hover:bg-th-secondary-200",
    },
  };
  const handleDragDrop = () => {};
  const [currentNodeProps, setCurrentNodeProps] = useState(null);
  const removeNode = () => {};
  const handleRenameNode = () => {};
  const handleRename = () => {};
  const handleBack = () => {};
  console.log(notes);
  const defaultNotes = [
    {
      id: "first_note_key_from_DB",
      title: "note1",
      user_id: 1,
      data: {
        time: 1550476186479,
        blocks: [
          {
            id: "zbGZFPM-iI",
            type: "paragraph",
            data: {
              text: "Hey. Meet the new Editor. On this page you can see it in action — try to edit this text. Source code of the page contains the example of connection and configuration.",
            },
          },
        ],
        version: "2.27.2",
      },
      created_at: new Date("2022-10-15 07:59:58.3642"),
      is_folder: false,
      parent_id: null,
    },
    {
      id: "second_note_key_from_DB",
      user_id: 1,
      title: "note2",
      data: {
        time: 1550476186479,
        blocks: [
          {
            id: "zbGZFPM-iI",
            type: "paragraph",
            data: {
              text: "Designed to be extendable and pluggable with a simple API",
            },
          },
        ],
        version: "2.27.2",
      },
      created_at: new Date("2022-10-15 07:59:58.3642"),
      is_folder: false,
      parent_id: null,
    },
  ];
  console.log(Object.values(notes));
  return (
    <>
      <div className="relative">
        {!activeNote ? (
          <div>
            <div className="flex justify-end">
              <button
                className="btn-gray-red mb-4 mr-4"
                onClick={() => setIsOpenModal(true)}
                disabled={!Object.values(notes)?.length}
              >
                {t("RemoveAll")}
              </button>
              <button
                className="btn-cyan mb-4 text-xl font-bold"
                onClick={addNote}
              >
                +
              </button>
            </div>
            <div>
              {Object.values(notes).map((el) => (
                <div
                  key={el.id}
                  className="flex justify-between items-start group my-3 bg-cyan-50 rounded-lg cursor-pointer shadow-md"
                  onClick={() => {
                    setNoteId(el.id);
                  }}
                >
                  <div className="p-2 mr-4 font-bold">{el.name}</div>
                  <button
                    className="p-2 m-1 top-0 opacity-0 group-hover:opacity-100"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsOpenModal(true);
                      setNoteToDel(el);
                    }}
                  >
                    <Trash className={"w-4 h-4 text-cyan-800"} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <>
            <div
              className="absolute top-0 right-0 w-10 pr-3 cursor-pointer"
              onClick={() => {
                saveNote();
                setActiveNote(null);
                setNoteId(null);
              }}
            >
              <Close />
            </div>
            <Redactor
              classes={{
                title:
                  "p-2 my-4 mr-12 bg-cyan-50 font-bold rounded-lg shadow-md",
                redactor:
                  "pb-20 pt-4 my-4 bg-cyan-50 overflow-hidden break-words rounded-lg shadow-md",
              }}
              activeNote={activeNote}
              setActiveNote={setActiveNote}
              placeholder={t("Новая заметка...")}
            />
          </>
        )}
        <Modal isOpen={isOpenModal} closeHandle={() => setIsOpenModal(false)}>
          <div className="flex flex-col gap-7 items-center">
            <div className="text-center text-2xl">
              {t("Уверены что хотите удалить ") +
                " " +
                t(
                  noteToDel ? noteToDel?.name : t("Все заметки").toLowerCase()
                ) +
                "?"}
            </div>
            <div className="flex gap-7 w-1/2">
              <button
                className="btn-secondary flex-1"
                onClick={() => {
                  setIsOpenModal(false);
                  if (noteToDel) {
                    removeNote(noteToDel.id);
                    setNoteToDel(null);
                  } else {
                    removeAllNotes();
                  }
                }}
              >
                {t("Да")}
              </button>
              <button
                className="btn-secondary flex-1"
                onClick={() => {
                  setIsOpenModal(false);
                  setTimeout(() => {
                    setNoteToDel(null);
                  }, 1000);
                }}
              >
                {t("Нет")}
              </button>
            </div>
          </div>
        </Modal>
      </div>
    </>
  );
}
