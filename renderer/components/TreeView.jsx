import React, { useEffect, useMemo, useRef, useState } from 'react'

import { calculateRtlDirection } from '@texttree/notepad-rcl'
import { useRtlDirection } from '@texttree/notepad-rcl/dist/components'
import PropTypes from 'prop-types'
import { Tree } from 'react-arborist'

function TreeView({
  data,
  getCurrentNodeProps,
  setSelectedNodeId,
  handleDoubleClick,
  handleTripleClick,
  handleDeleteNode,
  setHoveredNodeId,
  handleRenameNode,
  selectedNodeId,
  handleDragDrop,
  handleOnClick,
  hoveredNodeId,
  selection = '',
  term = '',
  style = {},
  classes = {},
  handleContextMenu = () => {},
  showRenameButton = false,
  showRemoveButton = false,
  openByDefault = true,
  maxDraggingNodeWidth = '20%',
  minTreeHeight = 400,
  treeWidth = 300,
  nodeHeight = 57,
  indent = 20,
  icons = {
    closeFolder: '🗀',
    openFolder: '🗁',
    arrowRight: '⏵',
    arrowDown: '⏷',
    file: '🗎',
  },
  removeButton = { content: '🗑️', title: 'Delete' },
  renameButton = { content: '✏️', title: 'Rename...' },
  setParentId,
}) {
  const [calcTreeHeight, setCalcTreeHeight] = useState(0)
  const [visibleNodesCount, setVisibleNodesCount] = useState(0)
  const clickCountRef = useRef(0)
  const clickTimer = useRef(null)
  useEffect(() => {
    setCalcTreeHeight((visibleNodesCount + 1) * nodeHeight)
  }, [visibleNodesCount])

  const handleClick = (nodeProps) => {
    const isSameNode = nodeProps.node.id === selectedNodeId
    clickCountRef.current += 1

    const handleAction = (action, mode) => {
      const handleBranch = () =>
        toggleInternalNodes(nodeProps, nodeProps.node.isOpen ? 'close' : 'open')

      if (action === 'openAll' || (!action && mode === 'openAll')) {
        handleBranch()
      } else if (action === 'rename') {
        nodeProps.node.edit()
      } else if (typeof action === 'function') {
        nodeProps.node.isInternal ? nodeProps.node.toggle() : action(nodeProps)
      } else if (action && action.changeNode) {
        action.changeNode(nodeProps)
      } else if (mode === 'edit') {
        nodeProps.node.edit()
      } else {
        nodeProps.node.toggle()
      }
    }

    const resetClickCount = () => {
      clickCountRef.current = 0
    }

    if (clickCountRef.current === (isSameNode ? 2 : 3)) {
      clickTimer.current = setTimeout(() => {
        handleAction(handleDoubleClick, 'openAll')
        resetClickCount()
      }, 300)
    }

    if (clickCountRef.current === (isSameNode ? 3 : 4) && handleRenameNode) {
      clearTimeout(clickTimer.current)
      handleAction(handleTripleClick, 'edit')
      resetClickCount()
    }

    if (clickCountRef.current === 1) {
      setTimeout(() => {
        if (clickCountRef.current === 1) {
          handleAction(handleOnClick)
        }
        resetClickCount()
      }, 400)
    }

    setTimeout(resetClickCount, 500)
  }

  const toggleInternalNodes = (nodeProps, action) => {
    nodeProps.node.isInternal &&
      (action === 'open' ? nodeProps.node.open() : nodeProps.node.close())

    if (nodeProps.node.children !== null) {
      nodeProps.node.children.forEach((child) => {
        toggleInternalNodes({ node: child, tree: nodeProps.tree }, action)
      })
    }
  }

  return (
    <div
      onClick={(e) => {
        e.stopPropagation()
      }}
      className={classes?.treeContainer}
      style={style?.treeContainer}
      onContextMenu={(event) => {
        event.preventDefault()
        setParentId(null)
        handleContextMenu && handleContextMenu(event)
      }}
    >
      <Tree
        selection={selection}
        data={data}
        width={treeWidth}
        searchTerm={term}
        height={calcTreeHeight > minTreeHeight ? calcTreeHeight : minTreeHeight}
        openByDefault={openByDefault}
        rowHeight={nodeHeight}
        rowClassName={'focus:outline-none'}
        disableDrag={typeof handleDragDrop !== 'function'}
        onMove={handleDragDrop}
        onDelete={handleDeleteNode}
        onContextMenu={handleContextMenu}
        searchMatch={(node, term) =>
          node.data.name.toLowerCase().includes(term.toLowerCase())
        }
      >
        {(nodeProps) => {
          const isFile = nodeProps.node.isLeaf
          const isFolderOpen = nodeProps.node.isOpen
          const isDragging = nodeProps.preview

          useEffect(() => {
            setVisibleNodesCount(nodeProps.tree.visibleNodes.length)
          }, [nodeProps.tree.visibleNodes.length])
          const titleDirection = useMemo(
            () => calculateRtlDirection(nodeProps.node.data.name),
            []
          )

          const [inputValue, setInputValue] = useState(nodeProps.node.data.name)
          const editingTitleDirection = useRtlDirection(
            nodeProps.node.isEditing && inputValue ? inputValue : ''
          )
          return (
            <div className={classes?.nodeContainer} style={style?.nodeContainer}>
              <div
                dir={titleDirection}
                ref={nodeProps.dragHandle}
                className={classes?.nodeWrapper}
                style={{
                  ...style?.nodeWrapper,
                  marginLeft: `${nodeProps.node.level * indent}px`,
                  backgroundColor: style?.nodeWrapper
                    ? nodeProps.node.id === selectedNodeId
                      ? style?.nodeWrapper.selectedColor
                      : nodeProps.node.id === hoveredNodeId
                        ? style?.nodeWrapper.hoveredColor
                        : style?.nodeWrapper.backgroundColor
                    : null,
                  maxWidth: isDragging ? maxDraggingNodeWidth : '',
                }}
                onClick={() => {
                  handleClick(nodeProps)
                  if (typeof setSelectedNodeId === 'function') {
                    setSelectedNodeId(nodeProps.node.id)
                  }
                }}
                onContextMenu={(event) => {
                  event.preventDefault()
                  event.stopPropagation()
                  nodeProps.node.select()
                  if (typeof setParentId === 'function') {
                    setParentId(!isFile ? nodeProps.node.id : null)
                  }
                  handleContextMenu && handleContextMenu(event)
                  getCurrentNodeProps && getCurrentNodeProps(nodeProps)
                }}
                onMouseOver={() => {
                  if (typeof setHoveredNodeId === 'function') {
                    setHoveredNodeId(nodeProps.node.id)
                  }
                }}
                onMouseLeave={() => {
                  if (typeof setHoveredNodeId === 'function') {
                    setHoveredNodeId(null)
                  }
                }}
              >
                <div
                  className={classes?.nodeTextBlock}
                  style={{
                    ...style?.nodeTextBlock,
                    display: 'flex',
                    gap: '7px',
                    zIndex: '10',
                  }}
                  dir={titleDirection}
                >
                  {!isFile ? (
                    nodeProps.node.children.length > 0 ? (
                      <>
                        <span>{isFolderOpen ? icons.arrowDown : icons.arrowRight}</span>
                        <span>{isFolderOpen ? icons.openFolder : icons.closeFolder}</span>
                      </>
                    ) : (
                      <>{isFolderOpen ? icons.openFolder : icons.closeFolder}</>
                    )
                  ) : (
                    <>{icons.file}</>
                  )}
                  {nodeProps.node.isEditing ? (
                    <input
                      type="text"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.currentTarget.value)}
                      onFocus={(e) => e.currentTarget.select()}
                      onBlur={() => {
                        nodeProps.node.submit(inputValue)
                        if (typeof handleRenameNode === 'function') {
                          handleRenameNode(inputValue, nodeProps.node.id)
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Escape') nodeProps.node.reset()
                        if (e.key === 'Enter') {
                          nodeProps.node.submit(e.currentTarget.value)
                          if (typeof handleRenameNode === 'function') {
                            handleRenameNode(e.currentTarget.value, nodeProps.node.id)
                          }
                        }
                      }}
                      autoFocus
                      style={style?.renameInput}
                      className={classes?.renameInput}
                      dir={editingTitleDirection}
                    />
                  ) : (
                    <div className={classes?.nodeText} style={style?.nodeText}>
                      {nodeProps.node.data.name}
                    </div>
                  )}
                </div>
                <div className={classes?.nodeButtonBlock} style={style?.nodeButtonBlock}>
                  {showRenameButton && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        nodeProps.node.edit()
                      }}
                      title={renameButton.title}
                      style={style?.renameButton}
                      className={classes?.renameButton}
                    >
                      {renameButton.content}
                    </button>
                  )}
                  {showRemoveButton && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        nodeProps.tree.delete(nodeProps.node.id)
                      }}
                      title={removeButton.title}
                      style={style?.removeButton}
                      className={classes?.removeButton}
                    >
                      {removeButton.content}
                    </button>
                  )}
                </div>
              </div>
            </div>
          )
        }}
      </Tree>
    </div>
  )
}

