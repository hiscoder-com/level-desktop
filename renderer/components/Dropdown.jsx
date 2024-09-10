import { useEffect, useRef, useState } from 'react'

import { useTranslation } from '@/next-i18next'
import Tools from 'public/icons/tools.svg'

import Modal from './Modal'

function Dropdown({ description }) {
  const [showModalStepGoal, setShowModalStepGoal] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const dropdownMenu = useRef(null)
  const toolsButton = useRef(null)
  const { t } = useTranslation()
  const toggle = () => setIsOpen((prev) => !prev)
  const closeModal = () => {
    setShowModalStepGoal(false)
  }
  useEffect(() => {
    const onClick = (e) => {
      if (
        isOpen &&
        !toolsButton?.current?.contains(e.target) &&
        !dropdownMenu?.current?.contains(e.target)
      ) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener('click', onClick)
    }
    return () => document.removeEventListener('click', onClick)
  }, [isOpen])

  return (
    <div>
      <div
        className="relative hidden cursor-pointer whitespace-nowrap rounded-md px-3 py-4 md:flex"
        onClick={toggle}
        ref={toolsButton}
      >
        <Tools className="fill-th-text-secondary-100" />
      </div>

      {isOpen && (
        <>
          <div
            ref={dropdownMenu}
            className="border-th-primary-100-border absolute right-5 z-40 flex flex-col justify-center divide-y divide-solid rounded-md border bg-th-secondary-10 shadow-md xl:right-0"
          >
            <button
              className="rounded-t-lg px-4 py-2 hover:bg-th-secondary-100 active:bg-th-secondary-100"
              onClick={(e) => {
                toggle()
                setShowModalStepGoal(true)
                e.stopPropagation()
              }}
            >
              {t('AboutStep').toUpperCase()}
            </button>
          </div>
        </>
      )}
      <StepGoal
        showModalStepGoal={showModalStepGoal}
        closeModal={closeModal}
        description={description}
      />
      <div className="flex items-center divide-x divide-solid whitespace-nowrap rounded-md bg-th-secondary-10 py-1 text-xs font-bold md:hidden">
        <button
          className="rounded-l-lg px-2 hover:opacity-70"
          onClick={(e) => {
            setShowModalStepGoal(true)
            e.stopPropagation()
          }}
        >
          {t('AboutStep').toUpperCase()}
        </button>
      </div>
    </div>
  )
}

export default Dropdown

function StepGoal({ showModalStepGoal, closeModal, description }) {
  const { t } = useTranslation(['common'])
  return (
    <Modal isOpen={showModalStepGoal} closeHandle={closeModal} title={t('Goal')}>
      <div className="my-6 max-h-[50vh] overflow-y-auto px-4 py-3">
        <p className="whitespace-pre-line text-sm text-th-secondary-10">
          {description.replaceAll('\n\n', '\n')}
        </p>
      </div>
      <div className="text-center">
        <button className="btn-secondary" onClick={closeModal}>
          {t('Close')}
        </button>
      </div>
    </Modal>
  )
}
