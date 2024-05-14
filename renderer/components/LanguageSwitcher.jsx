import React, { useEffect } from 'react'

import { useRouter } from 'next/router'
import Link from 'next/link'

import { Menu } from '@headlessui/react'
import { useTranslation } from 'next-i18next'
import i18next from '../../next-i18next.config'

function LanguageSwitcher() {
  const { t, i18n } = useTranslation()
  const locale = i18n.language
  const supportedLngs = i18next.i18n.locales
  const { pathname } = useRouter()

  const sortedLngs = [locale, ...supportedLngs.filter((lng) => lng !== locale)]

  useEffect(() => {
    window.ipc.setLocale(locale)
  }, [locale])

  return (
    <div className="relative max-w-min text-xs lg:text-sm font-bold">
      <Menu>
        <Menu.Button
          className="px-4 py-2 text-sm bg-th-secondary-100 rounded-[9rem] hover:opacity-70"
          onClick={(e) => e.stopPropagation()}
        >
          {t(locale.toUpperCase())}
        </Menu.Button>
        <Menu.Items className="absolute top-0 right-0 text-sm bg-th-secondary-100 rounded-2xl">
          <div className="flex flex-col">
            {sortedLngs.map((loc) => (
              <Menu.Item
                key={loc}
                as="div"
                className="cursor-pointer px-4 py-2 hover:bg-th-primary-100-hover-backgroung last:rounded-b-2xl first:rounded-t-2xl hover:opacity-70"
              >
                <div>
                  <a
                    href={pathname.replace('[locale]', loc)}
                    className={`${locale === loc ? 'text-gray-450' : ''}`}
                  >
                    {t(loc.toUpperCase())}
                  </a>
                </div>
              </Menu.Item>
            ))}
          </div>
        </Menu.Items>
      </Menu>
    </div>
  )
}

export default LanguageSwitcher
