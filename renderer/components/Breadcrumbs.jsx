import React, { Fragment } from 'react'
import Link from 'next/link'
// import { useTranslation } from 'react-i18next'

import VcanaLogo from '../public/icons/vcana-logo.svg'

export default function Breadcrumbs({ links = [], currentTitle }) {
  // const {
  //   i18n: { language: locale },
  // } = useTranslation()
  const locale = 'ru'

  const homeUrl = `/${locale}/account`

  return (
    <div className="absolute top-0 left-0 w-full bg-slate-550 mb-4">
      <div className="flex items-center px-6 py-4 mx-auto overflow-x-auto whitespace-nowrap">
        <Link href={homeUrl} legacyBehavior>
          <a className="text-th-secondary-10">
            <VcanaLogo className="w-32" />
          </a>
        </Link>
        {links.map((link, idx) => (
          <Fragment key={idx}>
            <span className="mx-5 text-th-secondary-10 rtl:-scale-x-100">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </span>
            <Link href={link.href} legacyBehavior>
              <a className="text-th-secondary-10 hover:underline">{link.title}</a>
            </Link>
          </Fragment>
        ))}
        {currentTitle && (
          <Fragment>
            <span className="mx-5 text-th-secondary-10 rtl:-scale-x-100">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </span>
            <div className="text-th-secondary-10">{currentTitle}</div>
          </Fragment>
        )}
      </div>
    </div>
  )
}
