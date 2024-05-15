import React from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { useTranslation } from 'react-i18next'

import { getStaticPaths, makeStaticProperties } from '../../../lib/get-static'

import ProjectsList from '../../../components/ProjectsList'

import VcanaLogo from '../../../public/icons/vcana-logo-color.svg'

export default function Account() {
  const {
    i18n: { language: locale },
    t,
  } = useTranslation(['common', 'projects'])

  const [projects, setProjects] = React.useState([])

  React.useEffect(() => {
    setProjects(window.electronAPI.getProjects())
  }, [])

  return (
    <>
      <Head>
        <title>{t('V-CANA')}</title>
      </Head>
      <div className="text-2xl w-full">
        <Link href={`/${locale}/home`} legacyBehavior>
          <a>
            <VcanaLogo className="w-32 pt-6" />
          </a>
        </Link>
        <h2 className="my-6 text-4xl">{t('Projects')}</h2>
        <div className="py-4">
          <ProjectsList projects={projects} />
        </div>
        <Link href={`/${locale}/create`} legacyBehavior>
          <a className="btn-primary text-base">{t('Import')}</a>
        </Link>
      </div>
    </>
  )
}

export const getStaticProps = makeStaticProperties(['common', 'projects'])

export { getStaticPaths }
