import { useEffect, useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { useTranslation } from 'react-i18next'

import { getStaticPaths, makeStaticProperties } from '../../../lib/get-static'

import ProjectsList from '../../../components/ProjectsList'
import Modal from '../../../components/Modal'

import VcanaLogo from '../../../public/icons/vcana-logo-color.svg'

export default function Account() {
  const {
    i18n: { language: locale },
    t,
  } = useTranslation(['common', 'projects'])

  const [projectsList, setProjectsList] = useState([])
  const [isOpenImportModal, setIsOpenImportModal] = useState(false)
  const [fileUrl, setFileUrl] = useState(false)

  const onSubmit = (e) => {
    e.preventDefault()
    window.electronAPI.addProject(fileUrl)
  }

  if (!locale) {
    return <p>{t('Loading')}</p>
  }

  useEffect(() => {
    setProjectsList(window.electronAPI.getProjects())

    const handleProjectAdded = (event) => {
      const { project } = event.detail
      setProjectsList((prevProjects) => [...prevProjects, project])
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
        <Link href={`/${locale}/home`} legacyBehavior>
          <a>
            <VcanaLogo className="w-32 pt-6" />
          </a>
        </Link>
        <h2 className="my-6 text-4xl">{t('Projects')}</h2>
        <div className="py-4 mb-10">
          <ProjectsList projectsList={projectsList} setProjectsList={setProjectsList} />
        </div>
        <button
          className="btn-primary text-base"
          onClick={() => setIsOpenImportModal(true)}
        >
          {t('Import')}
        </button>
      </div>
      <Modal
        title={t('projects:ImportProject')}
        closeHandle={() => setIsOpenImportModal(false)}
        isOpen={isOpenImportModal}
        className={{
          contentBody: 'max-h-[70vh] overflow-y-auto px-8',
        }}
        buttons={
          <button
            className="btn-secondary my-4"
            onClick={() => setIsOpenImportModal(false)}
          >
            {t('Close')}
          </button>
        }
      >
        <form onSubmit={onSubmit}>
          <div className="flex flex-col gap-4">
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
            <p className="my-6 text-center opacity-40">{fileUrl || t('NotSelected')}</p>
            <input
              className="btn-primary text-base mt-3 mr-3"
              type="submit"
              value={t('Import')}
            />
          </div>
        </form>
      </Modal>
    </>
  )
}

export const getStaticProps = makeStaticProperties(['common', 'projects'])

export { getStaticPaths }
