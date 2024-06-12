import React from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { useTranslation } from 'react-i18next'
import { makeStaticProperties, getStaticPaths } from '../../lib/get-static'

import VcanaLogo from '../../public/icons/vcana-logo-color.svg'

export default function Create() {
  const {
    i18n: { language: locale },
    t,
  } = useTranslation(['common', 'projects'])
  const [fileUrl, setFileUrl] = React.useState(false)
  const onSubmit = (e) => {
    e.preventDefault()
    window.electronAPI.addProject(fileUrl)
  }

  return (
    <>
      <Head>
        <title>{t('V-CANA')}</title>
      </Head>
      <div className="text-2xl w-full">
        <Link href={`/${locale}/account`} legacyBehavior>
          <a>
            <VcanaLogo className="w-32 pt-6" />
          </a>
        </Link>

        <h2 className="my-6 text-4xl">{t('projects:ImportProject')}</h2>
        <form onSubmit={onSubmit}>
          <button
            className="btn-primary text-base mt-3"
            onClick={async (e) => {
              e.preventDefault()
              const filePath = await window.electronAPI.openFile()
              setFileUrl(filePath)
            }}
          >
            {t('projects:SelectArchiveProject')}
          </button>
          <p className="my-6 opacity-40">{fileUrl || t('NotSelected')}</p>

          <input
            className="btn-primary text-base mt-3 mr-3"
            type="submit"
            value={t('Import')}
          />
          <Link href={`/${locale}/account`} legacyBehavior>
            <a className="btn-primary text-base">{t('Back')}</a>
          </Link>
        </form>
      </div>
    </>
  )
}

export const getStaticProps = makeStaticProperties(['common', 'projects'])

export { getStaticPaths }
