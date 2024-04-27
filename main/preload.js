const { contextBridge, ipcRenderer } = require('electron');

process.once('loaded', () => {
  contextBridge.exposeInMainWorld('electronAPI', {
    openFile: () => ipcRenderer.invoke('dialog:openFile'),
    openConfig: () => ipcRenderer.invoke('dialog:openConfig'),
    notify: (handler) =>
      ipcRenderer.on('notify', (event, data) => {
        handler(data);
      }),
    removeNotify: () => ipcRenderer.removeAllListeners('notify'),
    getProjects: () => ipcRenderer.sendSync('get-projects'),
    getProject: (id) => ipcRenderer.sendSync('get-project', id),
    goToStep: (id, chapter, step) =>
      ipcRenderer.sendSync('go-to-step', id, chapter, step),
    getChapter: (projectid, chapter) =>
      ipcRenderer.sendSync('get-chapter', projectid, chapter),
    updateChapter: (projectid, chapter, data) =>
      ipcRenderer.sendSync('update-chapter', projectid, chapter, data),
    updateVerse: (projectid, chapter, verse, text) =>
      ipcRenderer.send('update-verse', projectid, chapter, verse, text),
    getItem: (key) => ipcRenderer.sendSync('get-item', key),
    removeItem: (key) => ipcRenderer.sendSync('remove-item', key),
    setProjectFolder: (id) => ipcRenderer.send('set-project-folder', id),
    getWords: () => ipcRenderer.sendSync('get-words'),
    addWord: (projectid, wordid) =>
      ipcRenderer.sendSync('add-word', projectid, wordid),
    updateWord: (projectid, word) =>
      ipcRenderer.sendSync('update-word', projectid, word),
    getWord: (projectid, wordid) =>
      ipcRenderer.sendSync('get-word', projectid, wordid),
    getWordsWithData: (projectid, wordids) =>
      ipcRenderer.sendSync('get-words-with-data', projectid, wordids),
    importWord: (projectid, newword) =>
      ipcRenderer.sendSync('import-word', projectid, newword),
    removeWord: (projectid, wordid) =>
      ipcRenderer.sendSync('remove-word', projectid, wordid),
    getNotes: () => ipcRenderer.sendSync('get-notes'),
    addNote: (projectid, noteid, isfolder, sorting) =>
      ipcRenderer.sendSync('add-note', projectid, noteid, isfolder, sorting),
    updateNote: (projectid, note) =>
      ipcRenderer.sendSync('update-note', projectid, note),
    renameNote: (projectid, title, noteid) =>
      ipcRenderer.sendSync('rename-note', projectid, title, noteid),
    getNote: (projectid, noteid) =>
      ipcRenderer.sendSync('get-note', projectid, noteid),
    removeNote: (projectid, noteid) =>
      ipcRenderer.sendSync('remove-note', projectid, noteid),
    removeAllNotes: (projectid) =>
      ipcRenderer.sendSync('remove-all-notes', projectid),
    updateNotes: (projectid, notes) =>
      ipcRenderer.sendSync('update-notes', projectid, notes),
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
  });
});
