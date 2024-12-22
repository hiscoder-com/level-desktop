import { useEffect } from 'react'

import Layout from '@/components/Layout'
import { RecoilRoot } from 'recoil'

import '@/styles/globals.css'

import useSupabaseClient from '@/utils/supabaseClient'
import { UserContextProvider } from '@/lib/UserContext'

function MyApp({ Component, pageProps }) {
  const supabaseClient = useSupabaseClient()

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme') || 'default'
      document.documentElement.className = savedTheme
    }
  }, [])
  return (
    <>
      <UserContextProvider supabaseClient={supabaseClient}>
        <RecoilRoot>
          <Layout>
            <Component {...pageProps} />
          </Layout>
        </RecoilRoot>
      </UserContextProvider>
    </>
  )
}

export default MyApp
