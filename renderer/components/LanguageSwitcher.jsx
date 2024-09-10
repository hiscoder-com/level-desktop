import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'
import { useTranslation } from '@/next-i18next'
import i18next from '../../next-i18next.config.js'

function LanguageSwitcher() {
  const { t, i18n } = useTranslation()
  const locale = i18n.language
  const supportedLngs = i18next.i18n.locales

  const sortedLngs = [locale, ...supportedLngs.filter((lng) => lng !== locale)]

  return (
    <div className="relative max-w-min text-xs lg:text-sm font-bold">
      <Menu>
        <MenuButton
          className="px-4 py-2 text-sm bg-th-secondary-100 rounded-[9rem] hover:opacity-70"
          onClick={(e) => e.stopPropagation()}
        >
          {t(locale.toUpperCase())}
        </MenuButton>
        <MenuItems className="absolute top-0 right-0 text-sm bg-th-secondary-100 rounded-2xl">
          <div className="flex flex-col">
            {sortedLngs.map((loc) => (
              <MenuItem
                key={loc}
                as="div"
                className="hover:bg-th-primary-100-hover-backgroung last:rounded-b-2xl first:rounded-t-2xl hover:opacity-70"
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
