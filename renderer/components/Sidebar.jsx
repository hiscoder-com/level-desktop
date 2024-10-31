import { useEffect, useState } from 'react'

import { useRouter } from 'next/router'

import { useCurrentUser } from '@/lib/UserContext'
import { useTranslation } from '@/next-i18next'

import About from './About'
import LanguageSwitcher from './LanguageSwitcher'
import Modal from './Modal'
import SignOut from './SignOut'

import AboutIcon from 'public/icons/about.svg'
import Account from 'public/icons/account.svg'
import Folder from 'public/icons/folder.svg'
import Localization from 'public/icons/localization.svg'
import Merger from 'public/icons/merger.svg'
import Upload from 'public/icons/upload.svg'

const activeIconClass =
  'stroke-th-text-primary lg:stroke-th-secondary-300 group-hover:stroke-th-text-primary'

export default function Sidebar() {
  const { user } = useCurrentUser()
  const { t } = useTranslation(['projects'])
  const router = useRouter()

  const [isHovered, setIsHovered] = useState(false)
  const [isOpenAbout, setIsOpenAbout] = useState(false)
  const [isNeedAuthorized, setIsNeedAuthorized] = useState(false)

  const handleMouseEnter = () => !isOpenAbout && setIsHovered(true)
  const handleMouseLeave = () => setIsHovered(false)

  useEffect(() => {
    console.log(user, 36)
    setIsNeedAuthorized(JSON.parse(window.electronAPI.getItem('isNeedAutorized')))
  }, [])

  return (
    <div
      className={`fixed left-0 top-16 z-10 h-[calc(100vh-4rem)] w-[52px] bg-th-secondary-10 py-10 transition-all duration-100 ease-in-out hover:w-56 ${
        isOpenAbout ? 'pointer-events-none' : ''
      }`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="flex h-full flex-col justify-between text-sm">
        <div className="flex flex-col">
          {isNeedAuthorized && (
            <div
              className={`flex cursor-pointer items-center ${
                router.pathname === '/account' ? 'bg-th-secondary-200' : ''
              } py-3 hover:bg-th-secondary-200`}
              onClick={() => router.push('/account')}
            >
              <div className="ml-4 rounded-[23rem]">
                <Account className={`ml-0.5 w-4 ${activeIconClass}`} />
              </div>
              <div
                className={`ml-2 ${
                  isHovered && !isOpenAbout
                    ? 'opacity-100'
                    : 'pointer-events-none opacity-0'
                } w-0`}
              >
                <div>
                  <div className="text-2xl font-bold lg:text-base lg:font-medium">
                    {user?.login}
                  </div>
                  <div className="lg:text-xs">{user?.email}</div>
                </div>
              </div>
            </div>
          )}
          <div
            className={`flex cursor-pointer items-center ${
              router.pathname === '/account' ? 'bg-th-secondary-200' : ''
            } py-3 hover:bg-th-secondary-200`}
            onClick={() => router.push('/account')}
          >
            <Folder
              className={`ml-4 ${
                router.pathname === '/account'
                  ? 'text-th-primary-100'
                  : isHovered
                    ? 'text-th-text-primary'
                    : 'text-th-secondary-300'
              }`}
            />
            <div
              className={`ml-2 ${
                isHovered && !isOpenAbout
                  ? 'opacity-100'
                  : 'pointer-events-none opacity-0'
              } w-0`}
            >
              <span>{t('projects:Projects')}</span>
            </div>
          </div>
          <div
            className={`flex cursor-pointer items-center ${
              router.pathname === '/account/project/import' ? 'bg-th-secondary-200' : ''
            } py-3 hover:bg-th-secondary-200`}
            onClick={() => router.push('/account/project/import')}
          >
            <Upload
              className={`ml-4 ${
                router.pathname === '/account/project/import'
                  ? 'text-th-primary-100'
                  : isHovered
                    ? 'text-th-text-primary'
                    : 'text-th-secondary-300'
              }`}
            />
            <div
              className={`ml-2 ${
                isHovered && !isOpenAbout
                  ? 'opacity-100'
                  : 'pointer-events-none opacity-0'
              } w-0`}
            >
              <span>{t('projects:Import')}</span>
            </div>
          </div>
          <div
            className={`flex cursor-pointer items-center ${
              router.pathname === '/account/merger' ? 'bg-th-secondary-200' : ''
            } py-3 hover:bg-th-secondary-200`}
            onClick={() => router.push('/account/merger')}
          >
            <Merger
              className={`ml-4 ${
                router.pathname === '/account/merger'
                  ? 'text-th-primary-100'
                  : isHovered
                    ? 'text-th-text-primary'
                    : 'text-th-secondary-300'
              }`}
            />
            <div
              className={`ml-2 ${
                isHovered && !isOpenAbout
                  ? 'opacity-100'
                  : 'pointer-events-none opacity-0'
              } w-0`}
            >
              <span>{t('projects:Merger')}</span>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-6">
          <div className="flex items-center">
            <Localization
              className={`${
                isHovered ? 'text-th-text-primary' : 'text-th-secondary-300'
              } ml-4`}
            />
            <div
              className={`ml-2 ${
                isHovered && !isOpenAbout
                  ? 'opacity-100'
                  : 'pointer-events-none opacity-0'
              } w-0`}
            >
              <div className="flex w-full items-center justify-between gap-12">
                <div>{t('projects:Language')}</div>
                <LanguageSwitcher />
              </div>
            </div>
          </div>
          <div
            className="flex cursor-pointer items-center"
            onClick={() => {
              setIsOpenAbout(true)
              setIsHovered(false)
            }}
          >
            <AboutIcon
              className={`${
                isHovered ? 'fill-th-text-primary' : 'text-th-secondary-300'
              } ml-4`}
            />
            <div
              className={`ml-2 ${
                isHovered && !isOpenAbout
                  ? 'opacity-100'
                  : 'pointer-events-none opacity-0'
              } w-0`}
            >
              <span>{t('projects:About').replace(' ', '\u00A0')}</span>
            </div>
          </div>
          <Modal
            isOpen={isOpenAbout}
            isCloseButton
            closeHandle={() => setIsOpenAbout(false)}
            className={{
              dialogPanel:
                'text-th-text-primary-100 h-[90vh] w-full max-w-[90vw] transform overflow-y-auto rounded-3xl bg-th-secondary-100 align-middle shadow-xl transition-all md:overflow-visible',
            }}
          >
            <About />
          </Modal>

          <SignOut collapsed={!isHovered} />
        </div>
      </div>
    </div>
  )
}
