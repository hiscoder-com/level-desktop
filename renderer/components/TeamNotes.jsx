import { useEffect, useState } from 'react'

import dynamic from 'next/dynamic'

import {
  convertNotesToTree,
  generateFolderName,
  generateUniqueId,
} from '@/helpers/noteEditor'
import { useGetTeamNotes } from '@/hooks/useGetTeamNotes'
import { useTranslation } from '@/next-i18next'
import toast from 'react-hot-toast'

import LoadingPage from './LoadingPage'
import Modal from './Modal'
import RtlInput from './RtlInput'

import CloseFolder from 'public/icons/close-folder.svg'
import Close from 'public/icons/close.svg'
import Export from 'public/icons/export.svg'
import FileIcon from 'public/icons/file-icon.svg'
import ArrowDown from 'public/icons/folder-arrow-down.svg'
import ArrowRight from 'public/icons/folder-arrow-right.svg'
import Import from 'public/icons/import.svg'
import Back from 'public/icons/left.svg'
import OpenFolder from 'public/icons/open-folder.svg'
import Plus from 'public/icons/plus.svg'
import Progress from 'public/icons/progress.svg'
import Rename from 'public/icons/rename.svg'
import Trash from 'public/icons/trash.svg'

const t = (str) => str

const MenuButtons = dynamic(
  () => import('@texttree/v-cana-rcl').then((mod) => mod.MenuButtons),
  {
    ssr: false,
  }
)

const ContextMenu = dynamic(
  () => import('@texttree/notepad-rcl').then((mod) => mod.ContextMenu),
  {
    ssr: false,
  }
)

const Redactor = dynamic(
  () => import('@texttree/notepad-rcl').then((mod) => mod.Redactor),
  {
    ssr: false,
  }
)

const TreeView = dynamic(
  () => import('@texttree/notepad-rcl').then((mod) => mod.TreeView),
  {
    ssr: false,
  }
)

const icons = {
  file: <FileIcon className="h-6 w-6" />,
  arrowDown: <ArrowDown className="stroke-2" />,
  arrowRight: <ArrowRight className="stroke-2" />,
  openFolder: <OpenFolder className="h-6 w-6 stroke-[1.7]" />,
  closeFolder: <CloseFolder className="h-6 w-6" />,
  plus: <Plus className="h-6 w-6 stroke-2" />,
  dots: (
    <div className="flex h-6 w-6 items-center justify-center space-x-1">
      {[...Array(3).keys()].map((key) => (
        <div key={key} className="h-1 w-1 rounded-full bg-white" />
      ))}
    </div>
  ),
}

