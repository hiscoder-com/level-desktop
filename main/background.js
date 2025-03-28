import os from 'os'
import path from 'path'

import {
  formatToString,
  parseVerseObjects,
  selectionsFromQuoteAndVerseObjects,
  tsvToJSON,
} from '@texttree/tn-quote-helpers'
import { markRepeatedWords, tsvToJson } from '@texttree/translation-words-helpers'
import decompress from 'decompress'
import { app, dialog, ipcMain } from 'electron'
import serve from 'electron-serve'
import Store from 'electron-store'
import JSZip from 'jszip'
import { marked } from 'marked'
import puppeteer from 'puppeteer'
import { toJSON } from 'usfm-js'
import { v4 as uuid } from 'uuid'

import i18next from '../next-i18next.config.js'
import { mdToJson } from '../renderer/utils/helper'
import supabaseApi from '../renderer/utils/supabaseServer.js'
import { createWindow } from './helpers'
import { localeStore } from './helpers/user-store'

const fs = require('fs')
const isProd = process.env.NODE_ENV === 'production'

if (isProd) {
  serve({ directory: 'app' })
} else {
  app.setPath('userData', path.join(__dirname, '../', `.AppData`))
  fs.mkdirSync(path.join(app.getPath('userData'), `projects`), {
    recursive: true,
  })
}

let projectUrl = path.join(app.getPath('userData'), 'projects')

async function handleFileOpen() {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    buttonLabel: 'Создать проект',
    filters: [{ name: 'Zip Archives', extensions: ['zip'] }],
  })
  if (!canceled) {
    return filePaths[0]
  }
}

async function handleConfigOpen() {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    buttonLabel: 'Открыть конфиг',
  })
  if (!canceled) {
    let { mainResource, resources } = JSON.parse(fs.readFileSync(filePaths[0]))
    resources = resources.map((el) => ({
      name: el,
      isMain: el === mainResource,
    }))
    return { url: filePaths[0], resources }
  }
}

;(async () => {
  await app.whenReady()

  const mainWindow = createWindow('main', {
    width: 1400,
    height: 800,
    backgroundColor: '#fff',
    autoHideMenuBar: isProd,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  })

  if (isProd) {
    await mainWindow.loadURL(`app://./home`)
  } else {
    const port = process.argv[2]
    await mainWindow.loadURL(`http://localhost:${port}/home`)
  }
})()

app.on('window-all-closed', () => {
  app.quit()
})

const storeProjects = new Store({ name: 'projects' })

const storeLS = new Store({ name: 'localStorage' })

const storeUsers = new Store({ name: 'users' })

ipcMain.handle('reset-current-user', () => {
  const currentUser = storeUsers.get('currentUser')

  if (currentUser) {
    storeUsers.delete('currentUser')
  } else {
  }
})

ipcMain.on('get-projects', (event) => {
  let projects = []

  const currentUser = storeUsers.get('currentUser')

  if (currentUser && currentUser.id) {
    const user = storeUsers.get(`users.${currentUser.id}`)
    projects = user?.projects || []
  } else {
    projects = storeProjects.get('projects') || []
  }

  event.returnValue = projects
  event.sender.send('notify', 'Loaded')
})

ipcMain.on('check-project-exists', (event, fileName) => {
  let projects = []
  const currentUser = storeUsers.get('currentUser')

  if (currentUser?.id) {
    const user = storeUsers.get(`users.${currentUser.id}`)
    projects = user?.projects || []
  } else {
    projects = storeProjects.get('projects') || []
  }

  const projectExists = projects.some((project) => project?.fileName === fileName)

  event.returnValue = projectExists
})

let personalNotesLS
let teamNotesLS
function writeLog(message) {
  const logDir = path.join(app.getPath('userData'), 'logs')

  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true })
  }

  const logPath = path.join(logDir, 'app.log')
  fs.appendFileSync(logPath, `[${new Date().toISOString()}] ${message}\n`)
}

;(async () => {
  try {
    const isBibleUploaded = storeLS.get('upload-default-bible-project')
    if (!isBibleUploaded) {
      const fakeEvent = {
        sender: {
          send: (channel, message) => {
            writeLog(`Channel: ${channel}, Message: ${message}`)
          },
        },
      }
      const bibleZipPath = path.join(
        process.resourcesPath,
        'resources',
        'default',
        'project_bible.zip'
      )
      if (fs.existsSync(bibleZipPath)) {
        await handleAddProject(bibleZipPath, fakeEvent)
        writeLog('Bible project added successfully')
        storeLS.set('upload-default-bible-project', true)
        writeLog('Set upload-default-bible-project to true')
      } else {
        writeLog(`Bible ZIP file not found: ${bibleZipPath}`)
      }
    }

    const isObsUploaded = storeLS.get('upload-default-obs-project')
    if (!isObsUploaded) {
      const fakeEvent = {
        sender: {
          send: (channel, message) => {
            writeLog(`Channel: ${channel}, Message: ${message}`)
          },
        },
      }
      const obsZipPath = path.join(
        process.resourcesPath,
        'resources',
        'default',
        'project_obs.zip'
      )
      if (fs.existsSync(obsZipPath)) {
        await handleAddProject(obsZipPath, fakeEvent)
        writeLog('OBS project added successfully')
        storeLS.set('upload-default-obs-project', true)
        writeLog('Set upload-default-obs-project to true')
      } else {
        writeLog(`OBS ZIP file not found: ${obsZipPath}`)
      }
    }
  } catch (error) {
    writeLog(`Error occurred: ${error.message}`)
  }
})()

const getNotesWithType = (type) => {
  let notes
  switch (type) {
    case 'personal-notes':
      notes = personalNotesLS
      break
    case 'team-notes':
      notes = teamNotesLS
      break
    default:
      notes = []
      break
  }
  return notes
}
let dictionaryLS

ipcMain.on('set-project-folder', (event, id) => {
  personalNotesLS = new Store({ name: 'personal-notes', cwd: `projects/${id}` })
  dictionaryLS = new Store({ name: 'dictionary', cwd: `projects/${id}` })
  teamNotesLS = new Store({ name: 'team-notes', cwd: `projects/${id}` })
})

ipcMain.on('get-words', (event) => {
  event.returnValue = dictionaryLS.store
  event.sender.send('notify', 'Loaded')
})

ipcMain.on('add-word', (event, projectid, wordid) => {
  const date = new Date()
  const title = date.toLocaleString()
  dictionaryLS.set(wordid, {
    id: wordid,
    title,
    parent: null,
    is_folder: false,
    created_at: date.getTime(),
  })
  const data = {
    id: wordid,
    created_at: date.getTime(),
    title,
    data: {
      blocks: [],
      version: '2.8.1',
    },
  }
  fs.writeFileSync(
    path.join(projectUrl, projectid, 'dictionary', wordid + '.json'),
    JSON.stringify(data, null, 2),
    { encoding: 'utf-8' }
  )
  event.returnValue = wordid
  event.sender.send('notify', 'Updated')
})

