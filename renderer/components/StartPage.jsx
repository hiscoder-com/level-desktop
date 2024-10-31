import { useEffect, useState } from 'react'

import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/router'

import { useTranslation } from '@/next-i18next'
import useSupabaseClient from 'utils/supabaseClient'

import LanguageSwitcher from './LanguageSwitcher'
import Login from './Login'

import LevelLogo from 'public/icons/level-logo-color.svg'

export default function StartPage() {
  const router = useRouter()
  const supabase = useSupabaseClient()
  const { t } = useTranslation(['projects', 'users'])

  const [isLoginFormVisible, setIsLoginFormVisible] = useState(false)

  useEffect(() => {
    window.electronAPI.setItem('isNeedAutorized', false)
  }, [])

  const checkAgreements = () => {
    const agreements = window.electronAPI.getItem('agreements')
    if (!agreements) {
      return router.push(`/agreements`)
    }
    const agreementsObj = JSON.parse(agreements)
    const allAgreed = agreementsObj.userAgreement && agreementsObj.confession

    router.push(allAgreed ? `/account` : `/agreements`)
  }

  const isAuthorization = () => {
    window.electronAPI.setItem('isNeedAutorized', true)
    setIsLoginFormVisible(true)
  }

  return (
    <div className="absolute flex h-screen">
      <div className="flex w-3/5 items-center justify-center bg-th-primary-100">
        <Image
          src="/icons/start-page.svg"
          alt="Level Logo"
          width={500}
          height={500}
          className="w-5/6"
        />
      </div>

      <div className="relative flex w-2/5 items-center justify-center">
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center justify-center rounded-3xl bg-th-secondary-10 p-6">
            <LevelLogo className="w-[16rem]" />
          </div>
          <div className="z-10 flex flex-grow items-center justify-between rounded-3xl bg-th-secondary-10 px-7 py-4">
            <p className="text-xl">{t('projects:Language')}</p>
            <LanguageSwitcher />
          </div>

          {!isLoginFormVisible && (
            <>
              <div className="rounded-3xl bg-th-primary-100" onClick={checkAgreements}>
                <p className="green-two-layers cursor-pointer rounded-3xl px-7 py-8 text-xl text-th-secondary-10 after:rounded-3xl">
                  {t('users:SignIn')}
                  {t('users:WithoutRegistration')}
                </p>
              </div>

              <div className="rounded-3xl bg-th-primary-100" onClick={isAuthorization}>
                <p className="green-two-layers cursor-pointer rounded-3xl px-7 py-8 text-xl text-th-secondary-10 after:rounded-3xl">
                  {t('users:SignIn')}
                  {t('users:ByRegistration')}
                </p>
              </div>
            </>
          )}

          {isLoginFormVisible && <Login onClose={() => setIsLoginFormVisible(false)} />}
        </div>

        <Link
          href="https://level.bible"
          className="absolute bottom-10 left-1/2 -translate-x-1/2 text-sm uppercase text-th-primary-100"
          target="_blank"
        >
          level.bible
        </Link>
      </div>
    </div>
  )
}
