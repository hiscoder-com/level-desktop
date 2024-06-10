import React, { useEffect, useState } from 'react'

import { useRouter } from 'next/router'

import { useTranslation } from '@/next-i18next'
import { Tab } from '@headlessui/react'
import Tool from '@/components/Tool'
import CheckBox from '@/components/CheckBox'
import Breadcrumbs from '@/components/Breadcrumbs'
import ProgressBar from '@/components/ProgressBar'

import { useRecoilValue } from 'recoil'

// import { makeStaticProperties } from '@/lib/get-static'
import { inactiveState } from '@/helpers/atoms'

import Dict from '@/public/icons/dictionary.svg'
import Notepad from '@/public/icons/notepad.svg'
import Audio from '@/public/icons/audio.svg'
import Pencil from '@/public/icons/editor-pencil.svg'
import Info from '@/public/icons/info.svg'
import TeamNote from '@/public/icons/team-note.svg'

const sizes = {
  1: 'lg:w-1/6',
  2: 'lg:w-2/6',
  3: 'lg:w-3/6',
  4: 'lg:w-4/6',
  5: 'lg:w-5/6',
  6: 'lg:w-full',
}

const translateIcon = <Pencil className="w-5 inline" />

const icons = {
  personalNotes: <Notepad className="w-5 inline" />,
  teamNotes: <TeamNote className="w-5 inline" />,
  dictionary: <Dict className="w-5 inline" />,
  retelling: <Audio className="w-5 inline" />,
  info: <Info className="w-5 inline" />,
  blindEditor: translateIcon,
  editor: translateIcon,
}

function StepPage() {
  const { t } = useTranslation()
  const {
    query: { id, chapter, step },
    push,
  } = useRouter()
  const inactive = useRecoilValue(inactiveState)

  const [project, setProject] = useState(false)
  const [checked, setChecked] = useState(false)
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

  const nextStepHandle = () => {
    const nextStep = window.electronAPI.goToStep(id, chapter, parseInt(step) + 1)

    if (nextStep !== parseInt(step)) {
      push(`/account/project/${id}/${chapter}/${nextStep}`)
    } else {
      push(`/account/project/${id}`)
    }
    setChecked(false)
  }
  return (
    <div className="w-full">
      <Breadcrumbs
        links={[
          {
            href: `/account/project/${id}`,
            title: `${project?.book?.name} ${chapter}`,
          },
        ]}
        currentTitle={project?.steps?.[step]?.title}
      />
      <div className="layout-step">
        {project?.steps?.[step] &&
          project.steps[step].cards.map((el, index) => (
            <div
              key={index}
              className={`layout-step-col ${index === 0 && inactive ? 'inactive' : ''} ${
                sizes[el.size]
              }`}
            >
              <Panel
                t={t}
                tools={el.tools}
                mainResource={project.mainResource}
                id={id}
                chapter={chapter}
                toolNames={project.resources}
                stepConfig={project.steps[step]}
              />
            </div>
          ))}
      </div>
      <div className="relative flex flex-col justify-center items-center px-4 mx-auto w-full md:flex-row-reverse lg:px-0 mt-2 h-16">
        <div className="pb-3 md:pb-0">
          <ProgressBar
            amountSteps={project?.steps?.length}
            currentStep={parseInt(step) + 1}
          />
        </div>
        <div className="absolute right-0 flex items-center h-12 md:h-16">
          <div className="flex flex-row items-center space-x-6">
            <CheckBox
              onChange={() => setChecked((prev) => !prev)}
              checked={checked}
              className={{
                accent:
                  'bg-th-secondary-10 checked:bg-th-secondary-400 checked:border-th-secondary-400 checked:before:bg-th-secondary-400 border-th-secondary',
                cursor:
                  'fill-th-secondary-10 text-th-secondary-10 stroke-th-secondary-10',
              }}
              label={t('Done')}
            />
            <button
              className="relative btn-quaternary w-28 text-center"
              onClick={nextStepHandle}
              disabled={!checked}
            >
              {project?.steps?.length === parseInt(step) + 1 ? t('Finish') : t('Next')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

function Panel({ tools, mainResource, id, chapter, toolNames, stepConfig, t }) {
  return (
    <Tab.Group>
      <Tab.List className="space-x-3 text-xs px-3 -mb-2 lg:-mb-7 flex overflow-auto">
        {tools?.map((tool, idx) => (
          <Tab
            key={tool.name + idx}
            className={({ selected }) =>
              classNames(
                'text-xs p-1 flex-1 lg:pb-3 md:p-2 md:text-sm lg:text-base text-ellipsis overflow-hidden whitespace-nowrap',
                selected ? 'tab-active' : 'tab-inactive'
              )
            }
          >
            {[
              'editor',
              'commandTranslate',
              'blindEditor',
              'teamNotes',
              'personalNotes',
              'retelling',
              'dictionary',
              'info',
            ].includes(tool.name) ? (
              <span title={t(tool.name)}>
                {icons[tool.name]}
                <span className="hidden ml-2 sm:inline">{t(tool.name)}</span>
              </span>
            ) : (
              toolNames[tool.config.resource]
            )}
          </Tab>
        ))}
      </Tab.List>
      <Tab.Panels>
        {tools?.map((tool, index) => {
          return (
            <Tab.Panel key={index}>
              <div className="flex flex-col bg-white rounded-lg h-full">
                <Tool
                  config={{
                    mainResource,
                    id,
                    chapter,
                    ...tool.config,
                    wholeChapter: stepConfig.whole_chapter,
                  }}
                  toolName={tool.name}
                />
              </div>
            </Tab.Panel>
          )
        })}
      </Tab.Panels>
    </Tab.Group>
  )
}

export default StepPage

// export const getStaticProps = makeStaticProperties(['common', 'projects'])

// export async function getStaticPaths() {
//   return { paths: [], fallback: true }
// }