ipcMain.on('import-word', (event, projectid, newword) => {
  const { id, title, parent, is_folder, created_at, data: content } = newword
  const date = new Date()
  dictionaryLS.set(id, {
    id,
    title,
    parent,
    is_folder,
    created_at: date.getTime(),
  })
  const data = {
    id,
    created_at: date.getTime(),
    title,
    data: content,
  }
  fs.writeFileSync(
    path.join(projectUrl, projectid, 'dictionary', id + '.json'),
    JSON.stringify(data, null, 2),
    { encoding: 'utf-8' }
  )
  event.returnValue = id
  event.sender.send('notify', 'Updated')
})
ipcMain.on('import-note', (event, projectid, note, type) => {
  const { id, title, parent_id, is_folder, data: content, sorting } = note
  const date = new Date()
  const notes = getNotesWithType(type)
  notes.set(id, {
    id,
    title,
    parent_id,
    is_folder,
    created_at: date.getTime(),
    sorting,
  })
  const data = {
    id,
    created_at: date.getTime(),
    title,
    data: content,
    sorting,
    is_folder,
    parent_id,
  }
  fs.writeFileSync(
    path.join(projectUrl, projectid, type, id + '.json'),
    JSON.stringify(data, null, 2),
    { encoding: 'utf-8' }
  )
  event.returnValue = id
  event.sender.send('notify', 'Updated')
})

ipcMain.on('update-word', (event, projectid, word) => {
  dictionaryLS.set(`${word.id}.title`, word.title)
  fs.writeFileSync(
    path.join(projectUrl, projectid, 'dictionary', word.id + '.json'),
    JSON.stringify(word, null, 2),
    { encoding: 'utf-8' }
  )
  event.returnValue = word.id
  event.sender.send('notify', 'Updated')
})

ipcMain.on('get-lang', (event) => {
  event.returnValue = localeStore.get('locale', i18next.i18n.defaultLocale)
})

ipcMain.on('get-i18n', (event, ns = 'common') => {
  const lang = localeStore.get('locale', i18next.i18n.defaultLocale)
  let res = {}
  let fileDest
  if (isProd) {
    fileDest = path.join(__dirname, 'locales/')
  } else {
    fileDest = path.resolve('./renderer/public/locales/')
  }

  if (Array.isArray(ns)) {
    ns.forEach((n) => {
      res[n] = JSON.parse(
        fs.readFileSync(path.join(fileDest, lang, n + '.json'), {
          encoding: 'utf-8',
        })
      )
    })
  } else {
    res[ns] = JSON.parse(
      fs.readFileSync(path.join(fileDest, lang, ns + '.json'), {
        encoding: 'utf-8',
      })
    )
  }
  event.returnValue = res
})

ipcMain.on('get-word', (event, projectid, wordid) => {
  const data = fs.readFileSync(
    path.join(projectUrl, projectid, 'dictionary', wordid + '.json'),
    { encoding: 'utf-8' }
  )
  event.returnValue = data
  event.sender.send('notify', 'Loaded')
})
ipcMain.on('get-words-with-data', (event, projectid, wordids) => {
  let words = []
  wordids.forEach((wordid) => {
    const data = fs.readFileSync(
      path.join(projectUrl, projectid, 'dictionary', wordid + '.json'),
      { encoding: 'utf-8' }
    )
    words.push(JSON.parse(data))
  })

  event.returnValue = words
  event.sender.send('notify', 'Loaded')
})

ipcMain.on('remove-word', (event, projectid, wordid) => {
  dictionaryLS.delete(wordid)
  fs.rmSync(path.join(projectUrl, projectid, 'dictionary', wordid + '.json'), {
    force: true,
  })
  event.returnValue = wordid
  event.sender.send('notify', 'Removed')
})

ipcMain.on('get-notes', (event, type) => {
  const notes = getNotesWithType(type)
  event.returnValue = notes.store
  event.sender.send('notify', 'Loaded')
})

ipcMain.on('get-notes-with-data', (event, projectid, type) => {
  let notes = []
  const notesLS = getNotesWithType(type)

  for (const noteId in notesLS.store) {
    if (Object.hasOwnProperty.call(notesLS.store, noteId)) {
      const note = notesLS.store[noteId]
      const newNote = fs.readFileSync(
        path.join(projectUrl, projectid, type, note.id + '.json'),
        { encoding: 'utf-8' }
      )
      const { data } = JSON.parse(newNote)
      notes.push({ ...note, data })
    }
  }
  event.returnValue = notes
  event.sender.send('notify', 'Loaded')
})

ipcMain.on('add-note', (event, projectid, noteid, isfolder, sorting, type, parentId) => {
  const notesLS = getNotesWithType(type)
  const date = new Date()
  const title = date.toLocaleString()
  notesLS.set(noteid, {
    id: noteid,
    title,
    parent_id: parentId || null,
    is_folder: isfolder,
    created_at: date.getTime(),
    sorting,
  })
  const data = {
    id: noteid,
    created_at: date.getTime(),
    title,
    data: {
      blocks: [],
      version: '2.29.1',
    },
  }

  let notePath = path.join(projectUrl, projectid, type)

  fs.writeFileSync(path.join(notePath, noteid + '.json'), JSON.stringify(data, null, 2), {
    encoding: 'utf-8',
  })
  event.returnValue = noteid
  event.sender.send('notify', 'Updated')
})

ipcMain.on('update-note', (event, projectid, note, type) => {
  const notesLS = getNotesWithType(type)
  notesLS.set(`${note.id}.title`, note.title)
  fs.writeFileSync(
    path.join(projectUrl, projectid, type, note.id + '.json'),
    JSON.stringify(note, null, 2),
    { encoding: 'utf-8' }
  )
  event.returnValue = note.id
  event.sender.send('notify', 'Updated')
})

ipcMain.on('rename-note', (event, projectid, title, noteid, type) => {
  const notesLS = getNotesWithType(type)

  notesLS.set(`${noteid}.title`, title)
  const data = fs.readFileSync(path.join(projectUrl, projectid, type, noteid + '.json'), {
    encoding: 'utf-8',
  })
  const newNote = JSON.parse(data)

  fs.writeFileSync(
    path.join(projectUrl, projectid, type, noteid + '.json'),
    JSON.stringify({ ...newNote, title }, null, 2),
    { encoding: 'utf-8' }
  )
  event.returnValue = noteid
  event.sender.send('notify', 'Updated')
})

ipcMain.on('get-note', (event, projectid, noteid, type) => {
  const data = fs.readFileSync(path.join(projectUrl, projectid, type, noteid + '.json'), {
    encoding: 'utf-8',
  })
  event.returnValue = data
  event.sender.send('notify', 'Loaded')
})

ipcMain.on('remove-note', (event, projectid, noteid, type) => {
  const notesLS = getNotesWithType(type)
  let notes = { ...notesLS.store }

  if (!notes[noteid]) {
    event.returnValue = {}
    event.sender.send('notify', 'Note not found')
    return
  }

  const notesToDelete = [noteid]
  const findNestedNotes = (parentId) => {
    for (const [id, note] of Object.entries(notes)) {
      if (note.parent_id === parentId) {
        notesToDelete.push(id)
        if (note.is_folder) {
          findNestedNotes(id)
        }
      }
    }
  }

  if (notes[noteid].is_folder) {
    findNestedNotes(noteid)
  }

  const parentId = notes[noteid].parent_id
  const oldSorting = notes[noteid].sorting

  notesToDelete.forEach((id) => {
    delete notes[id]

    fs.rmSync(path.join(projectUrl, projectid, type, id + '.json'), {
      force: true,
    })
  })

  const siblings = Object.values(notes).filter((note) => note.parent_id === parentId)

  siblings.sort((a, b) => a.sorting - b.sorting)

  siblings.forEach((note, index) => {
    if (note.sorting > oldSorting) {
      note.sorting = index
      notes[note.id].sorting = index
    }
  })

  notesLS.store = notes

  event.returnValue = notesToDelete
  event.sender.send('notify', 'Removed')
})

