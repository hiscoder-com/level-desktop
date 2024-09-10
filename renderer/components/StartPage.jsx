import { useRouter } from 'next/router'
import Link from 'next/link'

import LanguageSwitcher from './LanguageSwitcher'

import { useTranslation } from '@/next-i18next'

import VcanaLogo from 'public/icons/vcana-logo-color.svg'
import Image from 'next/image'

export default function StartPage() {
  const router = useRouter()

  const { t } = useTranslation(['projects', 'users'])

  const checkAgreements = () => {
    const agreements = window.electronAPI.getItem('agreements')
    if (!agreements) {
      return router.push(`/agreements`)
    }
    const agreementsObj = JSON.parse(agreements)
    const allAgreed = agreementsObj.userAgreement && agreementsObj.confession

    router.push(allAgreed ? `/account` : `/agreements`)
  }
  return (
    <div className="flex h-screen abcolute">
      <div className="flex items-center justify-center w-3/5 bg-th-primary-100">
        <Image
          src="/icons/start-page.svg"
          alt="Vcana Logo"
          width={500}
          height={500}
          className="w-5/6"
        />
      </div>

      <div className="relative w-2/5 flex items-center justify-center">
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center justify-center px-7 py-10 bg-th-secondary-10 rounded-3xl">
            <VcanaLogo className="w-[14.5rem]" />
          </div>
          <div className="flex flex-grow items-center justify-between px-7 py-4 bg-th-secondary-10 rounded-3xl z-10">
            <p className="text-xl">{t('projects:Language')}</p>
            <LanguageSwitcher />
          </div>

          <div className="rounded-3xl bg-th-primary-100" onClick={checkAgreements}>
            <p className="px-7 py-8 green-two-layers rounded-3xl after:rounded-3xl text-th-secondary-10 text-xl cursor-pointer">
              {t('users:SignIn')}
            </p>
          </div>
        </div>

        <Link
          href="https://v-cana.com"
          className="absolute bottom-10 left-1/2 -translate-x-1/2 text-th-primary-100 text-sm uppercase"
          target="_blank"
        >
          v-cana.com
        </Link>
      </div>
    </div>
  )
}
