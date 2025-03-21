import { useState } from 'react'

import { useRouter } from 'next/router'

import { useTranslation } from '@/next-i18next'
import toast from 'react-hot-toast'
import useSupabaseClient from 'utils/supabaseClient'

import LogOut from 'public/icons/logout.svg'

export default function SignOut({ collapsed }) {
  const supabaseClient = useSupabaseClient()
  const [loading, setLoading] = useState(false)
  const { t } = useTranslation(['users'])
  const router = useRouter()

  const handleLogout = async () => {
    const isNeedAutorized = window.electronAPI.getItem('isNeedAutorized')
    try {
      setLoading(true)
      if (isNeedAutorized) {
        const { error } = await supabaseClient.auth.signOut()
        if (error) throw error
      }
    } catch (error) {
      toast.error(error.error_description || error.message)
    } finally {
      setLoading(false)
      router.push('/home')
    }
  }

  return (
    <button
      disabled={loading}
      onClick={handleLogout}
      className={`text-th-text-primary-100 flex w-full cursor-pointer items-center gap-2 px-4 py-3 ${
        loading ? 'opacity-70' : ''
      }`}
    >
      <LogOut
        className={`w-5 group-hover:stroke-th-text-primary group-hover:opacity-70 ${
          collapsed ? 'stroke-th-secondary-300' : 'stroke-th-text-primary'
        }`}
      />

      <p
        className={`lg:text-th-text-primary-100 opacity-70 ${
          collapsed ? 'lg:hidden' : ''
        } group-hover:text-th-text-primary group-hover:opacity-70`}
      >
        {t('users:SignOut')}
      </p>
    </button>
  )
}