ipcMain.on('remove-all-notes', (event, projectid, type) => {
  const notesLS = getNotesWithType(type)

  notesLS.clear()
  fs.readdirSync(path.join(projectUrl, projectid, type)).forEach((f) =>
    fs.rmSync(path.join(projectUrl, projectid, type, f))
  )
  event.returnValue = projectid
  event.sender.send('notify', 'Removed')
})

ipcMain.on('update-notes', (event, projectid, notes, type) => {
  const notesLS = getNotesWithType(type)

  notes.forEach((note) => {
    notesLS.set(`${note.id}.parent_id`, note.parent_id)
    notesLS.set(`${note.id}.sorting`, note.sorting)
  })
  event.returnValue = projectid
  event.sender.send('notify', 'Updated')
})

ipcMain.on('get-book', (event, projectid) => {
  const book = {}
  fs.readdirSync(path.join(projectUrl, projectid, 'chapters')).forEach((f) => {
    const data = fs.readFileSync(path.join(projectUrl, projectid, 'chapters', f), {
      encoding: 'utf-8',
    })
    book[f.split('.')[0]] = JSON.parse(data)
  })
  event.returnValue = book
  event.sender.send('notify', 'Loaded')
})

ipcMain.on('get-chapter', (event, projectid, chapter, typeProject) => {
  let chapterFileName = chapter
  if (typeProject === 'obs') {
    chapterFileName = chapter.toString().padStart(2, '0')
  }

  const jsonFileName = path.join(
    projectUrl,
    projectid,
    'chapters',
    chapterFileName + '.json'
  )

  const data = fs.readFileSync(jsonFileName, {
    encoding: 'utf-8',
  })

  event.returnValue = JSON.parse(data)
  event.sender.send('notify', 'Loaded')
})

ipcMain.on('update-chapter', (event, projectid, chapter, data, typeProject) => {
  let chapterFileName = chapter
  if (typeProject === 'obs') {
    chapterFileName = chapter.toString().padStart(2, '0')
  }

  const jsonFileName = path.join(
    projectUrl,
    projectid,
    'chapters',
    chapterFileName + '.json'
  )
  const localChapterData = JSON.parse(
    fs.readFileSync(jsonFileName, { encoding: 'utf-8' })
  )

  const compareEqualArrays = (arr1, arr2) => {
    if (arr1.length !== arr2.length) {
      return false
    }
    return arr1.every((item, index) => item === arr2[index])
  }
  if (!compareEqualArrays(Object.keys(localChapterData), Object.keys(data))) {
    event.returnValue = false
    event.sender.send('notify', 'Error updating chapter')
  } else {
    for (const verse in data) {
      if (Object.hasOwnProperty.call(data, verse) && !localChapterData[verse].enabled) {
        localChapterData[verse].text = data[verse].text
      }
    }
    let chapterFileName = chapter
    if (typeProject === 'obs') {
      chapterFileName = chapter.toString().padStart(2, '0')
    }

    const jsonFileName = path.join(
      projectUrl,
      projectid,
      'chapters',
      chapterFileName + '.json'
    )
    fs.writeFileSync(jsonFileName, JSON.stringify(localChapterData, null, 2), {
      encoding: 'utf-8',
    })
    event.returnValue = true
    event.sender.send('notify', 'Updated')
  }
})

ipcMain.on('update-verse', (event, projectid, chapter, verse, text, typeProject) => {
  let chapterFileName = chapter
  if (typeProject === 'obs') {
    chapterFileName = chapter.toString().padStart(2, '0')
  }

  const jsonFileName = path.join(
    projectUrl,
    projectid,
    'chapters',
    chapterFileName + '.json'
  )
  const chapterData = JSON.parse(
    fs.readFileSync(jsonFileName, {
      encoding: 'utf-8',
    })
  )
  chapterData[verse].text = text
  fs.writeFileSync(jsonFileName, JSON.stringify(chapterData, null, 2), {
    encoding: 'utf-8',
  })
  event.sender.send('notify', 'Updated')
})

ipcMain.on('divide-verse', (event, projectid, chapter, verse, enabled, typeProject) => {
  let chapterFileName = chapter
  if (typeProject === 'obs') {
    chapterFileName = chapter.toString().padStart(2, '0')
  }

  const jsonFileName = path.join(
    projectUrl,
    projectid,
    'chapters',
    chapterFileName + '.json'
  )
  const chapterData = JSON.parse(
    fs.readFileSync(jsonFileName, {
      encoding: 'utf-8',
    })
  )

  if (chapterData[verse]) {
    chapterData[verse].enabled = enabled
    if (!enabled) {
      chapterData[verse].text = ''
    }
  } else {
    console.error(`The key ${verse} is missing in chapterData`)
  }

  fs.writeFileSync(jsonFileName, JSON.stringify(chapterData, null, 2), {
    encoding: 'utf-8',
  })

  event.sender.send('notify', 'Updated')
})

ipcMain.on('set-item', (event, key, val) => {
  storeLS.set(key, val)
  event.sender.send('notify', 'Updated')
})

ipcMain.on('get-item', (event, key) => {
  const projects = storeLS.get(key) || false
  event.returnValue = projects
  event.sender.send('notify', 'Loaded')
})

ipcMain.on('remove-item', (event, key) => {
  storeLS.delete(key)
  event.sender.send('notify', 'Removed')
})

ipcMain.on('get-usfm', (event, id, resource, chapter) => {
  const usfm = fs.readFileSync(path.join(projectUrl, id, resource + '.usfm'), {
    encoding: 'utf-8',
  })
  const jsonData = toJSON(usfm)
  event.returnValue = jsonData.chapters[chapter]
  event.sender.send('notify', 'Loaded')
})

ipcMain.on('get-tq', (event, id, resource, mainResource, chapter) => {
  const tq = fs.readFileSync(path.join(projectUrl, id, resource + '.tsv'), {
    encoding: 'utf-8',
  })

  const jsonData = tsvToJSON(
    tq,
    ['Reference', 'ID', 'Tags', 'Quote', 'Occurrence', 'Question', 'Response'],
    true
  )
  const rangeVerses = []
  const currentChapter = jsonData.filter((el) => {
    if (el.chapter.toString() !== chapter.toString()) {
      return false
    }

    if (el.verse.length > 1) {
      for (let i = 0; i < el.verse.length; i++) {
        rangeVerses.push({ ...el, Reference: chapter + ':' + el.verse[i] })
      }
      return
    }

    return true
  })

  const data = [...currentChapter, ...rangeVerses]

  const questions = {}
  data?.forEach((el) => {
    const verse = el.Reference.split(':').slice(-1)[0]
    const tq = {
      id: `${el.ID}-v${verse}`,
      question: el.Question,
      answer: el.Response,
    }
    if (!questions[verse]) {
      questions[verse] = [tq]
    } else {
      questions[verse].push(tq)
    }
  })

  event.returnValue = questions
  event.sender.send('notify', 'Loaded')
})

