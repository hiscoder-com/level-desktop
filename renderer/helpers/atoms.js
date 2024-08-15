import { atom } from 'recoil'
const localStorageEffect =
  (key) =>
  ({ setSelf, onSet }) => {
    const savedValue = localStorage.getItem(key)
    if (savedValue != null) {
      setSelf(JSON.parse(savedValue))
    }

    onSet((newValue, _, isReset) => {
      isReset
        ? localStorage.removeItem(key)
        : localStorage.setItem(key, JSON.stringify(newValue))
    })
  }

export const checkedVersesBibleState = atom({
  key: 'checkedVersesBibleState',
  default: [],
})

export const inactiveState = atom({
  key: 'inactiveState',
  default: false,
})

export const currentVerse = atom({
  key: 'currentVerse',
  default: '1',
  effects: [localStorageEffect('currentScrollVerse')],
})

export const stepConfigState = atom({
  key: 'stepConfigState',
  default: { time: 0, title: '', subtitle: '', description: '', whole_book: false },
})
