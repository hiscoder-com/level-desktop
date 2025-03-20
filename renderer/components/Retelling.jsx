import { useEffect, useRef, useState } from 'react'

import { useRouter } from 'next/router'

import { checkedVersesBibleState } from '@/helpers/atoms'
import { useTranslation } from '@/next-i18next'
import { useSetRecoilState } from 'recoil'

import Recorder from './Recorder'

import Back from 'public/icons/left.svg'

export default function Retelling({ config }) {
  const { t } = useTranslation()
  const [option, setOption] = useState(null)
  const [isRecordingOriginal, setIsRecordingOriginal] = useState(false)
  const [isRecordingTarget, setIsRecordingTarget] = useState(false)
  const [voiceOriginal, setVoiceOriginal] = useState([])
  const [voiceTarget, setVoiceTarget] = useState([])
  const router = useRouter()
  const setCheckedVersesBible = useSetRecoilState(checkedVersesBibleState)

  useEffect(() => {
    setCheckedVersesBible([])
  }, [setCheckedVersesBible])

  const handleResetCheckedVerses = () => {
    setCheckedVersesBible([])
  }

  useEffect(() => {
    const handleRouteChange = () => {
      handleResetCheckedVerses()
    }

    router.events.on('routeChangeStart', handleRouteChange)

    return () => {
      router.events.off('routeChangeStart', handleRouteChange)
    }
  }, [router])

  const handleOption = (selectedOption) => {
    setOption(selectedOption)
  }

  const resetState = () => {
    handleResetCheckedVerses()
    setOption(null)
    setVoiceOriginal([])
    setVoiceTarget([])
    setIsRecordingOriginal(false)
    setIsRecordingTarget(false)
  }

  return (
    <>
      {!option && (
        <div className="flex h-full flex-col items-center justify-center">
          <button
            className="btn-base bg-th-secondary-300 text-th-text-secondary-100 hover:opacity-70"
            onClick={() => handleOption('partner')}
          >
            {t('PartnerRetelling')}
          </button>
          <p className="py-5">{t('NoPartner')}</p>
          <button
            className="btn-base bg-th-secondary-300 text-th-text-secondary-100 hover:opacity-70"
            onClick={() => handleOption('self')}
          >
            {t('YourselfRetelling')}
          </button>
        </div>
      )}

      {option && (
        <div className="flex min-h-full flex-col gap-4">
          <div className="flex gap-4">
            <button
              className="h-fit w-fit cursor-pointer rounded-full bg-th-secondary-100 p-1 hover:opacity-70"
              onClick={resetState}
            >
              <Back className="w-8 stroke-th-primary-200" />
            </button>
            <p className="self-center text-xl font-bold">
              {option === 'partner' ? t('PartnerRetelling') : t('YourselfRetelling')}
            </p>
          </div>
          {option === 'self' ? (
            <>
              <RecorderSection
                isRecording={isRecordingOriginal}
                voice={voiceOriginal}
                setIsRecording={setIsRecordingOriginal}
                setVoice={setVoiceOriginal}
                label={t('OriginalRecording')}
                config={config}
              />
              <RecorderSection
                isRecording={isRecordingTarget}
                voice={voiceTarget}
                setIsRecording={setIsRecordingTarget}
                setVoice={setVoiceTarget}
                label={t('TargetRecording')}
                config={config}
              />
            </>
          ) : (
            <RetellPartner
              id={config.id}
              chapter={config.chapter}
              typeProject={config.typeProject}
            />
          )}
        </div>
      )}
    </>
  )
}

function RecorderSection({
  isRecording,
  voice,
  setIsRecording,
  setVoice,
  label,
  config,
}) {
  return (
    <div className="w-full px-2 pb-4">
      <p className="mb-4">{label}</p>
      <Recorder
        setIsRecording={setIsRecording}
        voice={voice}
        setVoice={setVoice}
        config={config}
      />
      <div
        className={`border-b-4 px-2 pb-4 ${
          isRecording || voice.length > 0
            ? 'border-th-primary-200'
            : 'border-th-secondary-200'
        } ${isRecording ? 'animate-pulse' : ''}`}
      />
    </div>
  )
}

function RetellPartner({ id, chapter, typeProject }) {
  const { t } = useTranslation()
  const setCheckedVersesBible = useSetRecoilState(checkedVersesBibleState)
  const [inactive, setInactive] = useState(false)

  const savedVersesRef = useRef([])
  const handleResetCheckedVerses = () => {
    setCheckedVersesBible([])
    setInactive(false)
  }

  useEffect(() => {
    if (window.electronAPI) {
      const savedVerses = Object.entries(
        window.electronAPI.getChapter(id, chapter, typeProject)
      )
        .map(([k, v]) => ({ num: k, verse: v.text, enabled: v.enabled }))
        .filter((v) => v.enabled)

      savedVersesRef.current = savedVerses.map((el) => el.num.toString())
    }
  }, [id, chapter, typeProject])

  const handleSetCheckedVerses = () => {
    setCheckedVersesBible(savedVersesRef.current)
    setInactive(true)
  }

  return (
    <div className="my-auto w-full px-2 pb-4">
      <div className="relative flex min-h-full flex-col items-center justify-center gap-5">
        {inactive ? (
          <button
            className="btn-base mr-2 bg-th-secondary-300 text-th-text-secondary-100 hover:opacity-70"
            onClick={handleResetCheckedVerses}
          >
            {t('FinishRetelling')}
          </button>
        ) : (
          <>
            <p>{t('StartRetelling')}</p>
            <div className="flex">
              <button
                className="btn-base mr-2 bg-th-secondary-300 text-th-text-secondary-100 hover:opacity-70"
                onClick={handleSetCheckedVerses}
              >
                {t('InOriginalLanguage')}
              </button>
              <button
                className="btn-base bg-th-secondary-300 text-th-text-secondary-100 hover:opacity-70"
                onClick={handleSetCheckedVerses}
              >
                {t('InTargetLanguage')}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
