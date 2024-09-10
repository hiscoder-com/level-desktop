export const generateUniqueId = (existingIds) => {
  let newId
  do {
    newId = ('000000000' + Math.random().toString(36).substring(2, 9)).slice(-9)
  } while (existingIds.includes(newId))
  return newId
}

export const convertNotesToTree = (notes, parentId = null) => {
  const filteredNotes = notes?.filter((note) => note.parent_id === parentId)

  filteredNotes?.sort((a, b) => a.sorting - b.sorting)
  return filteredNotes?.map((note) => ({
    id: note.id,
    name: note.title,
    ...(note.is_folder && {
      children: convertNotesToTree(notes, note.id),
    }),
  }))
}
export const generateFolderName = (title) => {
  const date = new Date()
  const formattedDate = `${String(date.getMonth() + 1).padStart(2, '0')}-${String(
    date.getDate()
  ).padStart(2, '0')}-${date.getFullYear()}`
  return `${title}_${formattedDate}`
}
