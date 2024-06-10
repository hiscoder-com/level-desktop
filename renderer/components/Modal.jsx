import { Fragment } from 'react'

import { Transition, Dialog } from '@headlessui/react'

function Modal({
  title,
  isOpen,
  children,
  closeHandle,
  buttons,
  className: propsClassNames = {},
  handleCloseDisabled = false,
}) {
  const classNames = {
    ...{
      main: 'z-50 relative',
      dialogTitle: 'text-2xl font-medium leading-6 p-6',
      dialogPanel:
        'w-full max-w-md align-middle transform overflow-hidden shadow-xl transition-all bg-th-primary-100 text-th-text-secondary-100 rounded-3xl',
      transitionChild: 'fixed inset-0 bg-opacity-25 backdrop-brightness-90',
      content:
        'inset-0 fixed flex items-center justify-center min-h-full overflow-y-auto',
      contentBody: '',
      buttonsContainer: 'p-6 flex justify-center',
    },
    ...propsClassNames,
  }

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog
        as="div"
        className={classNames.main}
        onClose={() => !handleCloseDisabled && closeHandle()}
      >
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-100"
          leave="ease-in duration-100"
          leaveFrom="opacity-100"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leaveTo="opacity-0"
        >
          <div className={classNames.transitionChild} />
        </Transition.Child>
        <div className={classNames.backdrop}>
          <div className={classNames.content}>
            <Transition.Child
              as={Fragment}
              leaveFrom="opacity-100 scale-100"
              enterFrom="opacity-100 scale-95"
              enterTo="opacity-100 scale-100"
              enter="ease-out duration-100"
              leaveTo="opacity-0 scale-95"
              leave="ease-in duration-100"
            >
              <Dialog.Panel className={classNames.dialogPanel}>
                <Dialog.Title as="h3" className={classNames.dialogTitle}>
                  {title}
                </Dialog.Title>
                <div className={classNames.contentBody}>{children}</div>
                <div className={classNames.buttonsContainer}>{buttons}</div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}
export default Modal