ipcMain.on('get-zip', (event, id, resource, chapter) => {
  const zip = fs.readFileSync(path.join(projectUrl, id, resource + '.zip'))
  event.returnValue = zip
  event.sender.send('notify', 'Loaded')
})

ipcMain.on('get-tn', (event, id, resource, mainResource, chapter) => {
  const _data = fs.readFileSync(path.join(projectUrl, id, resource + '.tsv'), {
    encoding: 'utf-8',
  })
  const jsonData = tsvToJSON(
    _data,
    ['Reference', 'Occurrence', 'Quote', 'ID', 'Note'],
    true
  )
  const greekUsfm = fs.readFileSync(path.join(projectUrl, id, 'original.usfm'), {
    encoding: 'utf-8',
  })
  const greek = toJSON(greekUsfm).chapters[chapter]
  const targetUsfm = fs.readFileSync(path.join(projectUrl, id, mainResource + '.usfm'), {
    encoding: 'utf-8',
  })
  const target = toJSON(targetUsfm).chapters[chapter]
  const data = jsonData?.filter((el) => {
    return el.chapter === chapter && !el.verse.includes('intro')
  })
  data.map((selectedTn) => {
    const selections = selectionsFromQuoteAndVerseObjects({
      quote: selectedTn.Quote,
      verseObjects: greek[selectedTn.verse]?.verseObjects || [],
      occurrence: selectedTn.Occurrence,
      chapter: chapter,
      verses: [selectedTn.verse],
    })

    const result = target[selectedTn.verse[0]]?.verseObjects.map((el) =>
      parseVerseObjects(el, selections, {
        chapter: chapter,
        verse: selectedTn.verse,
      })
    )

    const res = formatToString(result)
    selectedTn.origQuote = selectedTn.Quote
    selectedTn.Quote = res || 'General Information'

    return selectedTn
  })
  event.returnValue = data
  event.sender.send('notify', 'Loaded')
})
ipcMain.on('get-tn-obs', (event, id, resource, mainResource, chapter) => {
  const fileName = resource + '.tsv'
  const filePath = path.join(projectUrl, id, fileName)
  const _data = fs.readFileSync(filePath, {
    encoding: 'utf-8',
  })

  const jsonData = tsvToJson(_data)
  const wholeChapter = {}
  const dividedChapter = {}
  let verses

  jsonData?.forEach((el) => {
    const [chapterNote, verseNote] = el.Reference.split(':')

    if (chapterNote !== chapter) {
      return
    }

    const newNote = {
      id: el.ID,
      text: el.Note,
      title: el.Quote,
    }

    if (verses && verses.length > 0 && verses.includes(verseNote)) {
      if (!dividedChapter[verseNote]) {
        dividedChapter[verseNote] = []
      }
      dividedChapter[verseNote].push(newNote)
    } else {
      if (!wholeChapter[verseNote]) {
        wholeChapter[verseNote] = []
      }
      wholeChapter[verseNote].push(newNote)
    }
  })

  const data = verses && verses.length > 0 ? dividedChapter : wholeChapter
  const dataArray = Object.values(data)

  event.returnValue = dataArray
  event.sender.send('notify', 'Loaded')
})

ipcMain.on('get-info', (event, id, resource, mainResource, chapter) => {
  const _data = fs.readFileSync(path.join(projectUrl, id, resource + '.tsv'), {
    encoding: 'utf-8',
  })
  const jsonData = tsvToJSON(
    _data,
    ['Reference', 'Occurrence', 'Quote', 'ID', 'Note'],
    true
  )
  const intros = {}

  jsonData?.forEach((el) => {
    const [chapterNote, verseNote] = el.Reference
      ? el.Reference.split(':')
      : [el.Chapter, el.Verse]
    // пропускаем, если это не наша глава и не введение
    if (chapterNote !== chapter && chapterNote !== 'front') {
      return
    }
    if (verseNote !== 'intro') {
      return
    }

    const newNote = {
      id: el.ID,
      text: el?.OccurrenceNote || el?.Note,
      title: chapterNote === 'front' ? 'bookIntro' : 'chapterIntro',
    }
    intros[newNote.title] = newNote.text
  })
  event.returnValue = intros
  event.sender.send('notify', 'Loaded')
})

ipcMain.on('get-twl', (event, id, resource, mainResource, chapter) => {
  const _data = fs.readFileSync(path.join(projectUrl, id, resource + '.tsv'), {
    encoding: 'utf-8',
  })
  const jsonData = tsvToJSON(
    _data,
    ['Reference', 'ID', 'Tags', 'OrigWords', 'Occurrence', 'TWLink'],
    true
  )
  const markedWords = markRepeatedWords(jsonData, 'all')
  const data = markedWords.filter(
    (wordObject) => chapter.toString() === wordObject.chapter.toString()
  )
  event.returnValue = data
  event.sender.send('notify', 'Loaded')
})

ipcMain.on('get-twl-obs', (event, id, resource, mainResource, chapter) => {
  const fileName = resource + '.tsv'
  const filePath = path.join(projectUrl, id, fileName)
  const _data = fs.readFileSync(filePath, {
    encoding: 'utf-8',
  })
  const jsonData = tsvToJson(_data)

  const markedWords = markRepeatedWords(jsonData, 'all')
  const data = markedWords.filter((wordObject) => {
    const [_chapter] = wordObject.Reference.split(':')
    return _chapter === chapter
  })
  event.returnValue = data
  event.sender.send('notify', 'Loaded')
})

const saveStepData = (projectid, chapter, step, typeProject) => {
  let chapterFileName = chapter
  if (typeProject === 'obs') {
    chapterFileName = chapter.toString().padStart(2, '0')
  }

  const jsonFileName = path.join(
    projectUrl,
    projectid,
    'chapters',
    chapterFileName + '.json'
  )
  const chapterData = JSON.parse(
    fs.readFileSync(jsonFileName, {
      encoding: 'utf-8',
    })
  )
  const time = Date.now()
  for (const verse in chapterData) {
    if (Object.hasOwnProperty.call(chapterData, verse)) {
      chapterData[verse].history.push({
        step: parseInt(step),
        time,
        text: chapterData[verse].text,
      })
    }
  }
  fs.writeFileSync(jsonFileName, JSON.stringify(chapterData, null, 2), {
    encoding: 'utf-8',
  })
}

const restoreStepData = (projectid, chapter, step) => {
  const chapterData = JSON.parse(
    fs.readFileSync(path.join(projectUrl, projectid, 'chapters', chapter + '.json'), {
      encoding: 'utf-8',
    })
  )
  const time = Date.now()
  for (const verse in chapterData) {
    if (Object.hasOwnProperty.call(chapterData, verse)) {
      chapterData[verse].history.push({
        step: parseInt(step),
        time,
        text: chapterData[verse].text,
      })
      chapterData[verse].text = chapterData[verse].history.reduce(
        (acc, cur) => {
          if (cur.time >= acc.time && cur.step === acc.step) {
            return cur
          } else {
            return acc
          }
        },
        { time: 0, text: '', step: parseInt(step) - 1 }
      ).text
    }
  }
  fs.writeFileSync(
    path.join(projectUrl, projectid, 'chapters', chapter + '.json'),
    JSON.stringify(chapterData, null, 2),
    { encoding: 'utf-8' }
  )
}

