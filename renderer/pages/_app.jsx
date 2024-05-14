import React, { useEffect } from 'react'

import '../styles/globals.css'
// import NotifyBox from '../components/NotifyBox';
import { RecoilRoot } from 'recoil'
import Layout from '../components/Layout'

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
        {/* <NotifyBox /> */}
      </RecoilRoot>
    </>
  )
}

export default MyApp
