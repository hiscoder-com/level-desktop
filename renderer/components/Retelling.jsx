import { useEffect, useState } from 'react'

import { useRouter } from 'next/router'

import { useTranslation } from 'react-i18next'
import { useSetRecoilState } from 'recoil'

import { inactiveState } from '../helpers/atoms'
import Recorder from './Recorder'

import Back from '../public/icons/left.svg'

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
    setOption(null)
    setVoiceOriginal([])
    setVoiceTarget([])
    setIsRecordingOriginal(false)
    setIsRecordingTarget(false)
  }

  return (
    <>
      {!option && (
        <div className="flex flex-col justify-center items-center h-full">
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
        <div className="flex flex-wrap gap-4">
          <button
            className="w-fit h-fit p-1 cursor-pointer hover:opacity-70 rounded-full bg-th-secondary-100"
            onClick={resetState}
          >
            <Back className="w-8 stroke-th-primary-200" />
          </button>
          <p className="self-center font-bold text-xl">
            {option === 'partner' ? t('PartnerRetelling') : t('YourselfRetelling')}
          </p>
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
        </div>
      )}
    </>
  )
}

function RecorderSection({ isRecording, voice, setIsRecording, setVoice, label }) {
  return (
    <div className="w-full pb-4 px-2">
      <p className="mb-4">{label}</p>
      <Recorder setIsRecording={setIsRecording} voice={voice} setVoice={setVoice} />
      <div
        className={`pb-4 px-2 border-b-4 ${
          isRecording || voice.length > 0
            ? 'border-th-primary-200'
            : 'border-th-secondary-200'
        } ${isRecording ? 'animate-pulse' : ''}`}
      />
    </div>
  )
}
