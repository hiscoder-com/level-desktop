import { useState } from 'react'
import { useTranslation } from '@/next-i18next'
import { useRouter } from 'next/router'
import LanguageSwitcher from './LanguageSwitcher'
import Modal from './Modal'
import About from './About'
import Folder from 'public/icons/folder.svg'
import Merger from 'public/icons/merger.svg'
import Upload from 'public/icons/upload.svg'
import AboutIcon from 'public/icons/about.svg'
import Localization from 'public/icons/localization.svg'
export default function Sidebar() {
  const { t } = useTranslation(['projects'])
  const router = useRouter()

  const [isHovered, setIsHovered] = useState(false)
  const [isOpenAbout, setIsOpenAbout] = useState(false)

  const handleMouseEnter = () => !isOpenAbout && setIsHovered(true)
  const handleMouseLeave = () => setIsHovered(false)

  return (
    <div
      className={`fixed top-16 left-0 bg-th-secondary-10 h-[calc(100vh-4rem)] w-[52px] hover:w-56 transition-all duration-100 ease-in-out py-10 ${
        isOpenAbout ? 'pointer-events-none' : ''
      }`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="flex flex-col justify-between h-full text-sm">
        <div className="flex flex-col">
          <div
            className={`flex items-center cursor-pointer ${
              router.pathname === '/account' ? 'bg-th-secondary-200' : ''
            } hover:bg-th-secondary-200 py-3`}
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
                  : 'opacity-0 pointer-events-none'
              } w-0`}
            >
              <span>{t('projects:Projects')}</span>
            </div>
          </div>
          <div
            className={`flex items-center cursor-pointer ${
              router.pathname === '/account/project/import' ? 'bg-th-secondary-200' : ''
            } hover:bg-th-secondary-200 py-3`}
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
                  : 'opacity-0 pointer-events-none'
              } w-0`}
            >
              <span>{t('projects:Import')}</span>
            </div>
          </div>
          <div
            className={`flex items-center cursor-pointer ${
              router.pathname === '/account/merger' ? 'bg-th-secondary-200' : ''
            } hover:bg-th-secondary-200 py-3`}
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
                  : 'opacity-0 pointer-events-none'
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
                  : 'opacity-0 pointer-events-none'
              } w-0`}
            >
              <div className="flex gap-12 justify-between items-center w-full">
                <div>{t('projects:Language')}</div>
                <LanguageSwitcher />
              </div>
            </div>
          </div>
          <div
            className="flex items-center cursor-pointer"
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
                  : 'opacity-0 pointer-events-none'
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
                'w-full max-w-[90vw] h-[90vh] align-middle transform  shadow-xl transition-all bg-th-secondary-100 text-th-text-primary-100 rounded-3xl overflow-y-auto md:overflow-visible ',
            }}
          >
            <About />
          </Modal>
        </div>
      </div>
    </div>
  )
}
