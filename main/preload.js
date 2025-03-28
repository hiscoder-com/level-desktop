const { contextBridge, ipcRenderer } = require('electron')

process.once('loaded', () => {
  ipcRenderer.on('update-project-config-reply', (event, success) => {
    if (!success) {
      console.error('Failed to update project config')
    }
  })
  contextBridge.exposeInMainWorld('electronAPI', {
    openFile: () => ipcRenderer.invoke('dialog:openFile'),
    openConfig: () => ipcRenderer.invoke('dialog:openConfig'),
    notify: (handler) =>
      ipcRenderer.on('notify', (event, data) => {
        handler(data)
      }),
    removeNotify: () => ipcRenderer.removeAllListeners('notify'),
    localeChanged: (handler) =>
      ipcRenderer.on('localeChanged', (event, data) => {
        handler(data)
      }),
    removeLocaleChanged: () => ipcRenderer.removeAllListeners('localeChanged'),
    getProjects: () => ipcRenderer.sendSync('get-projects'),
    getProject: (id) => ipcRenderer.sendSync('get-project', id),
    getProperties: (projectId) => ipcRenderer.sendSync('get-properties', projectId),
    updateProperties: (projectId, properties) =>
      ipcRenderer.sendSync('update-properties', projectId, properties),
    updateProjectName: (projectId, newName) => {
      ipcRenderer.send('update-project-name', projectId, newName),
        ipcRenderer.on('project-name-updated', (event, projectId, newName) => {
          window.dispatchEvent(
            new CustomEvent('project-name-updated', { detail: { projectId, newName } })
          )
        })
    },
    updateProjectConfig: (id, updatedConfig) =>
      ipcRenderer.send('update-project-config', id, updatedConfig),
    goToStep: (id, chapter, step, typeProject) =>
      ipcRenderer.sendSync('go-to-step', id, chapter, step, typeProject),
    getChapter: (projectid, chapter, typeProject) =>
      ipcRenderer.sendSync('get-chapter', projectid, chapter, typeProject),
    getBook: (projectid) => ipcRenderer.sendSync('get-book', projectid),
    updateChapter: (projectid, chapter, data, typeProject) =>
      ipcRenderer.sendSync('update-chapter', projectid, chapter, data, typeProject),
    onUpdateChapter: (callback) => {
      ipcRenderer.on('notify', callback)
      return () => ipcRenderer.removeListener('notify', callback)
    },
    removeUpdateChapterListener: (callback) => {
      ipcRenderer.removeListener('notify', callback)
    },
    divideVerse: (projectid, chapter, verse, enabled, typeProject) =>
      ipcRenderer.send('divide-verse', projectid, chapter, verse, enabled, typeProject),
    updateVerse: (projectid, chapter, verse, text, typeProject) =>
      ipcRenderer.send('update-verse', projectid, chapter, verse, text, typeProject),
    getItem: (key) => ipcRenderer.sendSync('get-item', key),
    removeItem: (key) => ipcRenderer.sendSync('remove-item', key),
    setProjectFolder: (id) => ipcRenderer.send('set-project-folder', id),
    getWords: () => ipcRenderer.sendSync('get-words'),
    addWord: (projectid, wordid) => ipcRenderer.sendSync('add-word', projectid, wordid),
    updateWord: (projectid, word) => ipcRenderer.sendSync('update-word', projectid, word),
    getWord: (projectid, wordid) => ipcRenderer.sendSync('get-word', projectid, wordid),
    getI18n: (ns) => ipcRenderer.sendSync('get-i18n', ns),
    getLang: () => ipcRenderer.sendSync('get-lang'),
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
    addNote: (projectid, noteid, isfolder, sorting, type, parentId = null) =>
      ipcRenderer.sendSync(
        'add-note',
        projectid,
        noteid,
        isfolder,
        sorting,
        type,
        parentId
      ),

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
    getTNObs: (id, resource, mainResource, chapter = false) =>
      ipcRenderer.sendSync('get-tn-obs', id, resource, mainResource, chapter),
    getInfo: (id, resource, mainResource, chapter = false) =>
      ipcRenderer.sendSync('get-info', id, resource, mainResource, chapter),
    getTQ: (id, resource, mainResource, chapter = false) =>
      ipcRenderer.sendSync('get-tq', id, resource, mainResource, chapter),
    getTWL: (id, resource, mainResource, chapter = false) =>
      ipcRenderer.sendSync('get-twl', id, resource, mainResource, chapter),
    getTWLObs: (id, resource, mainResource, chapter = false) =>
      ipcRenderer.sendSync('get-twl-obs', id, resource, mainResource, chapter),
    addProject: (fileUrl) => {
      return new Promise((resolve, reject) => {
        ipcRenderer.removeAllListeners('project-added')
        ipcRenderer.removeAllListeners('project-add-error')

        ipcRenderer.once(
          'project-added',
          (event, projectId, project, updatedProjects) => {
            window.dispatchEvent(
              new CustomEvent('project-added', {
                detail: { projectId, project, updatedProjects },
              })
            )
            resolve({ projectId, project, updatedProjects })
          }
        )
        ipcRenderer.once('project-add-error', (event, error) => {
          reject(error)
        })
        ipcRenderer.send('add-project', fileUrl)
      })
    },
    deleteProject: (projectId) => ipcRenderer.send('delete-project', projectId),
    changeTimeStep: (id, step, time) =>
      ipcRenderer.send('change-time-step', id, step, time),

    getTranslatorProjects: (userId) =>
      ipcRenderer.invoke('getTranslatorProjects', userId),

    resetCurrentUser: () => ipcRenderer.invoke('reset-current-user'),

    saveFile: async (content, fileName) => {
      return ipcRenderer.invoke('save-file', content, fileName)
    },

    checkFileExists: async (fileName) => {
      return ipcRenderer.invoke('check-file-exists', fileName)
    },

    checkProjectExists: (fileName) =>
      ipcRenderer.sendSync('check-project-exists', fileName),

    getPathFile: async (fileName) => {
      return ipcRenderer.invoke('get-path-file', fileName)
    },
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

  contextBridge.exposeInMainWorld('electron', {
    initCurrentUser: (userId, email) =>
      ipcRenderer.invoke('init-current-user', userId, email),

    exportToPdfObs: (t, chapters, project, isRtl, includeImages, doubleSided) =>
      ipcRenderer.invoke(
        'export-to-pdf-obs',
        {
          translation: t('projects:TableOfContents'),
        },
        chapters,
        project,
        isRtl,
        null,
        includeImages,
        doubleSided
      ),

    exportToPdfObsChapter: (t, chapters, project, isRtl, singleChapter) =>
      ipcRenderer.invoke(
        'export-to-pdf-obs',
        {
          translation: t('projects:TableOfContents'),
        },
        chapters,
        project,
        isRtl,
        singleChapter,
        true
      ),

    readOBSZipFile: (id, chapter) => ipcRenderer.invoke('read-obs-zip', { id, chapter }),
  })
})
