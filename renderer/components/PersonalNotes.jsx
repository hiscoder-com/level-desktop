import { useEffect, useState } from "react";

import dynamic from "next/dynamic";

import Close from "../public/icons/close.svg";
import Trash from "../public/icons/trash.svg";
import Back from "../public/icons/left.svg";
import FileIcon from "../public/icons/file-icon.svg";
import CloseFolder from "../public/icons/close-folder.svg";
import OpenFolder from "../public/icons/open-folder.svg";
import ArrowDown from "../public/icons/folder-arrow-down.svg";
import ArrowRight from "../public/icons/folder-arrow-right.svg";
import Export from "../public/icons/export.svg";
import Import from "../public/icons/import.svg";
import Rename from "../public/icons/rename.svg";
import Progress from "../public/icons/progress.svg";
import Plus from "../public/icons/plus.svg";

import { useGetPersonalNotes } from "../hooks/useGetPersonalNotes";
import Modal from "./Modal";
import { generateUniqueId } from "../helpers/noteEditor";
// import { generateUniqueId } from "@texttree/v-cana-rcl";

const t = (str) => str;

const MenuButtons = dynamic(
  () => import("@texttree/v-cana-rcl").then((mod) => mod.MenuButtons),
  {
    ssr: false,
  }
);
const NotesEditor = dynamic(
  () => import("@texttree/v-cana-rcl").then((mod) => mod.NotesEditor),
  {
    ssr: false,
  }
);
// const Redactor = dynamic(
//   () => import("@texttree/notepad-rcl").then((mod) => mod.Redactor),
//   {
//     ssr: false,
//   }
// );
// const generateUniqueId = dynamic(
//   () =>
//     import("@texttree/v-cana-rcl/dist/utils/helper").then(
//       (mod) => mod.generateUniqueId
//     ),
//   {
//     ssr: false,
//   }
// );

const icons = {
  file: <FileIcon className="w-6 h-6" />,
  arrowDown: <ArrowDown className="stroke-2" />,
  arrowRight: <ArrowRight className="stroke-2" />,
  openFolder: <OpenFolder className="w-6 h-6 stroke-[1.7]" />,
  closeFolder: <CloseFolder className="w-6 h-6" />,
  plus: <Plus className="w-6 h-6" />,
  dots: (
    <div className="flex items-center justify-center w-6 h-6 space-x-1">
      {[...Array(3).keys()].map((key) => (
        <div key={key} className="h-1 w-1 bg-white rounded-full" />
      ))}
    </div>
  ),
};
const classes = {
  container: "relative",
  back: "flex w-fit p-1 cursor-pointer hover:opacity-70 rounded-full bg-gray-300",
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
      "py-2 text-black border-gray focus:border-gray placeholder:text-gray flex-1 px-4 w-full text-sm md:text-base rounded-lg border focus:outline-none",
    container: "relative flex items-center mb-4",
    close: "absolute р-6 w-6 right-1 z-10 cursor-pointer",
  },
};
export const style = {
  nodeWrapper: {
    lineHeight: "47px",
    display: "none",
    fontSize: "18px",
    cursor: "pointer",
    paddingLeft: "20px",
    paddingRight: "20px",
    borderRadius: "10px",
    display: "flex",
    justifyContent: "space-between",
    backgroundColor: "#EDEDED",
    hoveredColor: "#D5D5D5",
    selectedColor: "#bdbdbd",
  },
  nodeTextBlock: { alignItems: "center" },
  nodeButtonBlock: { display: "flex", alignItems: "center", gap: "7px" },
  searchContainer: {
    // position: "relative",
    // marginBottom: "20px",
    // maxWidth: "500px",
    // width: "80%",
  },
  searchInput: {
    // border: "0",
    // borderBottom: "1px solid #555",
    // background: "transparent",
    // width: "80%",
    // padding: "24px 0 5px 0",
    // fontSize: "14px",
    // outline: "none",
    // paddingRight: "40px",
  },
  searchLabel: {
    // position: "absolute",
    top: "0px",
    left: "0px",
    fontSize: "14px",
    color: "#555",
    transition: "all 0.5s ease-in-out",
  },
  renameButton: { paddingLeft: "30px" },
  removeButton: { paddingLeft: "5px" },
  renameInput: { width: "120px" },
};

