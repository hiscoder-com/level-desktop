import { useEffect, useState } from 'react'

import Link from 'next/link'
import { useRouter } from 'next/router'

import { useTranslation } from '@/next-i18next'
import { JsonToPdf } from '@texttree/obs-format-convert-rcl'

import Left from 'public/icons/left.svg'
import TechSteps from 'public/icons/techsteps.svg'

const styles = {
  currentPage: {
    fontSize: 16,
    alignment: 'center',
    bold: true,
    margin: [0, 10, 0, 0],
  },
  chapterTitle: { fontSize: 20, bold: true, margin: [0, 26, 0, 15] },
  verseNumber: { sup: true, bold: true, opacity: 0.8, margin: [0, 8, 8, 0] },
  defaultPageHeader: { bold: true, width: '50%' },
  text: { alignment: 'justify' },
}

function ChapterList({ id, chapters, steps, mutate, book, project }) {
  const { t } = useTranslation(['projects', 'common', 'books'])
  const [versesCount, setVersesCount] = useState(null)
  const router = useRouter()
  const [showIntro, setShowIntro] = useState(true)
  useEffect(() => {
    const config = window.electronAPI.getProject(id)
    setShowIntro(config.showIntro)
  }, [id])

  useEffect(() => {
    const chapters = window.electronAPI.getBook(id)
    const _chapters = {}
    for (const key in chapters) {
      if (Object.hasOwnProperty.call(chapters, key)) {
        const element = chapters[key]
        _chapters[key] = Object.keys(element).length
      }
    }
    setVersesCount(_chapters)
  }, [])

  const handleBackStep = (chapter, step) => {
    const backStep = window.electronAPI.goToStep(id, chapter, step - 1)
    if (backStep !== step) {
      mutate()
    }
  }
  const handleDownloadChapter = (chapter) => {
    const savedVerses = Object.entries(window.electronAPI.getChapter(id, chapter)).map(
      ([k, v]) => ({ verse: k, text: v.text, enabled: v.enabled })
    )

    const project = window.electronAPI.getProject(id)
    const currentDate = new Date().toISOString().split('T')[0]
    const fileName = `${project.project.code}_${project.book.name}_c_${chapter}_${currentDate}`

    JsonToPdf({
      data: [{ title: 'Chapter ' + chapter, verseObjects: savedVerses }],
      styles,
      fileName,
      showImages: false,
      showChapterTitlePage: false,
      showVerseNumber: true,
      showPageFooters: false,
    })
      .then(() => console.log('PDF creation completed'))
      .catch((error) => console.error('PDF creation failed:', error))
  }
  const getIsRepeatIntro = (step, chapter, id, localStorageSteps) => {
    if (!localStorageSteps) return false
    const idIntro = `${id}_${chapter}_${step}`
    return localStorageSteps?.includes(idIntro)
  }

  const goToStep = ({ chapter, step }) => {
    const localStorageSteps = JSON.parse(window.electronAPI.getItem('viewedIntroSteps'))
    const isRepeatIntro = getIsRepeatIntro(step, chapter, id, localStorageSteps)

    router.push(
      `/account/project/${id}/${chapter}/${showIntro && !isRepeatIntro ? `intro?step=${step}` : step}`
    )
  }
  return (
    <div className="overflow-x-auto">
      <div className="h-7 rounded-t-lg bg-th-primary-100"></div>
      <div className="flex h-16 items-center border-b border-th-secondary-200 bg-th-secondary-10 text-lg">
        <Link className="flex items-center pl-8" href="/account">
          <Left className="w-6 stroke-th-secondary-300" />
          <span className="ml-2.5 text-sm text-th-secondary-300">
            {t('common:Projects')}
          </span>
        </Link>
        <span className="ml-6 inline text-lg font-bold">{t('books:' + book.code)}</span>
      </div>

      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="text-th-primary cursor-default border-b border-th-secondary-200 bg-th-secondary-10 text-left font-bold">
            <th className="w-2/12 min-w-28 py-4 pl-8 font-medium">
              {t('projects:Chapter')}
            </th>
            <th className="w-1/12 min-w-28 py-4 pl-8 font-medium">
              {t('projects:Verses')}
            </th>
            <th className="w-4/12 min-w-32 py-4 pl-8 font-medium">
              {t('projects:Step')}
            </th>
            <th className="w-4/12 min-w-28 py-4 pl-8 font-medium">
              {t('projects:Navigation')}
            </th>
            <th className="w-2/12 min-w-20 px-8 py-4 font-medium">
              <div>{t('common:Download')}</div>
            </th>
          </tr>
        </thead>
        <tbody className="bg-th-secondary-10">
          {chapters.map(([chapter, step]) => (
            <tr
              key={chapter}
              className="border-b border-th-secondary-200 text-th-primary-100 hover:bg-th-secondary-20"
              onClick={() => goToStep({ chapter, step })}
            >
              <td className="w-2/12 cursor-pointer py-4 pl-8">
                <span className="break-words rounded bg-th-secondary-100 px-3 py-2">
                  {t('projects:Chapter')} {chapter}
                </span>
              </td>
              <td className="w-1/12 cursor-pointer break-words py-4 pl-8">
                <span className="rounded bg-th-secondary-100 px-3 py-2">
                  {versesCount?.[chapter]}
                </span>
              </td>
              <td className="w-4/12 cursor-pointer break-words py-4 pl-8">
                <span className="rounded bg-th-secondary-100 px-3 py-2">
                  {steps[step].title}
                </span>
              </td>
              <td className="w-4/12 cursor-pointer py-4 pl-8">
                <StepNavigator
                  currentStep={step}
                  handleBackStep={handleBackStep}
                  totalSteps={project.steps.length}
                  chapter={chapter}
                  isTech={steps[step].isTech}
                  stepsInfo={steps}
                />
              </td>
              <td className="w-2/12 px-8 py-4">
                <div className="flex cursor-pointer justify-end">
                  <button
                    className="rounded-md bg-th-primary-100 p-1 text-th-secondary-10 hover:opacity-70"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDownloadChapter(chapter)
                    }}
                  >
                    PDF
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default ChapterList

const StepNavigator = ({
  totalSteps,
  currentStep,
  handleBackStep,
  chapter,
  stepsInfo,
}) => {
  const isTechSteps = stepsInfo.map((s) => s.isTech)
  const getStepNumbers = () => {
    const filteredSteps = stepsInfo.map((s, index) => ({
      isTech: s.isTech,
      originalIndex: index,
      stepNumber: s.isTech
        ? 'T'
        : index - isTechSteps.slice(0, index).filter(Boolean).length + 1,
    }))
    if (currentStep === 0) return filteredSteps.slice(0, 3)
    if (currentStep === totalSteps - 1) {
      return filteredSteps.slice(totalSteps - 3, totalSteps)
    }
    if (currentStep > 0 && currentStep < totalSteps - 1) {
      return filteredSteps.slice(currentStep - 1, currentStep + 2)
    }
    return filteredSteps.slice(currentStep - 1, currentStep + 2)
  }

  const steps = getStepNumbers()
  return (
    <div className="flex items-center gap-2.5">
      <button
        className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-full border-none bg-th-primary-100 text-th-secondary-10 disabled:cursor-auto disabled:bg-th-secondary-200"
        disabled={currentStep === 0}
        onClick={(e) => {
          e.stopPropagation()
          handleBackStep(chapter, currentStep)
        }}
      >
        <Left className="h-5 w-5" />
      </button>

      {steps.map((step, index) => (
        <div
          key={index}
          className={`rounded-full ${step.isTech ? 'p-1' : ''} ${
            step.originalIndex === currentStep
              ? `${
                  step.isTech ? 'p-1.5' : ''
                } bg-th-primary-100 text-lg font-bold text-th-secondary-10`
              : 'border border-th-secondary-100 text-sm'
          }`}
        >
          {step.isTech ? (
            <TechSteps
              className={`${step.originalIndex === currentStep ? 'h-5 w-5' : 'h-4 w-4'}`}
            />
          ) : (
            <div
              className={`rounded-full bg-th-primary-100 ${
                step.originalIndex === currentStep
                  ? 'h-8 w-8'
                  : 'h-6 w-6 bg-th-secondary-10'
              } flex items-center justify-center font-bold`}
            >
              {step.stepNumber}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
