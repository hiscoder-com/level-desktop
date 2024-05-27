import { useEffect } from 'react'

import { useRouter } from 'next/router'

import { useTranslation } from '@/next-i18next'
import { useSetRecoilState } from 'recoil'

import { inactiveState } from '../helpers/atoms'
import Recorder from './Recorder'

export default function Retelling() {
  const { t } = useTranslation()
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

  return (
    <>
      <div className="flex justify-center flex-wrap mt-8">
        <div className="w-full pb-4 px-2 mb-4 border-b-4">
          <p className="mb-4">{t('OriginalRecording')}</p>
          <Recorder />
        </div>
        <div className="w-full pb-4 px-2 mb-4 border-b-4">
          <p className="mb-4">{t('TargetRecording')}</p>
          <Recorder />
        </div>
      </div>
    </>
  )
}
