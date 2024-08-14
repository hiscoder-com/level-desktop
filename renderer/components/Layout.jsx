import { useEffect, useState } from 'react'

import { useRouter } from 'next/router'

import { Toaster } from 'react-hot-toast'

import LoadingPage from './LoadingPage'

function Layout({ children }) {
  const [loadingPage, setLoadingPage] = useState(false)
  const router = useRouter()
  const homePath = '/home'

  const getMainClassName = () => {
    if (router.pathname === homePath) {
      return 'mx-auto min-h-screen'
    } else {
      return 'mx-auto h-[calc(100vh-5rem)] mt-20'
    }
  }

  useEffect(() => {
    const handleStart = (url, { shallow }) => {
      if (!shallow) {
        setLoadingPage(true)
      }
    }
    router.events.on('routeChangeStart', handleStart)
    return () => {
      router.events.off('routeChangeStart', setLoadingPage(false))
    }
  }, [router])
  return (
    <>
      <div className={getMainClassName()}>
        <LoadingPage loadingPage={loadingPage} />
        <main>{children}</main>
      </div>

      <Toaster />
    </>
  )
}

export default Layout