ipcMain.on('update-project-config', (event, id, updatedConfig) => {
  const configPath = path.join(projectUrl, id, 'config.json')

  try {
    const currentConfig = JSON.parse(fs.readFileSync(configPath, { encoding: 'utf-8' }))
    const mergedConfig = { ...currentConfig, ...updatedConfig }

    fs.writeFileSync(configPath, JSON.stringify(mergedConfig, null, 2), {
      encoding: 'utf-8',
    })

    event.sender.send('update-project-config-reply', true)
  } catch (error) {
    console.error(`Error updating project config: ${error}`)
    event.sender.send('update-project-config-reply', false)
  }
})

ipcMain.on('go-to-step', async (event, id, chapter, step, typeProject) => {
  const config = JSON.parse(
    fs.readFileSync(path.join(projectUrl, id, 'config.json'), {
      encoding: 'utf-8',
    })
  )
  const oldStep = config.chapters[chapter]
  let newStep = step
  if (parseInt(step) >= 0 && config.steps.length > parseInt(step)) {
    config.chapters[chapter] = newStep
    fs.writeFileSync(
      path.join(projectUrl, id, 'config.json'),
      JSON.stringify(config, null, 2),
      { encoding: 'utf-8' }
    )
  } else {
    newStep = parseInt(step) < 0 ? 0 : config.steps.length - 1
  }
  if (newStep > oldStep) {
    saveStepData(id, chapter, oldStep, typeProject)
  }

  if (newStep < oldStep) {
    // restoreStepData(id, chapter, oldStep); Пока решил закрыть, чтобы данные не потерять во время тестирования
  }
  if (newStep === oldStep && oldStep === config.steps.length - 1) {
    saveStepData(id, chapter, oldStep, typeProject)
  }
  event.returnValue = newStep
})

ipcMain.on('get-project', async (event, id) => {
  const config = JSON.parse(
    fs.readFileSync(path.join(projectUrl, id, 'config.json'), {
      encoding: 'utf-8',
    })
  )

  event.returnValue = config
  event.sender.send('notify', 'Project Loaded')
})

async function handleAddProject(url, event) {
  if (!url) {
    console.error('Url not set')
    event.sender.send('notify', 'Url not set')
    return
  }

  let tempDir = null

  const createPropertiesFile = async (projectId, properties) => {
    try {
      const projectPath = path.join(projectUrl, projectId)
      const propertiesPath = path.join(projectPath, 'properties.json')
      await fs.promises.writeFile(propertiesPath, JSON.stringify(properties, null, 2))
    } catch (error) {
      console.error('Error writing properties file:', error)
    }
  }

  const validateProjectStructure = (projectPath) => {
    const requiredFolders = ['chapters', 'dictionary', 'personal-notes', 'team-notes']
    const configFile = 'config.json'

    for (const folder of requiredFolders) {
      if (!fs.existsSync(path.join(projectPath, folder))) {
        throw new Error(`Missing required folder!`)
      }
    }

    if (!fs.existsSync(path.join(projectPath, configFile))) {
      throw new Error(`Missing required file!`)
    }

    const configContent = fs.readFileSync(path.join(projectPath, configFile), 'utf-8')
    if (!configContent.trim()) {
      throw new Error('config.json is empty!')
    }

    let config
    try {
      config = JSON.parse(configContent)
    } catch (err) {
      throw new Error('Invalid JSON format in config.json')
    }

    if (
      !config.book ||
      typeof config.book !== 'object' ||
      !config.book.code ||
      !config.book.name
    ) {
      throw new Error('Invalid book structure in config.json')
    }
    if (!config.project) {
      throw new Error('Invalid project in config.json')
    }
    if (!config.method || typeof config.method !== 'string') {
      throw new Error('Invalid method in config.json')
    }
  }

  if (url) {
    try {
      const id = uuid()
      const createdAt = Date.now()
      const project = { id, createdAt }
      tempDir = path.join(projectUrl, 'temp_' + id)
      await decompress(url, tempDir)
      validateProjectStructure(tempDir)
      const finalDir = path.join(projectUrl, id)
      await fs.promises.rename(tempDir, finalDir)
      const fileName = path.basename(url)
      const configPath = path.join(finalDir, 'config.json')
      const config = JSON.parse(await fs.promises.readFile(configPath, 'utf-8'))
      config.showIntro ??= true

      await fs.promises.writeFile(configPath, JSON.stringify(config, null, 2))

      let defaultProperties
      if (config.typeProject === 'obs') {
        defaultProperties = {
          title: '',
          intro: '',
          back: '',
          chapter_label: '',
        }
      } else {
        defaultProperties = {
          h: '',
          toc1: '',
          toc2: '',
          toc3: '',
          mt: '',
          chapter_label: '',
        }
      }

      project.book = { ...config.book }
      project.title = config.project.title ?? config.project
      project.method = config.method
      project.fileName = fileName
      project.typeProject = config.typeProject
      project.language = config.language
      await createPropertiesFile(id, defaultProperties)

      const currentUser = storeUsers.get('currentUser')
      let updatedProjects

      if (currentUser?.id) {
        const userFromStore = storeUsers.get(`users.${currentUser.id}`) || {}
        updatedProjects = [...(userFromStore.projects || []), project]

        const updatedUser = {
          ...userFromStore,
          projects: updatedProjects,
        }
        storeUsers.set(`users.${currentUser.id}`, updatedUser)
      } else {
        updatedProjects = storeProjects.get('projects') || []
        updatedProjects.push(project)
        storeProjects.set('projects', updatedProjects)
      }

      event.sender.send('notify', 'Created')
      event.sender.send('project-added', id, project, updatedProjects)
    } catch (error) {
      console.error('Error adding project:', error)
      event.sender.send('notify', `Error: ${error.message}`)

      if (tempDir && fs.existsSync(tempDir)) {
        await fs.promises.rm(tempDir, { recursive: true })
      }
      event.sender.send('project-add-error', error.message)
    }
  } else {
    console.error('Url not set')
    event.sender.send('notify', 'Url not set')
  }
}

ipcMain.on('add-project', async (event, url) => {
  await handleAddProject(url, event)
})

ipcMain.on('get-properties', (event, projectId) => {
  const propertiesPath = path.join(projectUrl, projectId, 'properties.json')
  try {
    const propertiesData = fs.readFileSync(propertiesPath, 'utf8')
    event.returnValue = JSON.parse(propertiesData)
  } catch (err) {
    console.error(`Error reading properties file for project ${projectId}:`, err)
    event.returnValue = {}
  }
})

ipcMain.on('update-properties', (event, projectId, properties) => {
  const propertiesPath = path.join(projectUrl, projectId, 'properties.json')
  try {
    fs.writeFileSync(propertiesPath, JSON.stringify(properties, null, 2))
    event.returnValue = true
  } catch (err) {
    console.error(`Error writing properties file for project ${projectId}:`, err)
    event.returnValue = false
  }
})

