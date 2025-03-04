import { useEffect, useState } from 'react'

import { useRouter } from 'next/router'

import CheckBox from '@/components/CheckBox'
import ProgressBar from '@/components/ProgressBar'
import Tool from '@/components/Tool'
import { inactiveState, stepConfigState } from '@/helpers/atoms'
import { useTranslation } from '@/next-i18next'
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/react'
import { useRecoilValue, useSetRecoilState } from 'recoil'

import Audio from 'public/icons/audio.svg'
import Dict from 'public/icons/dictionary.svg'
import Pencil from 'public/icons/editor-pencil.svg'
import Info from 'public/icons/info.svg'
import Notepad from 'public/icons/notepad.svg'
import TeamNote from 'public/icons/team-note.svg'

const sizes = {
  1: 'lg:w-1/6',
  2: 'lg:w-2/6',
  3: 'lg:w-3/6',
  4: 'lg:w-4/6',
  5: 'lg:w-5/6',
  6: 'lg:w-full',
}

const translateIcon = <Pencil className="inline w-5" />

const icons = {
  personalNotes: <Notepad className="inline w-5" />,
  teamNotes: <TeamNote className="inline w-5" />,
  dictionary: <Dict className="inline w-5" />,
  retelling: <Audio className="inline w-5" />,
  info: <Info className="inline w-5" />,
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
  const setStepConfig = useSetRecoilState(stepConfigState)

  const [project, setProject] = useState(false)
  const [checked, setChecked] = useState(false)
  const [activeTabIndexes, setActiveTabIndexes] = useState({})

  useEffect(() => {
    if (id) {
      const _project = window.electronAPI.getProject(id)
      setStepConfig(_project?.steps?.[parseInt(step)])
      if (_project && _project?.steps?.length <= parseInt(step)) {
        push(`/project/${id}`)
      } else {
        setProject(_project)
        setActiveTabIndexes({})
      }
    }
  }, [id, step])

  const getIsRepeatIntro = (step, chapter, id) => {
    try {
      const localStorageSteps = JSON.parse(window.electronAPI.getItem('viewedIntroSteps'))
      if (!localStorageSteps) return false
      const idIntro = `${id}_${chapter}_${step}`
      return localStorageSteps?.includes(idIntro)
    } catch (error) {
      return false
    }
  }

  const nextStepHandle = () => {
    const nextStep = window.electronAPI.goToStep(
      id,
      chapter,
      parseInt(step) + 1,
      project.typeProject
    )
    const config = window.electronAPI.getProject(id)
    const isRepeatInfo = getIsRepeatIntro(parseInt(step) + 1, chapter, id)
    const showIntro = config.showIntro && !isRepeatInfo

    if (nextStep !== parseInt(step)) {
      if (showIntro) {
        push(`/account/project/${id}/${chapter}/intro?step=${nextStep}`)
      } else {
        push(`/account/project/${id}/${chapter}/${nextStep}`)
      }
    } else {
      push(`/account/project/${id}`)
    }

    setChecked(false)
  }

  const getTotalTranslationSteps = (steps) => {
    return (steps || []).filter((step) => !step.isTech).length || 0
  }
  const getCurrentTranslationStepIndex = (steps, currentStep) => {
    let currentTranslationStep = 0
    let translationStepIndex = 0

    for (let i = 0; i <= currentStep; i++) {
      if (steps && !steps[i].isTech) {
        currentTranslationStep = translationStepIndex
        translationStepIndex++
      }
    }

    return currentTranslationStep + 1
  }

  return (
    <div className="w-full px-2 pt-4">
      <div className="layout-step mt-32 md:mt-0">
        {project?.steps?.[step] &&
          project.steps[step].cards.map((el, columnIndex) => (
            <div
              key={columnIndex}
              className={`layout-step-col ${
                columnIndex === 0 && inactive ? 'inactive' : ''
              } ${sizes[el.size]}`}
            >
              <Panel
                t={t}
                tools={el.tools}
                mainResource={project.mainResource}
                id={id}
                chapter={chapter}
                toolNames={project.resources}
                stepConfig={project.steps[step]}
                columnIndex={columnIndex}
                activeTabIndexes={activeTabIndexes}
                setActiveTabIndexes={setActiveTabIndexes}
                book={project.book}
                typeProject={project?.typeProject || 'Bible'}
              />
            </div>
          ))}
      </div>
      <div className="mx-auto mt-4 flex w-full flex-col items-center justify-between md:mt-2 md:h-16 md:flex-row md:px-4 lg:px-2">
        <div className="hidden lg:block lg:w-1/3" />
        <div className="flex w-full justify-center md:justify-start lg:w-1/3 lg:justify-center">
          {project && !project.steps[step].isTech && (
            <ProgressBar
              amountSteps={getTotalTranslationSteps(project.steps)}
              currentStep={getCurrentTranslationStepIndex(project.steps, parseInt(step))}
            />
          )}
        </div>
        <div className="my-4 flex w-full items-center justify-end md:my-0 lg:w-1/3">
          <div className="flex flex-row items-center space-x-6">
            <CheckBox
              onChange={() => setChecked((prev) => !prev)}
              checked={checked}
              className={{
                accent:
                  'border-th-secondary bg-th-secondary-10 checked:border-th-secondary-400 checked:bg-th-secondary-400 checked:before:bg-th-secondary-400',
                cursor:
                  'fill-th-secondary-10 stroke-th-secondary-10 text-th-secondary-10',
              }}
              id="goToNextStepCheckBox"
              label={t('Done')}
            />
            <button
              className="btn-quaternary relative w-28 text-center"
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

function Panel({
  tools,
  mainResource,
  id,
  chapter,
  toolNames,
  stepConfig,
  t,
  columnIndex,
  activeTabIndexes,
  setActiveTabIndexes,
  book,
  typeProject,
}) {
  const [isSingleTab, setIsSingleTab] = useState(false)

  useEffect(() => {
    setIsSingleTab(tools.length === 1)
  }, [tools])

  return (
    <TabGroup
      selectedIndex={activeTabIndexes[columnIndex] || 0}
      onChange={(index) =>
        setActiveTabIndexes((prev) => ({
          ...prev,
          [columnIndex]: index,
        }))
      }
    >
      <TabList
        className={`-mb-2 flex overflow-auto text-xs ${!isSingleTab ? 'space-x-3 px-3' : ''} `}
      >
        {tools?.map((tool, idx) => (
          <Tab
            key={tool.name + idx}
            className={({ selected }) =>
              classNames(
                'overflow-hidden text-ellipsis whitespace-nowrap p-1 text-xs md:p-2 md:text-sm lg:pb-3 lg:text-base',
                isSingleTab ? 'flex' : 'flex-1',
                selected ? (isSingleTab ? 'tab-single' : 'tab-active') : 'tab-inactive'
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
              'merger',
              'info',
            ].includes(tool.name) ? (
              <span title={t(tool.name)}>
                {icons[tool.name] ? (
                  <div className={`${!isSingleTab ? 'truncate' : 'px-5 sm:px-10'}`}>
                    {icons[tool.name]}
                    <span className="ml-2 hidden sm:inline">{t(tool.name)}</span>
                  </div>
                ) : (
                  <span
                    className={`${!isSingleTab ? 'hidden sm:inline' : 'px-10 sm:px-20'}`}
                  >
                    {t(tool.name)}
                  </span>
                )}
              </span>
            ) : (
              <p className={`${!isSingleTab ? 'truncate' : 'px-10 sm:px-20'} `}>
                {toolNames[tool.config.resource]?.name}
              </p>
            )}
          </Tab>
        ))}
      </TabList>
      <TabPanels>
        {tools?.map((tool, index) => {
          return (
            <TabPanel key={index}>
              <div className="flex h-full flex-col rounded-xl bg-white">
                <Tool
                  config={{
                    mainResource,
                    id,
                    chapter,
                    ...tool.config,
                    wholeChapter: stepConfig.whole_chapter,
                    book,
                    typeProject,
                    config: tool.config,
                  }}
                  toolName={tool.name}
                  resourceTitle={toolNames[tool.config.resource]?.title || ''}
                  isSingleTab={isSingleTab}
                />
              </div>
            </TabPanel>
          )
        })}
      </TabPanels>
    </TabGroup>
  )
}

export default StepPage
