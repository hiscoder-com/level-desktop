import { useEffect, useState } from "react";

import dynamic from "next/dynamic";

import Back from "../public/icons/left.svg";
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
import Plus from "../public/icons/plus.svg";
import Progress from "../public/icons/progress.svg";

import { useGetPersonalNotes } from "../hooks/useGetPersonalNotes";
import Modal from "./Modal";
import { convertNotesToTree, generateUniqueId } from "../helpers/noteEditor";

const t = (str) => str;

const MenuButtons = dynamic(
  () => import("@texttree/v-cana-rcl").then((mod) => mod.MenuButtons),
  {
    ssr: false,
  }
);

const ContextMenu = dynamic(
  () => import("@texttree/notepad-rcl").then((mod) => mod.ContextMenu),
  {
    ssr: false,
  }
);
const Redactor = dynamic(
  () => import("@texttree/notepad-rcl").then((mod) => mod.Redactor),
  {
    ssr: false,
  }
);
const TreeView = dynamic(
  () => import("@texttree/notepad-rcl").then((mod) => mod.TreeView),
  {
    ssr: false,
  }
);

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

export default function PersonalNotes({ config: { id }, config, toolName }) {
  const [noteId, setNoteId] = useState("");
  const [contextMenuEvent, setContextMenuEvent] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hoveredNodeId, setHoveredNodeId] = useState(null);
  const [isShowMenu, setIsShowMenu] = useState(false);
  const [activeNote, setActiveNote] = useState(null);
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [currentNodeProps, setCurrentNodeProps] = useState(null);
  const [noteToDel, setNoteToDel] = useState(null);
  const { data: notesObject, mutate } = useGetPersonalNotes(id);
  const notes = Object.values(notesObject);
  const [dataForTreeView, setDataForTreeView] = useState(
    convertNotesToTree(notes)
  );
  const [term, setTerm] = useState("");
  // const isRtl = config?.isRtl || false;
  const isRtl = false;
  const saveNote = () => {
    window.electronAPI.updateNote(id, activeNote);
  };
  useEffect(() => {
    console.log("object");
    setDataForTreeView(convertNotesToTree(notes));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notesObject]);
  const exportNotes = () => {
    // window.electronAPI.exportNotes(id);
  };
  const importNotes = () => {
    // window.electronAPI.importNotes(id);
  };
  function parseNotesWithTopFolder(notes, user_id, deleted_at) {
    const exportFolderId = generateUniqueId(allNotes);
    const exportFolderDateTime = new Date().toISOString().replace(/[:.]/g, "-");

    const exportFolder = {
      id: exportFolderId,
      user_id,
      title: `export-${exportFolderDateTime}`,
      data: null,
      created_at: new Date().toISOString(),
      changed_at: new Date().toISOString(),
      deleted_at,
      is_folder: true,
      parent_id: null,
      sorting: 0,
    };

    const parsedNotes = parseNotes(notes, user_id, exportFolderId);
    return [exportFolder, ...parsedNotes];
  }
  function parseNotes(notes, user_id, parentId = null) {
    return notes.reduce((acc, note) => {
      const id = generateUniqueId(allNotes);
      const parsedNote = {
        id: id,
        user_id,
        title: note.title,
        data: parseData(note.data),
        created_at: note.created_at,
        changed_at: new Date().toISOString(),
        deleted_at: note.deleted_at,
        is_folder: note.is_folder,
        parent_id: parentId,
        sorting: note.sorting,
      };

      acc.push(parsedNote);

      if (note.children?.length > 0) {
        const childNotes = parseNotes(note.children, user_id, id);
        acc = acc.concat(childNotes);
      }

      return acc;
    }, []);
  }

  function parseData(data) {
    if (!data) {
      return null;
    }

    return {
      blocks: data.blocks || [],
      version: data.version,
      time: data.time,
    };
  }

  // const importNotes = async () => {
  //   const fileInput = document.createElement("input");
  //   fileInput.type = "file";
  //   fileInput.accept = ".json";

  //   fileInput.addEventListener("change", async (event) => {
  //     try {
  //       const file = event.target.files[0];
  //       if (!file) {
  //         throw new Error(t("error:NoFileSelected"));
  //       }

  //       const fileContents = await file.text();
  //       if (!fileContents.trim()) {
  //         throw new Error(t("error:EmptyFileContent"));
  //       }

  //       const importedData = JSON.parse(fileContents);
  //       if (importedData.type !== "personal_notes") {
  //         throw new Error(t("error:ContentError"));
  //       }
  //       const parsedNotes = parseNotesWithTopFolder(
  //         importedData.data,
  //         user.id,
  //         user.deleted_at
  //       );

  //       for (const note of parsedNotes) {
  //         bulkNode(note);
  //       }
  //     } catch (error) {
  //       toast.error(error.message);
  //     }
  //   });

  //   fileInput.click();
  // };

  // function exportNotes() {
  //   try {
  //     if (!notes || !notes.length) {
  //       throw new Error(t("error:NoData"));
  //     }
  //     const transformedData = formationJSONToTree(notes);
  //     const jsonContent = JSON.stringify(
  //       { type: "personal_notes", data: transformedData },
  //       null,
  //       2
  //     );

  //     const blob = new Blob([jsonContent], { type: "application/json" });

  //     const downloadLink = document.createElement("a");
  //     const currentDate = new Date();
  //     const formattedDate = currentDate.toISOString().split("T")[0];

  //     const fileName = `personal_notes_${formattedDate}.json`;

  //     const url = URL.createObjectURL(blob);

  //     downloadLink.href = url;
  //     downloadLink.download = fileName;

  //     document.body.appendChild(downloadLink);
  //     downloadLink.click();
  //     document.body.removeChild(downloadLink);

  //     URL.revokeObjectURL(url);
  //   } catch (error) {
  //     toast.error(error.message);
  //   }
  // }

  const changeNode = (noteId) => {
    if (noteId) {
      const currentNote = window.electronAPI.getNote(id, noteId);
      setActiveNote(JSON.parse(currentNote));
    }
  };

  const bulkNode = (note) => {
    // axios
    //   .post("/api/personal_notes/bulk_insert", {
    //     note: note,
    //   })
    //   .then(() => mutate())
    //   .catch(console.log);
    return;
  };
  const handleRenameNode = (newTitle, noteId) => {
    if (!newTitle.trim()) {
      newTitle = t("EmptyTitle");
    }
    console.log({ noteId });
    console.log({ activeNote });
    window.electronAPI.renameNote(id, newTitle, noteId);
    mutate();
  };
  const removeNode = () => {
    currentNodeProps?.tree.delete(currentNodeProps.node.id);
  };
  function getMaxSorting(notes) {
    if (!notes) return 0;
    const maxSorting = notes.reduce(
      (max, note) => (note.sorting > max ? note.sorting : max),
      -1
    );
    return maxSorting + 1;
  }
  const addNote = (isFolder = false) => {
    const sorting = getMaxSorting(notes);

    const noteId = generateUniqueId(notes);
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
    const databaseNotes = notes;
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
  const handleRemoveNode = ({ ids }) => {
    axios
      .delete(`/api/personal_notes/${ids[0]}`)
      .then(() => {
        removeCacheNote("personal_notes", ids[0]);
        mutate();
      })
      .catch(console.log);
  };
  const handleDragDrop = ({ dragIds, parentId, index }) => {
    moveNode({ dragIds, parentId, index });
    mutate();
  };
  const handleContextMenu = (event) => {
    setIsShowMenu(true);
    setContextMenuEvent({ event });
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
      <div className="flex gap-2.5 w-full mb-2">
        <div className="relative flex items-center mb-4 w-full">
          <input
            className="input-primary w-full !pr-8"
            value={term}
            onChange={(event) => setTerm(event.target.value)}
            placeholder={t("Search")}
          />
          {term && (
            <Close
              className="absolute р-6 w-6 z-10 cursor-pointer right-2 rtl:left-1"
              onClick={() => setTerm("")}
            />
          )}
        </div>
        <MenuButtons
          classNames={{
            dropdown: dropMenuClassNames,
            button: "btn-tertiary p-3",
            container: "flex gap-2.5 relative",
            buttonContainer: "relative",
          }}
          menuItems={dropMenuItems}
          icons={icons}
        />
      </div>
      {!activeNote || !Object.keys(activeNote)?.length ? (
        <>
          {!isLoading || notes?.length ? (
            <>
              <TreeView
                term={term}
                selection={noteId}
                handleDeleteNode={handleRemoveNode}
                classes={{
                  nodeWrapper:
                    "px-5 leading-[47px] text-lg cursor-pointer rounded-lg bg-th-secondary-100 hover:bg-th-secondary-200 ltr:flex",
                  nodeTextBlock: "items-center truncate",
                }}
                data={dataForTreeView}
                setSelectedNodeId={setNoteId}
                selectedNodeId={noteId}
                treeWidth={"w-full"}
                icons={icons}
                handleOnClick={(note) => {
                  changeNode(note.node.data.id);
                }}
                handleContextMenu={handleContextMenu}
                hoveredNodeId={hoveredNodeId}
                setHoveredNodeId={setHoveredNodeId}
                getCurrentNodeProps={setCurrentNodeProps}
                handleRenameNode={handleRenameNode}
                handleDragDrop={handleDragDrop}
                openByDefault={false}
                isRtl={isRtl}
              />
              <ContextMenu
                setIsVisible={setIsShowMenu}
                isVisible={isShowMenu}
                nodeProps={currentNodeProps}
                menuItems={menuItems.contextMenu}
                clickMenuEvent={contextMenuEvent}
                classes={{
                  menuItem: menuItems.item.className,
                  menuContainer: menuItems.container.className,
                  emptyMenu: "p-2.5 cursor-pointer text-gray-300",
                }}
                isRtl={isRtl}
              />
            </>
          ) : (
            <Progress className="progress-custom-colors w-14 animate-spin stroke-th-primary-100 mx-auto" />
          )}
        </>
      ) : (
        <>
          <div
            className="flex w-fit p-1 cursor-pointer hover:opacity-70 rounded-full bg-th-secondary-100 absolute mt-2"
            onClick={() => {
              saveNote();
              setActiveNote(null);
              setIsShowMenu(false);
              localStorage.setItem("activePersonalNote", JSON.stringify({}));
            }}
          >
            <Back className="w-8 stroke-th-primary-200" />
          </div>
          <Redactor
            classes={{
              title: "bg-th-secondary-100 p-2 my-4 ml-12 font-bold rounded-lg",
              redactor:
                "p-4 my-4 pb-20 bg-th-secondary-100 overflow-hidden break-words rounded-lg",
            }}
            activeNote={activeNote}
            setActiveNote={setActiveNote}
            placeholder={t("TextNewNote")}
            emptyTitle={t("EmptyTitle")}
            isSelectableTitle
            isRtl={isRtl}
          />
        </>
      )}

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
