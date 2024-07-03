import { useEffect } from 'react'

import { RecoilRoot } from 'recoil'

import Layout from '@/components/Layout'

import '@/styles/globals.css'

function MyApp({ Component, pageProps }) {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme') || 'default'
      document.documentElement.className = savedTheme
    }
  }, [])
  return (
    <>
      <RecoilRoot>
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </RecoilRoot>
    </>
  )
}

export default MyApp
