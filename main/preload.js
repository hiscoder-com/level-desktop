const { contextBridge, ipcRenderer } = require('electron')

process.once('loaded', () => {
  contextBridge.exposeInMainWorld('electronAPI', {
    openFile: () => ipcRenderer.invoke('dialog:openFile'),
    openConfig: () => ipcRenderer.invoke('dialog:openConfig'),
    notify: (handler) =>
      ipcRenderer.on('notify', (event, data) => {
        handler(data)
      }),
    removeNotify: () => ipcRenderer.removeAllListeners('notify'),
    getProjects: () => ipcRenderer.sendSync('get-projects'),
    getProject: (id) => ipcRenderer.sendSync('get-project', id),
    goToStep: (id, chapter, step) =>
      ipcRenderer.sendSync('go-to-step', id, chapter, step),
    getChapter: (projectid, chapter) =>
      ipcRenderer.sendSync('get-chapter', projectid, chapter),
    getBook: (projectid) => ipcRenderer.sendSync('get-book', projectid),
    updateChapter: (projectid, chapter, data) =>
      ipcRenderer.sendSync('update-chapter', projectid, chapter, data),
    divideVerse: (projectid, chapter, verse, enabled) =>
      ipcRenderer.send('divide-verse', projectid, chapter, verse, enabled),
    updateVerse: (projectid, chapter, verse, text) =>
      ipcRenderer.send('update-verse', projectid, chapter, verse, text),
    getItem: (key) => ipcRenderer.sendSync('get-item', key),
    removeItem: (key) => ipcRenderer.sendSync('remove-item', key),
    setProjectFolder: (id) => ipcRenderer.send('set-project-folder', id),
    getWords: () => ipcRenderer.sendSync('get-words'),
    addWord: (projectid, wordid) => ipcRenderer.sendSync('add-word', projectid, wordid),
    updateWord: (projectid, word) => ipcRenderer.sendSync('update-word', projectid, word),
    getWord: (projectid, wordid) => ipcRenderer.sendSync('get-word', projectid, wordid),
    getWordsWithData: (projectid, wordids) =>
      ipcRenderer.sendSync('get-words-with-data', projectid, wordids),
    importWord: (projectid, note) => ipcRenderer.sendSync('import-word', projectid, note),
    importNote: (projectid, note, type) =>
      ipcRenderer.sendSync('import-note', projectid, note, type),
    removeWord: (projectid, wordid) =>
      ipcRenderer.sendSync('remove-word', projectid, wordid),
    getNotes: (type) => ipcRenderer.sendSync('get-notes', type),
    getNotesWithData: (projectid, type) =>
      ipcRenderer.sendSync('get-notes-with-data', projectid, type),
    addNote: (projectid, noteid, isfolder, sorting, type) =>
      ipcRenderer.sendSync('add-note', projectid, noteid, isfolder, sorting, type),
    updateNote: (projectid, note, type) =>
      ipcRenderer.sendSync('update-note', projectid, note, type),
    renameNote: (projectid, title, noteid, type) =>
      ipcRenderer.sendSync('rename-note', projectid, title, noteid, type),
    getNote: (projectid, noteid, type) =>
      ipcRenderer.sendSync('get-note', projectid, noteid, type),
    removeNote: (projectid, noteid, type) =>
      ipcRenderer.sendSync('remove-note', projectid, noteid, type),
    removeAllNotes: (projectid, type) =>
      ipcRenderer.sendSync('remove-all-notes', projectid, type),
    updateNotes: (projectid, notes, type) =>
      ipcRenderer.sendSync('update-notes', projectid, notes, type),
    setItem: (key, val) => ipcRenderer.send('set-item', key, val),
    getUsfm: (id, resource, chapter = false) =>
      ipcRenderer.sendSync('get-usfm', id, resource, chapter),
    getZip: (id, resource, chapter = false) =>
      ipcRenderer.sendSync('get-zip', id, resource, chapter),
    getTN: (id, resource, mainResource, chapter = false) =>
      ipcRenderer.sendSync('get-tn', id, resource, mainResource, chapter),
    getInfo: (id, resource, mainResource, chapter = false) =>
      ipcRenderer.sendSync('get-info', id, resource, mainResource, chapter),
    getTQ: (id, resource, mainResource, chapter = false) =>
      ipcRenderer.sendSync('get-tq', id, resource, mainResource, chapter),
    getTWL: (id, resource, mainResource, chapter = false) =>
      ipcRenderer.sendSync('get-twl', id, resource, mainResource, chapter),
    addProject: (fileUrl) => ipcRenderer.send('add-project', fileUrl),
  })

  const handler = {
    send(channel, value) {
      ipcRenderer.send(channel, value)
    },
    on(channel, callback) {
      const subscription = (_event, ...args) => callback(...args)
      ipcRenderer.on(channel, subscription)

      return () => {
        ipcRenderer.removeListener(channel, subscription)
      }
    },
    setLocale(locale) {
      ipcRenderer.invoke(`setLocale`, locale)
    },
  }

  contextBridge.exposeInMainWorld('ipc', handler)
})
