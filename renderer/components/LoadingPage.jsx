import { Fragment } from 'react'

import { Transition } from '@headlessui/react'
import Progress from 'public/icons/progress.svg'

function LoadingPage({ loadingPage }) {
  return (
    <Transition
      as={Fragment}
      appear={true}
      show={loadingPage}
      enter="transition-opacity duration-200"
      leave="transition-opacity duration-200"
    >
      <div className="absolute inset-0 z-20 flex items-center justify-center overflow-y-hidden backdrop-blur backdrop-brightness-90">
        {loadingPage && (
          <Progress className="progress-custom-colors w-14 animate-spin stroke-th-primary-100" />
        )}
      </div>
    </Transition>
  )
}

export default LoadingPage
