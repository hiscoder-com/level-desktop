import { useEffect, useState } from 'react'
import Head from 'next/head'
import { useTranslation } from '@/next-i18next'
import ProjectsList from '@/components/ProjectsList'

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
        <title>{t('V-CANA')}</title>
      </Head>

      <div className="text-2xl w-full">
        <div className=" fidex py-4 mb-10 max-w-xs md:max-w-2xl xl:max-w-5xl 2xl:max-w-7xl mx-auto">
          <ProjectsList projectsList={projectsList} setProjectsList={setProjectsList} />
        </div>
      </div>
    </>
  )
}
