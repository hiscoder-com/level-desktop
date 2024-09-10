import { useTranslation } from '@/next-i18next'
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'

import i18next from '../../next-i18next.config.js'

function LanguageSwitcher() {
  const { t, i18n } = useTranslation()
  const locale = i18n.language
  const supportedLngs = i18next.i18n.locales

  const sortedLngs = [locale, ...supportedLngs.filter((lng) => lng !== locale)]

  return (
    <div className="relative max-w-min text-xs font-bold lg:text-sm">
      <Menu>
        <MenuButton
          className="rounded-[9rem] bg-th-secondary-100 px-4 py-2 text-sm hover:opacity-70"
          onClick={(e) => e.stopPropagation()}
        >
          {t(locale.toUpperCase())}
        </MenuButton>
        <MenuItems className="absolute right-0 top-0 rounded-2xl bg-th-secondary-100 text-sm">
          <div className="flex flex-col">
            {sortedLngs.map((loc) => (
              <MenuItem
                key={loc}
                as="div"
                className="hover:bg-th-primary-100-hover-backgroung first:rounded-t-2xl last:rounded-b-2xl hover:opacity-70"
              >
                <div
                  onClick={() => {
                    window.ipc.setLocale(loc)
                    window.location.reload()
                  }}
                  className={`cursor-pointer px-4 py-2 ${
                    locale === loc ? 'text-th-secondary-300' : ''
                  }`}
                >
                  {t(loc.toUpperCase())}
                </div>
              </MenuItem>
            ))}
          </div>
        </MenuItems>
      </Menu>
    </div>
  )
}

export default LanguageSwitcher