ipcMain.on('change-time-step', (event, projectId, step, time) => {
  const propertiesPath = path.join(projectUrl, projectId, 'config.json')

  try {
    const fileContent = fs.readFileSync(propertiesPath, 'utf8')
    const properties = JSON.parse(fileContent)

    if (properties.steps && properties.steps[step]) {
      properties.steps[step].time = time

      fs.writeFileSync(propertiesPath, JSON.stringify(properties, null, 2))

      event.returnValue = true
    } else {
      console.error(`Step ${step} not found in project ${projectId}`)
      event.returnValue = false
    }
  } catch (err) {
    console.error(`Error writing properties file for project ${projectId}:`, err)
    event.returnValue = false
  }
})

ipcMain.on('update-project-name', (event, projectId, newName) => {
  const currentUser = storeUsers.get('currentUser')
  const projectsFilePath = path.join(app.getPath('userData'), 'projects.json')
  const usersFilePath = path.join(app.getPath('userData'), 'users.json')

  try {
    if (currentUser?.id) {
      const usersData = JSON.parse(fs.readFileSync(usersFilePath, 'utf8'))

      const userFromStore = usersData.users[currentUser.id]

      if (!userFromStore) {
        throw new Error('User not found!')
      }

      const projectIndex = userFromStore.projects.findIndex(
        (project) => project.id === projectId
      )
      if (projectIndex === -1) {
        throw new Error('Project not found for the current user!')
      }

      userFromStore.projects[projectIndex] = {
        ...userFromStore.projects[projectIndex],
        book: {
          ...userFromStore.projects[projectIndex].book,
          name: newName,
        },
      }

      fs.writeFileSync(usersFilePath, JSON.stringify(usersData, null, 2))
    } else {
      const projectsData = JSON.parse(fs.readFileSync(projectsFilePath, 'utf8'))

      const projectIndex = projectsData.projects.findIndex(
        (project) => project.id === projectId
      )
      if (projectIndex === -1) {
        throw new Error('Project not found!')
      }

      projectsData.projects[projectIndex] = {
        ...projectsData.projects[projectIndex],
        book: {
          ...projectsData.projects[projectIndex].book,
          name: newName,
        },
      }

      fs.writeFileSync(projectsFilePath, JSON.stringify(projectsData, null, 2))
    }

    event.sender.send('project-name-updated', projectId, newName)
  } catch (error) {
    console.error('Error updating project name:', error)
    event.sender.send('notify', `Error: ${error.message}`)
  }
})

ipcMain.on('delete-project', async (event, projectId) => {
  try {
    const projectsFilePath = path.join(app.getPath('userData'), 'projects.json')
    const usersFilePath = path.join(app.getPath('userData'), 'users.json')
    const currentUser = storeUsers.get('currentUser')
    let usersData
    if (currentUser?.id) {
      usersData = JSON.parse(fs.readFileSync(usersFilePath, 'utf8'))

      const userFromStore = usersData.users[currentUser.id]

      if (!userFromStore) {
        throw new Error('The user has not been found!')
      }

      const projectIndex = userFromStore.projects?.findIndex(
        (project) => project.id === projectId
      )
      if (projectIndex === -1) {
        throw new Error('The project was not found by the current user!')
      }

      userFromStore.projects.splice(projectIndex, 1)

      fs.writeFileSync(usersFilePath, JSON.stringify(usersData, null, 2))
    } else {
      const projectsData = JSON.parse(fs.readFileSync(projectsFilePath, 'utf8'))

      const projectIndex = projectsData.projects?.findIndex(
        (project) => project.id === projectId
      )
      if (projectIndex === -1) {
        throw new Error('The project was not found!')
      }

      projectsData.projects.splice(projectIndex, 1)

      fs.writeFileSync(projectsFilePath, JSON.stringify(projectsData, null, 2))
    }

    const projectDirPath = path.join(projectUrl, projectId)
    await fs.promises.rm(projectDirPath, { recursive: true })

    event.sender.send('notify', 'Project deleted')

    const updatedProjects = currentUser?.id
      ? usersData.users[currentUser.id]?.projects
      : JSON.parse(fs.readFileSync(projectsFilePath, 'utf8')).projects

    event.sender.send('projects-updated', updatedProjects)
  } catch (error) {
    console.error('Error deleting project:', error)
    event.sender.send('notify', `Error: ${error.message}`)
  }
})

ipcMain.handle('dialog:openFile', handleFileOpen)
ipcMain.handle('dialog:openConfig', handleConfigOpen)

ipcMain.handle('getTranslatorProjects', async (event, userId) => {
  try {
    const supabaseServerApi = await supabaseApi({ req: {}, res: {} })
    const { data, error } = await supabaseServerApi
      .from('translator_projects_books')
      .select('*')
      .eq('user_id', userId)

    if (error) {
      console.error('Error when getting projects from the view:', error)
      throw error
    }

    if (error) throw error

    return data
  } catch (err) {
    console.error('Error when receiving projects:', err)
    throw err
  }
})

ipcMain.handle('init-current-user', async (event, userId, email) => {
  try {
    const users = storeUsers.get('users') || {}
    const currentUser = storeUsers.get('currentUser')

    if (users[userId]) {
      if (!currentUser || currentUser.id !== userId) {
        storeUsers.set('currentUser', { id: userId, email })
        return { success: true, message: 'Current user updated' }
      }

      return { success: true, message: 'User already exists' }
    }

    storeUsers.set(`users.${userId}`, { id: userId, email })

    storeUsers.set('currentUser', { id: userId, email })

    return { success: true, message: 'User added successfully' }
  } catch (error) {
    console.error('Error:', error)
    return { success: false, message: 'Error adding user' }
  }
})

ipcMain.handle('save-file', async (event, content, fileName) => {
  try {
    const bufferContent = Buffer.isBuffer(content)
      ? content
      : Buffer.from(content, 'base64')
    if (!Buffer.isBuffer(bufferContent)) {
      throw new Error('Content is not a valid Buffer')
    }

    const zipDir = path.join(__dirname, '..', '.AppData', 'zip')

    await fs.promises.mkdir(zipDir, { recursive: true })

    const filePath = path.join(zipDir, fileName)

    await fs.promises.writeFile(filePath, bufferContent)
    return filePath
  } catch (error) {
    console.error('Error saving file to disk:', error)
    throw error
  }
})

ipcMain.handle('get-path-file', async (event, fileName) => {
  try {
    const zipDir = path.join(__dirname, '..', '.AppData', 'zip')
    const filePath = path.join(zipDir, fileName)

    return filePath
  } catch (error) {
    console.error('Error saving file to disk:', error)
    throw error
  }
})

ipcMain.handle('check-file-exists', async (event, fileName) => {
  return checkFileExists(fileName)
})
//Удалить после отладки
const { shell } = require('electron')

const readJsonFile = (filePath) => {
  try {
    const content = fs.readFileSync(filePath, 'utf8')
    return JSON.parse(content)
  } catch (err) {
    console.error(`Error reading the JSON file ${filePath}:`, err)
    return {}
  }
}

const loadZipArchive = async (zipPath) => {
  try {
    const zipData = fs.readFileSync(zipPath)
    return await JSZip.loadAsync(zipData)
  } catch (err) {
    console.error(`ZIP archive download error${zipPath}:`, err)
    return null
  }
}

const getImageFromZip = async (zip, imageFileName) => {
  if (!zip) return ''
  const file = zip.file(`${imageFileName}.jpg`)
  if (file) {
    try {
      const base64Data = await file.async('base64')
      return `data:image/jpeg;base64,${base64Data}`
    } catch (err) {
      console.error(`Error receiving image data ${imageFileName}.jpg:`, err)
    }
  } else {
    console.error(`The image was not found in the archive: ${imageFileName}.jpg`)
  }
  return ''
}

