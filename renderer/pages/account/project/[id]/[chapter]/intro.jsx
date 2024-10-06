import { useEffect, useState } from 'react'

import Head from 'next/head'
import { useRouter } from 'next/router'

import CheckBox from '@/components/CheckBox'
import MarkdownExtended from '@/components/MarkdownExtended'
import { useTranslation } from '@/next-i18next'

export default function IntroPage() {
  const { t } = useTranslation(['common', 'projects'])
  const { query, push } = useRouter()
  const { id, chapter, step } = query
  const [introMd, setIntroMd] = useState('')
  const [checked, setChecked] = useState(false)
  const [title, setTitle] = useState({})
  const [project, setProject] = useState(false)

  useEffect(() => {
    if (id) {
      const _project = window.electronAPI.getProject(id)
      if (_project && _project?.steps?.length <= parseInt(step)) {
        push(`/project/${id}`)
      } else {
        setProject(_project)
      }
    }
  }, [id])

  useEffect(() => {
    if (!project) {
      return
    }

    const stepsData = project.steps[step]
    setIntroMd(stepsData.intro)
    setTitle({ title: stepsData.title, subtitle: null })
  }, [chapter, project, step])

  const nextStepHandle = () => {
    push(`/account/project/${id}/${chapter}/${step}`)
    setChecked(false)
  }

  const saveStepLocalStorage = () => {
    let viewedSteps = JSON.parse(window.electronAPI.getItem('viewedIntroSteps'))
    const { id, chapter, step } = query
    const idIntro = id + '_' + chapter + '_' + step

    if (!viewedSteps) {
      window.electronAPI.setItem('viewedIntroSteps', JSON.stringify([idIntro]))
      return
    }

    if (!viewedSteps.includes(idIntro)) {
      window.electronAPI.setItem(
        'viewedIntroSteps',
        JSON.stringify([...viewedSteps, idIntro])
      )
    }
  }
  return (
    <div className="layout-appbar">
      <Head>
        <title>{t('LEVEL')}</title>
      </Head>

      <div className="f-screen-appbar mb-4 w-full max-w-3xl pt-4">
        <div
          style={{ height: 'calc(100vh - 11rem)' }}
          className="mx-auto mb-4 overflow-auto rounded-lg bg-th-secondary-10 px-6 py-6 lg:px-8"
        >
          <h2 className="mb-4 text-3xl">{title.title}</h2>
          {title.subtitle && <h3 className="mb-4 text-xl">{title.subtitle}</h3>}

          <MarkdownExtended className="markdown-body">{introMd}</MarkdownExtended>

          <p className="mt-10 cursor-default opacity-40">
            * {t('projects:DisableStepDescriptionClue')}
          </p>
        </div>
        <div className="flex h-12 flex-row items-center justify-end space-x-6 md:h-16">
          <CheckBox
            onChange={() => {
              saveStepLocalStorage()
              setChecked((prev) => !prev)
            }}
            checked={checked}
            className={{
              accent:
                'border-th-secondary bg-th-secondary-10 checked:border-th-secondary-400 checked:bg-th-secondary-400 checked:before:bg-th-secondary-400',
              cursor: 'fill-th-secondary-10 stroke-th-secondary-10 text-th-secondary-10',
            }}
            label={t('Ok')}
          />
          <button
            className="btn-quaternary relative w-28 text-center"
            onClick={nextStepHandle}
            disabled={!checked}
          >
            {t('Next')}
          </button>
        </div>
      </div>
    </div>
  )
}
