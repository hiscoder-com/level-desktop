import { useEffect, useState } from 'react'

import { useRouter } from 'next/router'

import { inactiveState } from '@/helpers/atoms'
import { useTranslation } from '@/next-i18next'
import Back from 'public/icons/left.svg'
import { useRecoilState, useSetRecoilState } from 'recoil'

import Recorder from './Recorder'

export default function Retelling() {
  const { t } = useTranslation()
  const [option, setOption] = useState(null)
  const [isRecordingOriginal, setIsRecordingOriginal] = useState(false)
  const [isRecordingTarget, setIsRecordingTarget] = useState(false)
  const [voiceOriginal, setVoiceOriginal] = useState([])
  const [voiceTarget, setVoiceTarget] = useState([])
  const setInactive = useSetRecoilState(inactiveState)
  const router = useRouter()

  useEffect(() => {
    const handleRouteChange = () => {
      setInactive(false)
    }

    router.events.on('routeChangeStart', handleRouteChange)

    return () => {
      router.events.off('routeChangeStart', handleRouteChange)
    }
  }, [router, setInactive])

  const handleOption = (selectedOption) => {
    setOption(selectedOption)
  }

  const resetState = () => {
    setInactive(false)
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
              />
              <RecorderSection
                isRecording={isRecordingTarget}
                voice={voiceTarget}
                setIsRecording={setIsRecordingTarget}
                setVoice={setVoiceTarget}
                label={t('TargetRecording')}
              />
            </>
          ) : (
            <RetellPartner />
          )}
        </div>
      )}
    </>
  )
}

function RecorderSection({ isRecording, voice, setIsRecording, setVoice, label }) {
  return (
    <div className="w-full px-2 pb-4">
      <p className="mb-4">{label}</p>
      <Recorder setIsRecording={setIsRecording} voice={voice} setVoice={setVoice} />
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

function RetellPartner() {
  const [inactive, setInactive] = useRecoilState(inactiveState)
  const { t } = useTranslation()

  return (
    <div className="my-auto w-full px-2 pb-4">
      <div className="relative flex min-h-full flex-col items-center justify-center gap-5">
        {inactive ? (
          <button
            className="btn-base mr-2 bg-th-secondary-300 text-th-text-secondary-100 hover:opacity-70"
            onClick={() => setInactive(false)}
          >
            {t('FinishRetelling')}
          </button>
        ) : (
          <>
            <p>{t('StartRetelling')}</p>
            <div className="flex">
              <button
                className="btn-base mr-2 bg-th-secondary-300 text-th-text-secondary-100 hover:opacity-70"
                onClick={() => setInactive(true)}
              >
                {t('InOriginalLanguage')}
              </button>
              <button
                className="btn-base bg-th-secondary-300 text-th-text-secondary-100 hover:opacity-70"
                onClick={() => setInactive(true)}
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