const generateChapterTitleHtml = async (chapter, zip, chapter_label, pad) => {
  const titleVerse = chapter.verseObjects.find((v) => v.verse === 0)
  if (!titleVerse) return ''

  return `<div class="chapter-title"><h2>${titleVerse?.text || `${chapter_label} ${chapter.chapterNum}`}</h2></div>`
}

const generateChapterContentHtml = async (
  chapter,
  zip,
  pad,
  chapter_label,
  includeImages = true
) => {
  let imageCount = 0
  const titleStory = chapter.verseObjects.find((v) => v.verse === 0)
  const linkStory = chapter.verseObjects.find((v) => v.verse === 200)

  let versesHtml = `
    <div class="header-container">
      <span class="chapter-header">${titleStory?.text || `${chapter_label} ${chapter.chapterNum}`}</span>
    </div>
    <div class="chapter" id="chapter-${String(chapter.chapterNum).padStart(2, '0')}">
  `

  const verses = chapter.verseObjects.filter((v) => v.verse !== 0)

  let versesWithImages = []
  if (includeImages) {
    versesWithImages = await Promise.all(
      verses
        .filter((v) => v.verse !== 200)
        .map(async (v) => {
          const imageFileName = `obs-en-${pad(chapter.chapterNum)}-${pad(v.verse)}`
          const imageSrc = await getImageFromZip(zip, imageFileName)
          return { ...v, imageSrc }
        })
    )
  } else {
    versesWithImages = verses.map((v) => ({ ...v, imageSrc: null }))
  }

  let lastImageIndex = -1
  versesWithImages.forEach((v, idx) => {
    if (v.imageSrc) lastImageIndex = idx
  })

  for (let i = 0; i < versesWithImages.length; i++) {
    const v = versesWithImages[i]
    versesHtml += `
      <div class="verse ${v.enabled ? 'enabled' : 'disabled'}">
        ${
          v.imageSrc && includeImages
            ? `<img src="${v.imageSrc}" alt="Image for chapter ${chapter.chapterNum}, verse ${v.verse}">`
            : ''
        }
        <p>${v.text}</p>
      </div>
    `

    if (v.imageSrc && includeImages) {
      imageCount++
    }

    if (imageCount >= 2 && i < versesWithImages.length - 1 && i < lastImageIndex) {
      versesHtml += `
        <div class="page-break"></div>
        <div class="header-container">
          <span class="chapter-header">${titleStory?.text || `${chapter_label} ${chapter.chapterNum}`}</span>
        </div>
      `
      imageCount = 0
    }
  }

  versesHtml += `</div>${linkStory?.text ? `<p>${linkStory?.text}</p>` : ''}`

  return versesHtml
}

const generateTableOfContents = (translationTableOfContent, chapters) => {
  let tocHtml = `
    <div class="toc-page">
      <h2>${translationTableOfContent}</h2>
      <ul class="toc-list">
  `
  chapters
    .sort((a, b) => Number(a.chapterNum) - Number(b.chapterNum))
    .forEach((chapter) => {
      const titleStory = chapter.verseObjects.find((v) => v.verse === 0)
      const chapterId = `chapter-${String(chapter.chapterNum).padStart(2, '0')}`
      tocHtml += `
        <li>
          <a href="#${chapterId}" class="toc-link">
           <span class="chapter-title">${titleStory?.text || `${chapter.title || 'Chapter'} ${chapter.chapterNum}`}</span>
            <span class="dot-leader"></span>
            <span class="page-number" data-chapter="${chapterId}">[page number]</span>
          </a>
        </li>
      `
    })
  tocHtml += `</ul></div>`
  return tocHtml
}

const generateHtmlContent = async (
  translationTableOfContent,
  project,
  chapters,
  isRtl,
  singleChapter = null,
  includeImages,
  doubleSided
) => {
  const propertiesPath = path.join(projectUrl, project.id, 'properties.json')
  const properties = readJsonFile(propertiesPath)
  const chapter_label = properties.chapter_label || 'Story'
  const hasTitle = Boolean(properties.title && properties.title.trim())
  const hasIntro = Boolean(properties.intro && properties.intro.trim())
  const hasBack = Boolean(properties.back && properties.back.trim())

  const titlePage = hasTitle
    ? `<div class="title-page"><h1>${properties.title.trim()}</h1></div>`
    : ''

  const introPage = hasIntro
    ? `<div class="intro-page">${marked(properties.intro.trim())}</div>`
    : ''

  const backPage = hasBack
    ? `<div class="intro-page">${marked(properties.back.trim())}</div>`
    : ''

  const pad = (num) => String(num).padStart(2, '0')

  let chaptersEntries = []
  if (chapters && typeof chapters === 'object') {
    chaptersEntries = Object.entries(chapters)
  } else if (singleChapter) {
    const chaptersDataPath = path.join(
      projectUrl,
      project.id,
      'chapters',
      `${singleChapter}.json`
    )
    const allChapters = readJsonFile(chaptersDataPath)
    const chapterData = allChapters[String(parseInt(singleChapter, 10))]
    if (!chapterData) {
      throw new Error(`Chapter ${singleChapter} not found`)
    }
    chaptersEntries = [[String(singleChapter), chapterData]]
  } else {
    throw new Error('There is no data about the chapters')
  }

  const filteredChapters = singleChapter
    ? chaptersEntries.filter(([num]) => num === String(singleChapter))
    : chaptersEntries

  const book = filteredChapters
    .sort((a, b) => Number(a[0]) - Number(b[0]))
    .map(([num, verses]) => ({
      chapterNum: num,
      title: verses['0']?.text || `${chapter_label} ${num}`,
      verseObjects: Object.entries(verses)
        .map(([verse, data]) => ({
          verse: Number(verse),
          text: data.text,
          enabled: data.enabled,
        }))
        .sort((a, b) => a.verse - b.verse),
    }))

  const zipPath = path.join(projectUrl, project.id, 'obs-images-360px.zip')
  const zip = await loadZipArchive(zipPath)

  // Выбираем ограниченный список глав (пример: первые 3)
  // Уберите .slice(0, 3), если хотите все главы
  const limitedBook = book.slice(0, 3)
  const tocHtml = generateTableOfContents(translationTableOfContent, limitedBook)

  let isFirstChapter = true
  const chaptersHtmlArray = await Promise.all(
    limitedBook.map(async (chapter) => {
      const chapterTitleHtml = await generateChapterTitleHtml(
        chapter,
        zip,
        chapter_label,
        pad
      )
      const versesHtml = await generateChapterContentHtml(
        chapter,
        zip,
        pad,
        chapter_label,
        includeImages
      )

      let chapterContent = ''
      const chapterId = `chapter-${pad(chapter.chapterNum)}`

      chapterContent += `<a id="${chapterId}"></a>`

      if (!isFirstChapter && !(titlePage || introPage)) {
        chapterContent += '<div class="page-break"></div>'
      }
      if (chapterTitleHtml) {
        chapterContent += chapterTitleHtml
        isFirstChapter = false
      }
      if (versesHtml) {
        chapterContent +=
          (!isFirstChapter ? '<div class="page-break"></div>' : '') + versesHtml
      }

      return `<div class="chapter">${chapterContent}</div>`
    })
  )

  const pages = []
  if (titlePage) pages.push(titlePage)
  if (introPage) pages.push(introPage)
  pages.push(tocHtml)
  if (chaptersHtmlArray.length > 0) pages.push(chaptersHtmlArray.join(''))
  if (backPage) pages.push(backPage)

  const content = pages.join('<div class="page-break"></div>')

  const pageStyle = doubleSided
    ? `
      @page { size: A4; }
      @page :left { margin-left: 25mm; margin-right: 15mm; }
      @page :right { margin-left: 15mm; margin-right: 25mm; }
    `
    : `
      @page { size: A4; margin-left: 25mm; margin-right: 15mm; }
    `

  const tocStyles = `
   .toc-page {
    margin: 20px;
    }

   .toc-page h2 {
    text-align: ${isRtl ? 'right' : 'left'};
    font-size: 20px;
    margin-bottom: 1em;
    font-weight: bold;
    }

  .toc-list {
    list-style-type: none;
    padding: 0;
    margin: 0;
  }

  .toc-list li {
   margin-bottom: 5px;
  }

  .toc-link {
    display: flex;         
    align-items: center;   
    text-decoration: none; 
    color: inherit;       
  }

  .chapter-title {
   white-space: nowrap;   
   margin-right: 8px;
  }

  .dot-leader {
    flex: 1;               
    border-bottom: 1px dotted #000;
    margin: 0 8px;
  }

  .page-number {
   width: 40px;           
   text-align: right;
    white-space: nowrap;
  }

  `

  return `
    <html lang="${isRtl ? 'ar' : 'en'}" dir="${isRtl ? 'rtl' : 'ltr'}">
      <head>
        <meta charset="UTF-8">
        <title>${properties.title}</title>
        <style>
          ${pageStyle}
          body {
            font-family: 'Amiri', serif;
            direction: ${isRtl ? 'rtl' : 'ltr'};
            text-align: ${isRtl ? 'right' : 'left'};
            padding: 20px;
          }
          h1 { font-size: 24px; margin-bottom: 10px; }
          h2 { font-size: 20px; margin-bottom: 10px; }

          .title-page {
            padding-top: 40vh; 
            text-align: center;
            height: 100vh;
            box-sizing: border-box;
          }
          .title-page h1 {
            margin: 0;
          }
          .intro-page {
            padding: 40px;
            min-height: 100vh;
          }
          .chapter {
            margin-bottom: 20px;
          }
          .chapter-title {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            text-align: center;
          }
          .verse {
            font-size: 16px;
            margin-bottom: 5px;
          }
          .verse img {
            display: block;
            margin-bottom: 5px;
            max-width: 100%;
            height: auto;
          }
          .page-break {
            display: block;
            height: 0;
            line-height: 0;
            page-break-after: always;
          }
          .header-container {
            position: relative;
            height: 20mm; 
          }
          .chapter-header {
            position: absolute;
            top: 0;
            ${isRtl ? 'left' : 'right'}: 0;
            font-size: 18px;
            font-weight: bold;
            margin-top: 20px;
            text-align: ${isRtl ? 'left' : 'right'};
          }
          @media print {
            .title-page,
            .intro-page {
              height: auto !important;
              min-height: auto !important;
            }
            body > :last-child {
              page-break-after: auto;
            }
          }

          ${tocStyles}
        </style>
      </head>
      <body>
        ${content}
      </body>
    </html>
  `
}