TreeView.propTypes = {
  /** An object with icons/symbols to display the node type */
  icons: PropTypes.shape({
    file: PropTypes.node,
    closeFolder: PropTypes.node,
    openFolder: PropTypes.node,
    arrowDown: PropTypes.node,
    arrowRight: PropTypes.node,
  }),
  /** ID of the selected node */
  selectedNodeId: PropTypes.string,
  /** Passing an id to the selection prop will select and scroll to that node whenever that id changes */
  selection: PropTypes.string,
  /** Height of each node */
  nodeHeight: PropTypes.number,
  /** Minimum tree window height */
  minTreeHeight: PropTypes.number,
  /** If true, then all folders are open by default */
  openByDefault: PropTypes.bool,
  /** Tree element deletion event handler function */
  handleDeleteNode: PropTypes.func,
  /** Data for visual representation of hierarchy */
  data: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      children: PropTypes.array,
    })
  ).isRequired,
  /** Function to get properties of the current node */
  getCurrentNodeProps: PropTypes.func,
  /** Context menu handler function */
  handleContextMenu: PropTypes.func,
  /** Function to set the selected node */
  setSelectedNodeId: PropTypes.func.isRequired,
  /** Function to set hover node */
  setHoveredNodeId: PropTypes.func,
  /** Node rename handler function */
  handleRenameNode: PropTypes.func,
  /** Node drag handler function */
  handleDragDrop: PropTypes.func,
  /** Hover node ID */
  hoveredNodeId: PropTypes.string,
  /** Click handler function. By default, this is toggles the open/closed state of the folder. If you want to use the built-in function to rename or expand all nested elements, then pass a string with the corresponding 'rename' or 'openAll' values. If you want to pass a function that handles a node, whether it is a file or a folder, then you should provide the object with a "changeNode" function. */
  handleOnClick: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.string,
    PropTypes.shape({
      changeNode: PropTypes.func,
    }),
  ]),
  /** Double click handler function. By default, expands all children of a tree branch. If you want to use the built-in function to rename or expand all nested elements, then pass a string with the corresponding 'rename' or 'openAll' values. If you want to pass a function that handles a node, whether it is a file or a folder, then you should provide the object with a "changeNode" function. */
  handleDoubleClick: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.string,
    PropTypes.shape({
      changeNode: PropTypes.func,
    }),
  ]),
  /** Triple click handler function. By default, causes the node to be renamed if handleRenameNode is true. If you want to use the built-in function to rename or expand all nested elements, then pass a string with the corresponding 'rename' or 'openAll' values. If you want to pass a function that handles a node, whether it is a file or a folder, then you should provide the object with a "changeNode" function. */
  handleTripleClick: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.string,
    PropTypes.shape({
      changeNode: PropTypes.func,
    }),
  ]),
  /** Tree width */
  treeWidth: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  /** Class names for various elements */
  classes: PropTypes.shape({
    /** Class for the container of the tree */
    treeContainer: PropTypes.string,
    /** Class for a node in a tree */
    nodeWrapper: PropTypes.string,
    /** Class for the text block of a node */
    nodeTextBlock: PropTypes.string,
    /** Class for the input field when renaming */
    renameInput: PropTypes.string,
    /** Class for the text of a node */
    nodeText: PropTypes.string,
    /** Class for the button block of a node */
    nodeButtonBlock: PropTypes.string,
    /** Class for the rename button */
    renameButton: PropTypes.string,
    /** Class for the remove button */
    removeButton: PropTypes.string,
  }),
  /** Component styles */
  style: PropTypes.shape({
    /** Styles for the container of the tree */
    treeContainer: PropTypes.object,
    /** Style for a single node item with background colors for normal (backgroundColor), hover (hoveredColor), and selected (selectedColor) states. */
    nodeWrapper: PropTypes.object,
    /** Styles for the text block of a node */
    nodeTextBlock: PropTypes.object,
    /** Style for the input field when renaming */
    renameInput: PropTypes.object,
    /** Styles for the text of a node */
    nodeText: PropTypes.object,
    /** Styles for the button block of a node */
    nodeButtonBlock: PropTypes.object,
    /** Style for the rename button */
    renameButton: PropTypes.object,
    /** Style for the delete button */
    removeButton: PropTypes.object,
  }),
  /** Search query */
  term: PropTypes.string,
  /** Indentation between nesting levels */
  indent: PropTypes.number,
  /** Show delete button */
  showRemoveButton: PropTypes.bool,
  /** Show rename button */
  showRenameButton: PropTypes.bool,
  /** Delete button with content and title */
  removeButton: PropTypes.shape({
    content: PropTypes.node,
    title: PropTypes.string,
  }),
  /** Rename button with content and title */
  renameButton: PropTypes.shape({
    content: PropTypes.node,
    title: PropTypes.string,
  }),

  /** max width of draggable node */
  maxDraggingNodeWidth: PropTypes.string,
}

export default TreeView
