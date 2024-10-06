import { useEffect, useState } from 'react'

import Head from 'next/head'

import ProjectsList from '@/components/ProjectsList'
import { useTranslation } from '@/next-i18next'

export default function Account() {
  const { t } = useTranslation(['common', 'projects'])

  const [projectsList, setProjectsList] = useState([])

  useEffect(() => {
    const handleProjectAdded = (event) => {
      const { updatedProjects } = event.detail
      setProjectsList(updatedProjects)
    }

    window.addEventListener('project-added', handleProjectAdded)

    return () => {
      window.removeEventListener('project-added', handleProjectAdded)
    }
  }, [])

  return (
    <>
      <Head>
        <title>{t('LEVEL')}</title>
      </Head>

      <div className="w-full text-2xl">
        <div className="fidex mx-auto mb-10 max-w-xs py-4 md:max-w-2xl xl:max-w-5xl 2xl:max-w-7xl">
          <ProjectsList projectsList={projectsList} setProjectsList={setProjectsList} />
        </div>
      </div>
    </>
  )
}
