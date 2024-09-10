import { useEffect, useMemo, useState } from 'react'

import { useRouter } from 'next/router'

import { Toaster } from 'react-hot-toast'

import AppBar from './AppBar'
import LoadingPage from './LoadingPage'
import Sidebar from './Sidebar'

function Layout({ children }) {
  const [loadingPage, setLoadingPage] = useState(false)
  const router = useRouter()
  const homePath = '/home'

  const getMainClassName = () => {
    if (router.pathname === homePath) {
      return 'mx-auto min-h-screen'
    } else {
      return 'mx-auto h-[calc(100vh-5rem)] mt-16'
    }
  }

  const isShowSidebar = useMemo(() => {
    return (
      router &&
      router.pathname !== homePath &&
      !router.pathname.includes('chapter') &&
      router.pathname.includes('account')
    )
  }, [router])
  const isStep = useMemo(() => {
    return (
      router &&
      router.pathname !== homePath &&
      router.pathname.includes('chapter') &&
      !router.pathname.includes('intro')
    )
  }, [router])
  const isShowAppBar = useMemo(() => {
    return router && router.pathname.includes('account')
  }, [router])

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
        <main>
          {router.pathname !== homePath && (
            <AppBar isStep={isStep} isShowAppBar={isShowAppBar} />
          )}
          {isShowSidebar && <Sidebar />}
          {children}
        </main>
      </div>

      <Toaster />
    </>
  )
}

export default Layout
