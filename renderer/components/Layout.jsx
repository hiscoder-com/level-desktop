import { useEffect, useMemo, useState } from 'react'

import { useRouter } from 'next/router'

import { Toaster } from 'react-hot-toast'

import LoadingPage from './LoadingPage'
import Sidebar from './Sidebar'
import AppBar from './AppBar'

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
    return router && router.pathname !== homePath && !router.pathname.includes('chapter')
  }, [router])
  console.log({ isShowSidebar, router })
  const isStep = useMemo(() => {
    return (
      router &&
      router.pathname !== homePath &&
      router.pathname.includes('chapter') &&
      !router.pathname.includes('intro')
    )
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
          {router.pathname !== homePath && <AppBar isStep={isStep} />}
          {isShowSidebar && <Sidebar />}
          {children}
        </main>
      </div>

      <Toaster />
    </>
  )
}

export default Layout
