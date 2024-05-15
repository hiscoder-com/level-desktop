import React, { useState } from 'react'
import Head from 'next/head'
// import { useTranslation } from 'react-i18next'
import { makeStaticProperties, getStaticPaths } from '../../lib/get-static'
import Breadcrumbs from '../../components/Breadcrumbs'
import Close from '../../public/icons/close.svg'
import Progress from '../../public/icons/progress.svg'

export default function Create() {
  // const {
  //   i18n: { language: locale },
  //   t,
  // } = useTranslation(['common', 'projects'])
  const locale = 'ru'
  const t = () => {}
  const [fileUrl, setFileUrl] = React.useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const onSubmit = async (e) => {
    e.preventDefault()
    setIsCreating(true)
    try {
      window.electronAPI.addProject(fileUrl)
    } catch (error) {
    } finally {
      setTimeout(() => {
        setIsCreating(false)
      }, 10000)
    }
  }

  return (
    <>
      <Head>
        <title>{t('V-CANA') || 'V-CANA'}</title>
      </Head>
      <Breadcrumbs />

      <div className="flex justify-center text-2xl w-full mt-10">
        <div className="flex flex-col items-center gap-4">
          <h2>{t('projects:CreateProject') || 'Создать проект'}</h2>
          <form onSubmit={onSubmit} className="flex flex-col items-center gap-4">
            <button
              className="btn-primary text-base mt-3 w-fit"
              onClick={async (e) => {
                e.preventDefault()
                const filePath = await window.electronAPI.openFile()
                setFileUrl(filePath)
              }}
            >
              {t('projects:SelectArchiveProject') || 'Выберите архив с проектом'}
            </button>
            <div className="flex items-center gap-2">
              <p className="text-center">{fileUrl || t('NotSelected') || 'Не выбрано'}</p>
              {fileUrl && (
                <Close
                  className="w-5 h-5 cursor-pointer"
                  onClick={() => {
                    setFileUrl(false)
                  }}
                />
              )}
            </div>

            <div className="relative flex justify-center items-center">
              <input
                className="btn-primary text-base"
                type="submit"
                value={t('Create') || 'Создать проект'}
                disabled={!fileUrl || isCreating}
              />
              {isCreating && (
                <Progress className="progress-custom-colors w-6 animate-spin stroke-th-primary-100  absolute" />
              )}
            </div>
          </form>
        </div>
      </div>
    </>
  )
}

export const getStaticProps = makeStaticProperties(['common', 'projects'])

export { getStaticPaths }
