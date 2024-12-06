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
      const { data, error } = await supabase.auth.signInWithPassword({
        email: login,
        password,
      })

      if (error) throw error

      setIsError(false)

      try {
        const response = await window.electron.initCurrentUser(
          data.user.id,
          data.user.email
        )

        if (response?.success) {
          router.push('/account')
        } else {
          console.error('Error when adding a user:', response?.error || 'Unknown error')
        }
      } catch (initError) {
        console.error('Error initializing the current user:', initError)
      }
    } catch (authError) {
      console.error('Authorization error:', authError)
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
        {t('users:ReturnToLogin')}
      </button>
    </form>
  )
}
