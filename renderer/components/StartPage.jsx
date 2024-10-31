import { useEffect, useRef, useState } from 'react'

import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/router'

import { useCurrentUser } from '@/lib/UserContext'
import { useTranslation } from '@/next-i18next'
import useSupabaseClient from 'utils/supabaseClient'

import ButtonLoading from './ButtonLoading'
import LanguageSwitcher from './LanguageSwitcher'
import InputField from './UI/InputField'

import LevelLogo from 'public/icons/level-logo-color.svg'

export default function StartPage() {
  const router = useRouter()
  const supabase = useSupabaseClient()
  const { t } = useTranslation(['projects', 'users'])

  const [isLoadingLogin, setIsLoadingLogin] = useState(false)
  const [login, setLogin] = useState('admin@mail.com')
  const [password, setPassword] = useState('123456')
  const [isLoginFormVisible, setIsLoginFormVisible] = useState(false)
  const [isError, setIsError] = useState(false)

  const passwordRef = useRef(null)
  const loginRef = useRef(null)

  useEffect(() => {
    window.electronAPI.setItem('isNeedAutorized', false)
  }, [])

  const handleLogin = async (e) => {
    e.preventDefault()
    setIsLoadingLogin(true)
    try {
      const { error } = await supabase.auth.signInWithPassword({ email: login, password })
      if (error) throw error
      setIsError(false)

      router.push('/account')
    } catch (error) {
      console.log(error)
      setIsError(true)
    } finally {
      setIsLoadingLogin(false)
    }
  }

  useEffect(() => {
    if (loginRef?.current) {
      loginRef.current.focus()
    }
  }, [isLoginFormVisible])

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

    setIsLoadingLogin(false)
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
                  {t('users:SignIn')} без регистрации
                </p>
              </div>

              <div
                className="rounded-3xl bg-th-primary-100"
                onClick={() => isAuthorization()}
              >
                <p className="green-two-layers cursor-pointer rounded-3xl px-7 py-8 text-xl text-th-secondary-10 after:rounded-3xl">
                  {t('users:SignIn')} по регистрации
                </p>
              </div>
            </>
          )}

          {isLoginFormVisible && (
            <form className="mt-4 flex flex-col gap-4 rounded-lg bg-white p-4 shadow-md">
              <InputField
                refInput={loginRef}
                type="text"
                name="floating_email"
                id="floating_email"
                value={login}
                isError={isError && !login}
                label={t('Login')}
                onChange={(event) => setLogin(event.target.value)}
                className="input-base-label"
              />
              <InputField
                refInput={passwordRef}
                type="password"
                name="floating_password"
                id="floating_password"
                value={password}
                isError={isError && !password}
                label={t('Password')}
                onChange={(event) => setPassword(event.target.value)}
                className="input-password"
              />
              <ButtonLoading
                onClick={handleLogin}
                isLoading={isLoadingLogin}
                className="btn-primary"
              >
                {t('users:SignIn')}
              </ButtonLoading>
              <button
                type="button"
                onClick={() => setIsLoginFormVisible(false)}
                className="text-primary mt-2 text-center text-sm underline"
              >
                Вернуться к выбору входа
              </button>
            </form>
          )}
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
