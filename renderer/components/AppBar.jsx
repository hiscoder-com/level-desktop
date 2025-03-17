import Link from 'next/link'

import { stepConfigState } from 'helpers/atoms'
import { useRecoilValue } from 'recoil'

import Dropdown from './Dropdown'
import Timer from './Timer'

import LevelLogo from 'public/icons/level-logo.svg'

export default function AppBar({ isStep = false, isShowAppBar = false }) {
  const stepConfig = useRecoilValue(stepConfigState)
  return (
    <>
      {isShowAppBar && (
        <>
          {isStep ? (
            <div className="absolute left-0 top-0 w-full bg-th-primary-100">
              <div className="appbar">
                <Link href="/account" className="">
                  <LevelLogo className="h-8 fill-th-text-secondary-100" />
                </Link>

                <div className="block flex-col text-center text-th-text-secondary-100 md:flex">
                  <div>{stepConfig.title}</div>
                  {stepConfig.subtitle && (
                    <div className="text-xs">{stepConfig.subtitle}</div>
                  )}
                </div>
                <div className="block items-center justify-center gap-4 text-th-text-primary md:flex md:justify-start">
                  <div className="hidden rounded-3xl bg-th-secondary-10 px-5 py-2.5 md:flex">
                    <Timer time={stepConfig.time} />
                  </div>
                  <Dropdown description={stepConfig?.description} />
                </div>
              </div>
            </div>
          ) : (
            <div className="fixed left-0 top-0 flex h-16 w-full items-center bg-th-primary-100 px-14 lg:px-8 xl:px-20 2xl:px-20">
              <Link href={'/account'} className="ml-12">
                <LevelLogo className="h-8 fill-th-text-secondary-100" />
              </Link>
            </div>
          )}
        </>
      )}
    </>
  )
}
