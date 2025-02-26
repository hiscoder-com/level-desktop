import dynamic from 'next/dynamic'

import { useTranslation } from '@/next-i18next'

import RtlInput from './RtlInput'

import Close from 'public/icons/close.svg'
import Export from 'public/icons/export.svg'
import Import from 'public/icons/import.svg'
import Plus from 'public/icons/plus.svg'

const MenuButtons = dynamic(
  () => import('@texttree/v-cana-rcl').then((mod) => mod.MenuButtons),
  {
    ssr: false,
  }
)
function SearchAndAddWords({
  searchQuery,
  setSearchQuery,
  projectId,
  exportWords,
  listUpdate,
  importWords,
  activeWord,
}) {
  const { t } = useTranslation()

  const addWord = () => {
    const wordId = ('000000000' + Math.random().toString(36).substring(2)).slice(-9)
    window.electronAPI.addWord(projectId, wordId)
    setSearchQuery('')
    listUpdate()
  }

  const dropMenuClassNames = {
    container: {
      className: 'absolute border rounded z-[100] whitespace-nowrap bg-white shadow',
    },
    item: {
      className: 'cursor-pointer bg-th-secondary-100 hover:bg-th-secondary-200',
    },
  }

  const dropMenuItems = {
    dots: [
      {
        id: 'export',
        buttonContent: (
          <span className="flex items-center gap-2.5 py-1 pl-2.5 pr-7">
            <Export className="h-5 w-5" /> {t('Export')}
          </span>
        ),
        action: () => exportWords(),
      },
      {
        id: 'import',
        buttonContent: (
          <span className="flex items-center gap-2.5 py-1 pl-2.5 pr-7">
            <Import className="h-5 w-5" /> {t('Import')}
          </span>
        ),
        action: () => importWords(true),
      },
    ],
  }

  const icons = {
    dots: (
      <div className="flex h-6 w-6 items-center justify-center space-x-1">
        {[...Array(3).keys()].map((key) => (
          <div key={key} className="h-1 w-1 rounded-full bg-white" />
        ))}
      </div>
    ),
  }

  return (
    <div className="flex w-full items-center gap-2.5">
      <div className="relative flex w-full items-center">
        <RtlInput
          className="input-primary w-full !pr-8"
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder={t('Search')}
          readOnly={activeWord}
        />
        {searchQuery && (
          <Close
            className="absolute right-2 z-10 w-6 cursor-pointer rtl:left-1"
            onClick={() => (!activeWord ? setSearchQuery('') : null)}
          />
        )}
      </div>
      <div className="flex gap-2.5 ltr:flex-row rtl:flex-row-reverse">
        <MenuButtons
          classNames={{
            dropdown: dropMenuClassNames,
            button: 'btn-tertiary p-3',
            container: 'flex gap-2 relative',
            buttonContainer: 'relative',
          }}
          menuItems={dropMenuItems}
          icons={icons}
          disabled={activeWord}
        />
        <button
          className="btn-tertiary p-3"
          onClick={addWord}
          title={t('AddWord')}
          disabled={activeWord}
        >
          <Plus className="h-6 w-6 stroke-th-text-secondary-100 stroke-2" />
        </button>
      </div>
    </div>
  )
}

export default SearchAndAddWords
