import { useRef, useState } from 'react'

import { useRouter } from 'next/router'

import { useTranslation } from '@/next-i18next'
import useSupabaseClient from 'utils/supabaseClient'

import ButtonLoading from './ButtonLoading'
import InputField from './UI/InputField'

export default function Login({ onClose }) {
  const router = useRouter()
  const supabase = useSupabaseClient()
  const { t } = useTranslation(['users'])

  const [login, setLogin] = useState('')
  const [password, setPassword] = useState('')
  const [isLoadingLogin, setIsLoadingLogin] = useState(false)
  const [isError, setIsError] = useState(false)

  const loginRef = useRef(null)
  const passwordRef = useRef(null)

  const handleLogin = async (e) => {
    e.preventDefault()
    setIsLoadingLogin(true)
    try {
      const { error } = await supabase.auth.signInWithPassword({ email: login, password })
      if (error) throw error
      setIsError(false)
      router.push('/account')
    } catch (error) {
      console.error(error)
      setIsError(true)
    } finally {
      setIsLoadingLogin(false)
    }
  }

  return (
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
        onClick={onClose}
        className="text-primary mt-2 text-center text-sm underline"
      >
        Вернуться к выбору входа
      </button>
    </form>
  )
}