export default function TeamNotes({ config: { id, language } }) {
  const { t } = useTranslation(['common', 'projects'])

  const [noteId, setNoteId] = useState('')
  const [contextMenuEvent, setContextMenuEvent] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [hoveredNodeId, setHoveredNodeId] = useState(null)
  const [isShowMenu, setIsShowMenu] = useState(false)
  const [activeNote, setActiveNote] = useState(null)
  const [isOpenModal, setIsOpenModal] = useState(false)
  const [currentNodeProps, setCurrentNodeProps] = useState(null)
  const { data: notesObject, mutate } = useGetTeamNotes(id)
  const notes = Object.values(notesObject)
  const [dataForTreeView, setDataForTreeView] = useState(convertNotesToTree(notes))
  const [term, setTerm] = useState('')
  const is_rtl = language.is_rtl

  const isRtl = false
  const saveNote = () => {
    window.electronAPI.updateNote(id, activeNote, 'team-notes')
  }
  useEffect(() => {
    setDataForTreeView(convertNotesToTree(notes))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notesObject])

  function parseNotesWithTopFolder(notes, maxsorting = 0) {
    const exportFolderId = generateUniqueId(notes.map(({ id }) => id))

    const exportFolder = {
      id: exportFolderId,
      title: generateFolderName('Team notes'),
      data: null,
      created_at: new Date().toISOString(),
      changed_at: new Date().toISOString(),
      is_folder: true,
      parent_id: null,
      sorting: maxsorting,
    }

    const parsedNotes = parseNotes(notes, exportFolderId)
    return [exportFolder, ...parsedNotes]
  }
  function parseNotes(notes, parentId = null) {
    return notes.reduce((acc, note) => {
      const id = generateUniqueId(notes.map(({ id }) => id))
      const parsedNote = {
        id: id,
        title: note.title,
        data: parseData(note.data),
        created_at: note.created_at,
        changed_at: new Date().toISOString(),
        deleted_at: note.deleted_at,
        is_folder: note.is_folder,
        parent_id: parentId,
        sorting: note.sorting,
      }

      acc.push(parsedNote)

      if (note.children?.length > 0) {
        const childNotes = parseNotes(note.children, id)
        acc = acc.concat(childNotes)
      }

      return acc
    }, [])
  }

  function parseData(data) {
    if (!data) {
      return null
    }

    return {
      blocks: data.blocks || [],
      version: data.version,
      time: data.time,
    }
  }

  function getMaxSorting(notes) {
    if (!notes || notes.length === 0) return 0
    const maxSorting = notes.reduce(
      (max, note) => (note.sorting > max ? note.sorting : max),
      -1
    )
    return maxSorting + 1
  }
  const getMaxSortingNullParent = (notes) => {
    if (notes?.length === 0) {
      return 0
    }
    const notesNullParent = notes.filter(({ parent_id }) => !parent_id)

    return getMaxSorting(notesNullParent)
  }
  const importNotes = async () => {
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
        if (importedData.type !== 'team_notes') {
          throw new Error(t('ContentError'))
        }
        const maxSorting = getMaxSortingNullParent(notes)
        const parsedNotes = parseNotesWithTopFolder(importedData.data, maxSorting)
        for (const note of parsedNotes) {
          const newNote = {
            id: generateUniqueId(parsedNotes.map(({ id }) => id)),
            ...note,
          }
          window.electronAPI.importNote(id, newNote, 'team-notes')
        }
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
  function buildTree(items) {
    if (!items) {
      return
    }

    const tree = []
    const itemMap = {}

    items.forEach((item) => {
      item.children = []
      itemMap[item.id] = item
    })

    items.forEach((item) => {
      if (item?.parent_id) {
        const parentItem = itemMap[item.parent_id]
        if (parentItem) {
          parentItem.children.push(item)
        } else {
          console.error(
            `Parent item with id ${item.parent_id} not found for item with id ${item.id}`
          )
        }
      } else {
        tree.push(item)
      }
    })

    return tree
  }
  function removeIdsFromTree(tree) {
    function removeIdsFromItem(item) {
      delete item.id
      delete item.parent_id
      delete item?.user_id
      delete item?.project_id

      item?.data?.blocks?.forEach((block) => delete block.id)
      item.children.forEach((child) => removeIdsFromItem(child))
    }

    if (!tree) {
      return
    }

    tree.forEach((item) => removeIdsFromItem(item))

    return tree
  }

  function formationJSONToTree(data) {
    const treeData = buildTree(data)
    const transformedData = removeIdsFromTree(treeData)

    return transformedData
  }
  function exportNotes() {
    try {
      if (!notes || !notes.length) {
        throw new Error(t('error:NoData'))
      }
      const notesWithData = window.electronAPI.getNotesWithData(id, 'team-notes')

      const transformedData = formationJSONToTree(notesWithData)

      const jsonContent = JSON.stringify(
        { type: 'team_notes', data: transformedData },
        null,
        2
      )

      const blob = new Blob([jsonContent], { type: 'application/json' })

      const downloadLink = document.createElement('a')
      const currentDate = new Date()
      const formattedDate = currentDate.toISOString().split('T')[0]

      const fileName = `team_notes_${formattedDate}.json`

      const url = URL.createObjectURL(blob)

      downloadLink.href = url
      downloadLink.download = fileName

      document.body.appendChild(downloadLink)
      downloadLink.click()
      document.body.removeChild(downloadLink)

      URL.revokeObjectURL(url)
    } catch (error) {
      console.log(error.message)
    }
  }

  const changeNode = (noteId) => {
    if (noteId) {
      const currentNote = window.electronAPI.getNote(id, noteId, 'team-notes')
      setActiveNote(JSON.parse(currentNote))
    }
  }

  const handleRenameNode = (newTitle, noteId) => {
    if (!newTitle.trim()) {
      newTitle = t('EmptyTitle')
    }
    window.electronAPI.renameNote(id, newTitle, noteId, 'team-notes')
    mutate()
  }
  const removeNode = () => {
    currentNodeProps?.tree.delete(currentNodeProps.node.id)
  }

  const addNote = (isFolder = false) => {
    const sorting = getMaxSorting(notes)

    const noteId = generateUniqueId(notes)
    window.electronAPI.addNote(id, noteId, isFolder, sorting, 'team-notes')
    mutate()
  }

  const handleRemoveNode = ({ ids }) => {
    window.electronAPI.removeNote(id, ids[0], 'team-notes')
    mutate()
  }

  useEffect(() => {
    if (!activeNote) {
      mutate()
      return
    }
    const timer = setTimeout(() => {
      saveNote()
    }, 2000)
    return () => {
      clearTimeout(timer)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeNote])

  const removeAllNotes = () => {
    window.electronAPI.removeAllNotes(id, 'team-notes')
    mutate()
  }

  const handleRename = () => {
    currentNodeProps.node.edit()
  }
  const menuItems = {
    contextMenu: [
      {
        id: 'adding_note',
        buttonContent: (
          <span className="flex items-center gap-2.5 py-1 pl-2.5 pr-7">
            <FileIcon />
            {t('NewNote')}
          </span>
        ),
        action: () => addNote(),
      },
      {
        id: 'adding_folder',
        buttonContent: (
          <span className="flex items-center gap-2.5 py-1 pl-2.5 pr-7">
            <CloseFolder />
            {t('NewFolder')}
          </span>
        ),
        action: () => addNote(true),
      },
      {
        id: 'rename',
        buttonContent: (
          <span className="flex items-center gap-2.5 py-1 pl-2.5 pr-7">
            <Rename /> {t('Rename')}
          </span>
        ),
        action: handleRename,
      },
      {
        id: 'delete',
        buttonContent: (
          <span className="flex items-center gap-2.5 py-1 pl-2.5 pr-7">
            <Trash className="h-5 w-5" /> {t('projects:Delete')}
          </span>
        ),
        action: () => setIsOpenModal(true),
      },
    ],
    menu: [
      {
        id: 'export',
        buttonContent: (
          <span className="flex items-center gap-2.5 py-1 pl-2.5 pr-7">
            <Export className="h-4 w-4" /> {t('Export')}
          </span>
        ),
        action: () => exportNotes(),
      },
      {
        id: 'import',
        buttonContent: (
          <span className="flex items-center gap-2.5 py-1 pl-2.5 pr-7">
            <Import className="h-4 w-4" /> {t('Import')}
          </span>
        ),
        action: () => importNotes(true),
      },
      {
        id: 'remove',
        buttonContent: (
          <span className="flex items-center gap-2.5 py-1 pl-2.5 pr-7">
            <Trash className="h-5 w-5" /> {t('RemoveAll')}
          </span>
        ),
        action: () => {
          setCurrentNodeProps(null)
          setIsOpenModal(true)
        },
      },
    ],
    container: {
      className: 'absolute border rounded z-[100] whitespace-nowrap bg-white shadow',
    },
    item: {
      className: 'cursor-pointer bg-th-secondary-100 hover:bg-th-secondary-200',
    },
  }

  const moveNode = ({ dragIds, parentId, index }) => {
    const draggedNode = notes.find((node) => node.id === dragIds[0])
    if (!draggedNode || index < 0) {
      return
    }
    const newSorting = index
    const oldSorting = draggedNode.sorting
    const oldParentId = draggedNode.parent_id
    const filtered = notes.filter((note) => note.id !== dragIds[0])
    if (parentId === oldParentId) {
      if (newSorting === oldSorting || index < 0 || newSorting === oldSorting + 1) {
        return
      }
      const sorted = filtered.map((note) => {
        if (newSorting > oldSorting) {
          if (note.sorting > oldSorting && note.sorting <= newSorting - 1) {
            return { ...note, sorting: note.sorting - 1 }
          } else return note
        } else {
          if (note.sorting >= newSorting && note.sorting < oldSorting) {
            return { ...note, sorting: note.sorting + 1 }
          } else return note
        }
      })
      if (newSorting > oldSorting) {
        draggedNode.sorting = index - 1
      } else {
        draggedNode.sorting = index
      }

      window.electronAPI.updateNotes(id, sorted.concat(draggedNode), 'team-notes')
    } else {
      draggedNode.parent_id = parentId
      draggedNode.sorting = index

      const oldParentNotes = filtered.filter((note) => note.parent_id === oldParentId)
      const newParentNotes = notes.filter((note) => note.parent_id === parentId)

      let sorted = oldParentNotes.map((note) => {
        if (note.sorting > oldSorting) {
          return { ...note, sorting: note.sorting - 1 }
        } else {
          return note
        }
      })

      sorted = sorted.concat(
        newParentNotes.map((note) => {
          if (note.sorting >= newSorting) {
            return { ...note, sorting: note.sorting + 1 }
          } else {
            return note
          }
        })
      )
      const filteredDraggable = sorted.filter((note) => note.id !== dragIds[0])
      window.electronAPI.updateNotes(
        id,
        filteredDraggable.concat(draggedNode),
        'team-notes'
      )
    }
  }

  const handleDragDrop = ({ dragIds, parentId, index }) => {
    moveNode({ dragIds, parentId, index })
    mutate()
  }
  const handleContextMenu = (event) => {
    setIsShowMenu(true)
    setContextMenuEvent({ event })
  }

  const dropMenuItems = {
    dots: menuItems.menu,
    plus: menuItems.contextMenu.filter((menuItem) =>
      ['adding_note', 'adding_folder'].includes(menuItem.id)
    ),
  }
  const dropMenuClassNames = {
    container: menuItems.container,
    item: menuItems.item,
  }

  return (
    <>
      <LoadingPage loadingPage={isLoading} />
      <div className="flex w-full items-center gap-2.5">
        <div className="relative flex w-full items-center">
          <RtlInput
            className="input-primary w-full !pr-8"
            value={term}
            onChange={setTerm}
            placeholder={t('Search')}
            readOnly={activeNote}
            defaultDirection={is_rtl ? 'rtl' : 'ltr'}
          />
          {term && (
            <Close
              className="absolute right-2 z-10 w-6 cursor-pointer rtl:left-1"
              onClick={() => !activeNote && setTerm('')}
            />
          )}
        </div>
        <MenuButtons
          classNames={{
            dropdown: dropMenuClassNames,
            button: 'btn-tertiary p-3',
            container: 'flex gap-2.5 relative',
            buttonContainer: 'relative',
          }}
          menuItems={dropMenuItems}
          icons={icons}
          disabled={activeNote}
        />
      </div>
      <div className="relative mt-6">
        {!activeNote || !Object.keys(activeNote)?.length ? (
          <>
            {!isLoading ? (
              <>
                <TreeView
                  term={term}
                  selection={noteId}
                  handleDeleteNode={handleRemoveNode}
                  classes={{
                    nodeWrapper:
                      'px-5 leading-[47px] text-lg cursor-pointer rounded-lg bg-th-secondary-100 hover:bg-th-secondary-200 ltr:flex',
                    nodeTextBlock: 'items-center truncate',
                  }}
                  data={dataForTreeView}
                  setSelectedNodeId={setNoteId}
                  selectedNodeId={noteId}
                  treeWidth={'w-full'}
                  icons={icons}
                  handleOnClick={(note) => {
                    changeNode(note.node.data.id)
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
                    emptyMenu: 'p-2.5 cursor-pointer text-gray-300',
                  }}
                  isRtl={isRtl}
                />
              </>
            ) : (
              <Progress className="progress-custom-colors mx-auto w-14 animate-spin stroke-th-primary-100" />
            )}
          </>
        ) : (
          <>
            <div
              className="absolute top-4 flex w-fit cursor-pointer rounded-full bg-th-secondary-100 p-1 hover:opacity-70"
              onClick={() => {
                saveNote()
                setActiveNote(null)
                setIsShowMenu(false)
                localStorage.setItem('activePersonalNote', JSON.stringify({}))
              }}
            >
              <Back className="w-8 stroke-th-primary-200" />
            </div>
            <Redactor
              classes={{
                title: 'bg-th-secondary-100 p-2 my-4 ml-12 font-bold rounded-lg',
                redactor:
                  'p-4 my-4 pb-20 bg-th-secondary-100 overflow-hidden break-words rounded-lg',
              }}
              activeNote={activeNote}
              setActiveNote={setActiveNote}
              placeholder={t('TextNewNote')}
              emptyTitle={t('EmptyTitle')}
              isSelectableTitle
              isRtl={isRtl}
            />
          </>
        )}
      </div>

      <Modal isOpen={isOpenModal} closeHandle={() => setIsOpenModal(false)}>
        <div className="flex flex-col items-center gap-7">
          <div className="text-center text-2xl">
            {t('AreYouSureDelete') +
              ' ' +
              t(
                currentNodeProps
                  ? currentNodeProps.node.data.name
                  : t('AllNotes').toLowerCase()
              ) +
              '?'}
          </div>
          <div className="flex w-1/2 gap-7 text-th-text-primary">
            <button
              className="btn-base flex-1 bg-th-secondary-10 hover:opacity-70"
              onClick={() => {
                setIsOpenModal(false)
                currentNodeProps ? removeNode() : removeAllNotes()
              }}
            >
              {t('Yes')}
            </button>
            <button
              className="btn-base flex-1 bg-th-secondary-10 hover:opacity-70"
              onClick={() => setIsOpenModal(false)}
            >
              {t('No')}
            </button>
          </div>
        </div>
      </Modal>
    </>
  )
}
