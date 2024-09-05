import Link from 'next/link'
import { useRecoilValue } from 'recoil'
import Timer from './Timer'
import Dropdown from './Dropdown'
import { stepConfigState } from 'helpers/atoms'
import VcanaLogo from 'public/icons/vcana-logo.svg'

export default function AppBar({ isStep = false, isShowAppBar = false }) {
  const stepConfig = useRecoilValue(stepConfigState)
  return (
    <>
      {isShowAppBar && (
        <>
          {isStep ? (
            <div className="bg-th-primary-100 absolute top-0 left-0 w-full">
              <div className="appbar">
                <div className="relative md:static flex items-center h-10 md:justify-start md:gap-7">
                  <div className={`flex justify-center w-full md:ml-0 `}>
                    <Link href="/account">
                      <VcanaLogo className="h-6 fill-th-text-secondary-100 ml-6" />
                    </Link>
                  </div>
                </div>
                <div className="block md:flex flex-col text-center text-th-text-secondary-100">
                  <div>{stepConfig.title}</div>
                  {stepConfig.subtitle && (
                    <div className="text-xs">{stepConfig.subtitle}</div>
                  )}
                </div>
                <div className="block md:flex items-center gap-4 justify-center md:justify-start text-th-text-primary ">
                  <div className="hidden md:flex px-5 py-2.5 bg-th-secondary-10 rounded-3xl">
                    <Timer time={stepConfig.time} />
                  </div>
                  <Dropdown description={stepConfig?.description} />
                </div>
              </div>
            </div>
          ) : (
            <div className="fixed bg-th-primary-100 top-0 left-0 w-full h-16 flex items-center">
              <Link href={'/account'}>
                <VcanaLogo className="h-6 fill-th-text-secondary-100 ml-14" />
              </Link>
            </div>
          )}
        </>
      )}
    </>
  )
}
