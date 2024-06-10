import dynamic from 'next/dynamic'

import { useTranslation } from 'react-i18next'

import Close from '../public/icons/close.svg'
import Plus from '../public/icons/plus.svg'
import Export from '../public/icons/export.svg'
import Import from '../public/icons/import.svg'

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
          <span className="flex items-center gap-2.5 py-1 pr-7 pl-2.5">
            <Export className="w-5 h-5" /> {t('Export')}
          </span>
        ),
        action: () => exportWords(),
      },
      {
        id: 'import',
        buttonContent: (
          <span className="flex items-center gap-2.5 py-1 pr-7 pl-2.5">
            <Import className="w-5 h-5" /> {t('Import')}
          </span>
        ),
        action: () => importWords(true),
      },
    ],
  }

  const icons = {
    dots: (
      <div className="flex items-center justify-center w-6 h-6 space-x-1">
        {[...Array(3).keys()].map((key) => (
          <div key={key} className="h-1 w-1 bg-white rounded-full" />
        ))}
      </div>
    ),
  }

  return (
    <div className="flex gap-2.5 w-full items-center">
      <div className="relative w-full flex items-center">
        <input
          className="input-primary"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={t('Search')}
          readOnly={activeWord}
        />
        {searchQuery && (
          <Close
            className="absolute р-6 w-6 z-10 cursor-pointer right-2 rtl:left-1"
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
          <Plus className="w-6 h-6 stroke-th-text-secondary-100 stroke-2" />
        </button>
      </div>
    </div>
  )
}

export default SearchAndAddWords
