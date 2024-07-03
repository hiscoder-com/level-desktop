import { useRouter } from 'next/router'
import Link from 'next/link'

import { useTranslation } from '@/next-i18next'

import LanguageSwitcher from './LanguageSwitcher'

import VcanaLogo from 'public/icons/vcana-logo-color.svg'
import Gear from 'public/icons/gear.svg'

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
    <div className="relative flex flex-col justify-center items-center gap-4 h-screen w-full mx-auto max-w-7xl ">
      <div className="absolute top-10 right-0">
        <Link href={`/chapter-merger`}>
          <Gear className="w-10 h-10" />
        </Link>
      </div>

      <div className="w-72">
        <div className="flex flex-grow items-center justify-between p-5 h-20 bg-white rounded-3xl cursor-pointer mb-4">
          <p className="font-semibold text-xl">{t('projects:Language')}</p>
          <LanguageSwitcher />
        </div>
        <div className="flex flex-grow items-center justify-center p-5 h-32 bg-white rounded-3xl cursor-pointer mb-4">
          <VcanaLogo className="w-44" />
        </div>
        <div
          className="h-24 rounded-3xl bg-slate-550"
          onClick={() => {
            checkAgreements()
          }}
        >
          <p className="p-5 lg:p-7 green-two-layers z-10 h-full w-full rounded-3xl after:rounded-3xl text-th-secondary-10 cursor-pointer">
            {t('users:SignIn')}
          </p>
        </div>
      </div>
    </div>
  )
}
