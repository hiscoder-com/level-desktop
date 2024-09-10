import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/router'

import { useTranslation } from '@/next-i18next'
import VcanaLogo from 'public/icons/vcana-logo-color.svg'

import LanguageSwitcher from './LanguageSwitcher'

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
    <div className="abcolute flex h-screen">
      <div className="flex w-3/5 items-center justify-center bg-th-primary-100">
        <Image
          src="/icons/start-page.svg"
          alt="Vcana Logo"
          width={500}
          height={500}
          className="w-5/6"
        />
      </div>

      <div className="relative flex w-2/5 items-center justify-center">
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center justify-center rounded-3xl bg-th-secondary-10 px-7 py-10">
            <VcanaLogo className="w-[14.5rem]" />
          </div>
          <div className="z-10 flex flex-grow items-center justify-between rounded-3xl bg-th-secondary-10 px-7 py-4">
            <p className="text-xl">{t('projects:Language')}</p>
            <LanguageSwitcher />
          </div>

          <div className="rounded-3xl bg-th-primary-100" onClick={checkAgreements}>
            <p className="green-two-layers cursor-pointer rounded-3xl px-7 py-8 text-xl text-th-secondary-10 after:rounded-3xl">
              {t('users:SignIn')}
            </p>
          </div>
        </div>

        <Link
          href="https://v-cana.com"
          className="absolute bottom-10 left-1/2 -translate-x-1/2 text-sm uppercase text-th-primary-100"
          target="_blank"
        >
          v-cana.com
        </Link>
      </div>
    </div>
  )
}