ipcMain.handle(
  'export-to-pdf-obs',
  async (
    _,
    t,
    chapters,
    project,
    isRtl,
    singleChapter = null,
    includeImages = true,
    doubleSided
  ) => {
    try {
      const translationTableOfContent = t.translation

      if ((!chapters && !singleChapter) || !project || !project.book?.code) {
        throw new Error('Invalid project or chapters data')
      }
      project.name = project.title || project.name

      const formattedDate = new Date().toISOString().split('T')[0]
      const defaultFileName = `${project.name}_${project.book.code}_${formattedDate}.pdf`
      const filePath = path.join(
        require('electron').app.getPath('downloads'),
        defaultFileName
      )

      const originalHtml = await generateHtmlContent(
        translationTableOfContent,
        project,
        chapters,
        isRtl,
        singleChapter,
        includeImages,
        doubleSided
      )

      const browser = await puppeteer.launch({})
      const page = await browser.newPage()

      await page.setContent(originalHtml, { waitUntil: 'load' })

      await new Promise((resolve) => setTimeout(resolve, 1000))

      const chapterPages = await page.evaluate(() => {
        const result = {}
        const pageHeight = window.innerHeight
        function calculatePageNumber(element) {
          const rect = element.getBoundingClientRect()
          return Math.ceil((rect.top + window.scrollY) / pageHeight)
        }
        const spans = document.querySelectorAll('.page-number')
        for (let i = 0; i < spans.length; i++) {
          const span = spans[i]
          const chapterId = span.getAttribute('data-chapter')
          const chapterElement = document.getElementById(chapterId)
          if (chapterElement) {
            result[chapterId] = calculatePageNumber(chapterElement)
          }
        }
        return result
      })

      const updatedHtml = originalHtml.replace(
        /<span class="page-number" data-chapter="([^"]+)">\[page number\]<\/span>/g,
        (match, chapterId) => {
          const pageNum = chapterPages[chapterId] || '...'
          return `<span class="page-number" data-chapter="${chapterId}">${pageNum}</span>`
        }
      )

      await page.setContent(updatedHtml, { waitUntil: 'load' })

      await page.pdf({ path: filePath, format: 'A4' })
      await browser.close()
      await shell.openPath(filePath)

      return filePath
    } catch (error) {
      console.error('PDF export error:', error)
      throw error
    }
  }
)

const checkFileExists = (fileName) => {
  return new Promise((resolve, reject) => {
    const zipDir = path.join(__dirname, '..', '.AppData', 'zip')

    const filePath = path.join(zipDir, fileName)

    fs.access(filePath, fs.constants.F_OK, (err) => {
      if (err) {
        resolve(false)
      } else {
        resolve(true)
      }
    })
  })
}

ipcMain.handle('read-obs-zip', async (event, { id, chapter }) => {
  try {
    const fileName =
      chapter === 'front' || chapter === 'back'
        ? `${chapter}.md`
        : `${String(chapter).padStart(2, '0')}.md`

    const baseDir = isProd
      ? path.join(app.getPath('userData'), 'projects', id)
      : path.join(__dirname, '..', '.AppData', 'projects', id)

    const filePath = path.join(baseDir, 'obs.zip')

    if (!fs.existsSync(filePath)) {
      throw new Error(`Archive not found at ${filePath}`)
    }

    const zipBuffer = await fs.promises.readFile(filePath)
    const zip = await JSZip.loadAsync(zipBuffer)
    const zipFile = zip.file(`content/${fileName}`)
    if (!zipFile) throw new Error(`File ${fileName} not found in the archive`)

    const mdData = await zipFile.async('string')
    const jsonData = mdToJson(mdData)
    const { additionalVerses, verseObjects } = jsonData

    return [...additionalVerses, ...verseObjects].sort((a, b) => a.verse - b.verse)
  } catch (error) {
    console.error('Error processing the archive:', error)
    throw error
  }
})
