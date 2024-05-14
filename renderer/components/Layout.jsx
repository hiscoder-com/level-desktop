import { Fragment, useEffect, useState } from 'react'

import { useRouter } from 'next/router'

import { Transition } from '@headlessui/react'

import Progress from '../public/icons/progress.svg'

function Layout({ children }) {
  const [loadingPage, setLoadingPage] = useState(false)
  const router = useRouter()
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
      <div className="mx-auto min-h-screen">
        <Transition
          as={Fragment}
          appear={true}
          show={loadingPage}
          enter="transition-opacity duration-200"
          leave="transition-opacity duration-200"
        >
          <div className="absolute flex justify-center items-center inset-0 backdrop-brightness-90 backdrop-blur z-20 overflow-y-hidden">
            {loadingPage && (
              <Progress className="progress-custom-colors w-14 animate-spin stroke-th-primary-100" />
            )}
          </div>
        </Transition>
        <main>{children}</main>
      </div>
    </>
  )
}

export default Layout
