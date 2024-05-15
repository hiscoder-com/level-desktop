import React from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { useTranslation } from 'react-i18next'

import { getStaticPaths, makeStaticProperties } from '../../../lib/get-static'

import ProjectsList from '../../../components/ProjectsList'
import Breadcrumbs from '../../../components/Breadcrumbs'

import Gear from '../../../public/icons/gear.svg'

export default function Account() {
  const {
    i18n: { language: locale },
    t,
  } = useTranslation(['common', 'projects'])

  const [projects, setProjects] = React.useState([])
  const mutate = () => {
    setProjects(window.electronAPI.getProjects())
  }
  React.useEffect(() => {
    mutate()
  }, [])

  return (
    <>
      <Head>
        <title>{t('V-CANA')}</title>
      </Head>
      <div className="text-2xl">
        <Breadcrumbs />

        <div className="absolute top-2 right-16 text-th-secondary-10">
          <Link href={`/${locale}/chapter-merger`}>
            <Gear className="w-10 h-10" />
          </Link>
        </div>
        <h2 className="my-6 mt-16 text-2xl">{t('Projects')}</h2>
        <div className="py-4">
          <ProjectsList projects={projects} mutate={mutate} />
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