export default function PersonalNotes({ config: { id }, toolName }) {
  const [noteId, setNoteId] = useState("");
  const [activeNote, setActiveNote] = useState(null);
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [currentNodeProps, setCurrentNodeProps] = useState(null);
  const [noteToDel, setNoteToDel] = useState(null);
  const { data: notes, mutate } = useGetPersonalNotes(id);
  const saveNote = () => {
    window.electronAPI.updateNote(id, activeNote);
  };
  const exportNotes = () => {
    // window.electronAPI.exportNotes(id);
  };
  const importNotes = () => {
    // window.electronAPI.importNotes(id);
  };

  useEffect(() => {
    if (activeNote?.id) {
      const currentNote = window.electronAPI.getNote(id, activeNote?.id);
      console.log("{ currentNote }", JSON.parse(currentNote));
      console.log(activeNote, "before");
      setActiveNote(JSON.parse(currentNote));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeNote?.id]);

  const handleRenameNode = (newTitle, id) => {
    // if (!newTitle.trim()) {
    //   newTitle = t("EmptyTitle");
    // }
    // axios
    //   .put(`/api/personal_notes/${id}`, { title: newTitle })
    //   .then(() => {
    //     console.log("Note renamed successfully");
    //     removeCacheNote("personal_notes", id);
    //     mutate();
    //   })
    //   .catch((error) => {
    //     console.log("Failed to rename note:", error);
    //   });
  };
  function getMaxSorting(notes) {
    if (!notes) return 0;
    const maxSorting = Object.values(notes).reduce(
      (max, note) => (note.sorting > max ? note.sorting : max),
      -1
    );
    console.log({ maxSorting });
    return maxSorting + 1;
  }
  const addNote = (isFolder = false) => {
    const sorting = getMaxSorting(notes);

    const noteId = generateUniqueId(Object.values(notes));
    window.electronAPI.addNote(id, noteId, isFolder, sorting);
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
  const removeNode = () => {
    currentNodeProps?.tree.delete(currentNodeProps.node.id);
  };
  const handleRename = () => {
    currentNodeProps.node.edit();
  };
  const menuItems = {
    contextMenu: [
      {
        id: "adding_note",
        buttonContent: (
          <span className="flex items-center gap-2.5 py-1 pr-7 pl-2.5">
            <FileIcon /> {"New note"}
          </span>
        ),
        action: () => addNote(),
      },
      {
        id: "adding_folder",
        buttonContent: (
          <span className="flex items-center gap-2.5 py-1 pr-7 pl-2.5">
            <CloseFolder /> {"New folder"}
          </span>
        ),
        action: () => addNote(true),
      },
      {
        id: "rename",
        buttonContent: (
          <span className="flex items-center gap-2.5 py-1 pr-7 pl-2.5">
            <Rename /> {"Rename"}
          </span>
        ),
        action: handleRename,
      },
      {
        id: "delete",
        buttonContent: (
          <span className="flex items-center gap-2.5 py-1 pr-7 pl-2.5">
            <Trash /> {"Delete"}
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
            <Export /> {"Export"}
          </span>
        ),
        action: () => exportNotes(databaseNotes),
      },
      {
        id: "import",
        buttonContent: (
          <span className="flex items-center gap-2.5 py-1 pr-7 pl-2.5">
            <Import /> {"Import"}
          </span>
        ),
        action: () => importNotes(true),
      },
      {
        id: "remove",
        buttonContent: (
          <span className="flex items-center gap-2.5 py-1 pr-7 pl-2.5">
            <Trash /> {"Remove all"}
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

  const moveNode = ({ dragIds, parentId, index }) => {
    const databaseNotes = Object.values(notes);
    const draggedNode = databaseNotes.find((node) => node.id === dragIds[0]);
    if (!draggedNode || index < 0) {
      return;
    }
    const newSorting = index;
    const oldSorting = draggedNode.sorting;
    const oldParentId = draggedNode.parent_id;
    const filtered = databaseNotes.filter((note) => note.id !== dragIds[0]);
    if (parentId === oldParentId) {
      if (
        newSorting === oldSorting ||
        index < 0 ||
        newSorting === oldSorting + 1
      ) {
        return;
      }
      const sorted = filtered.map((note) => {
        if (newSorting > oldSorting) {
          if (note.sorting > oldSorting && note.sorting <= newSorting - 1) {
            return { ...note, sorting: note.sorting - 1 };
          } else return note;
        } else {
          if (note.sorting >= newSorting && note.sorting < oldSorting) {
            return { ...note, sorting: note.sorting + 1 };
          } else return note;
        }
      });
      if (newSorting > oldSorting) {
        draggedNode.sorting = index - 1;
      } else {
        draggedNode.sorting = index;
      }

      window.electronAPI.updateNotes(id, sorted.concat(draggedNode));
    } else {
      draggedNode.parent_id = parentId;
      draggedNode.sorting = index;

      const oldParentNotes = filtered.filter(
        (note) => note.parent_id === oldParentId
      );
      const newParentNotes = databaseNotes.filter(
        (note) => note.parent_id === parentId
      );

      let sorted = oldParentNotes.map((note) => {
        if (note.sorting > oldSorting) {
          return { ...note, sorting: note.sorting - 1 };
        } else {
          return note;
        }
      });

      sorted = sorted.concat(
        newParentNotes.map((note) => {
          if (note.sorting >= newSorting) {
            return { ...note, sorting: note.sorting + 1 };
          } else {
            return note;
          }
        })
      );
      const filteredDraggable = sorted.filter((note) => note.id !== dragIds[0]);
      window.electronAPI.updateNotes(id, filteredDraggable.concat(draggedNode));
    }
  };
  const handleDragDrop = ({ dragIds, parentId, index }) => {
    moveNode({ dragIds, parentId, index });
    mutate();
  };
  const handleBack = () => {};
  const dropMenuItems = {
    dots: menuItems.menu,
    plus: menuItems.contextMenu.filter((menuItem) =>
      ["adding_note", "adding_folder"].includes(menuItem.id)
    ),
  };
  const dropMenuClassNames = {
    container: menuItems.container,
    item: menuItems.item,
  };
  return (
    <>
      <div className="flex justify-end w-full mb-2">
        <MenuButtons
          classNames={{
            dropdown: dropMenuClassNames,
            button: "bg-gray-500 text-white p-2 rounded-lg",
            container: "flex gap-2 relative",
            buttonContainer: "relative",
          }}
          menuItems={dropMenuItems}
          icons={icons}
        />
      </div>
      <NotesEditor
        style={style}
        notes={Object.values(notes)}
        handleDragDrop={handleDragDrop}
        setActiveNote={setActiveNote}
        activeNote={activeNote}
        setCurrentNodeProps={setCurrentNodeProps}
        currentNodeProps={currentNodeProps}
        handleRemoveNode={removeNote}
        handleRenameNode={handleRenameNode}
        // noteId={noteId}
        // setNoteId={setNoteId}
        menuItems={menuItems}
        icons={icons}
        classes={classes}
        isSearch
        handleBack={handleBack}
        handleSaveNote={saveNote}
        isContextMenu
      />
      {/* <Redactor
        classes={{
          title: "p-2 my-4 mr-12 bg-cyan-50 font-bold rounded-lg shadow-md",
          redactor:
            "pb-20 pt-4 my-4 bg-cyan-50 overflow-hidden break-words rounded-lg shadow-md",
        }}
        activeNote={{
          id: "00la142ik",
          createdAt: 1714074557727,
          title: "12",
          data: {
            time: 1714074567618,
            blocks: [
              {
                id: "wTr00FVQab",
                type: "paragraph",
                data: {
                  text: "43r34t5egtet",
                },
              },
            ],
            version: "2.29.1",
          },
          sorting: 1,
        }}
        setActiveNote={setActiveNote}
      /> */}
      {/* {!activeNote ? (
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
              title: "p-2 my-4 mr-12 bg-cyan-50 font-bold rounded-lg shadow-md",
              redactor:
                "pb-20 pt-4 my-4 bg-cyan-50 overflow-hidden break-words rounded-lg shadow-md",
            }}
            activeNote={activeNote}
            setActiveNote={setActiveNote}
            placeholder={t("Новая заметка...")}
          />
        </>
      )} */}
      <Modal isOpen={isOpenModal} closeHandle={() => setIsOpenModal(false)}>
        <div className="flex flex-col gap-7 items-center">
          <div className="text-center text-2xl">
            {t("Уверены что хотите удалить ") +
              " " +
              t(noteToDel ? noteToDel?.name : t("Все заметки").toLowerCase()) +
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
    </>
  );
}
