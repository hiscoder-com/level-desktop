import { useTranslation } from "next-i18next";

import VcanaLogo from "../public/icons/vcana-logo-color.svg";
import { useRouter } from "next/router";
import Gear from "../public/icons/gear.svg";
import Link from "next/link";

function StartPage() {
  const router = useRouter();
  const { t } = useTranslation(["start-page", "projects", "users", "common"]);
  const checkAgreements = () => {
    const agreements = window.electronAPI.getItem("agreements");
    if (!agreements) {
      return router.push("/agreements");
    }
    const agreementsObj = JSON.parse(agreements);
    const allAgreed = agreementsObj.userAgreement && agreementsObj.confession;

    router.push(allAgreed ? "/account" : "/agreements");
  };
  return (
    <div className="flex flex-col justify-center items-center gap-4 h-screen w-full relative">
      <Link href="/chapter-merger">
        <Gear className="w-12 h-12 absolute top-5 right-5" />
      </Link>
      <div>
        <div className="flex flex-grow items-center justify-center p-5  h-24 bg-white rounded-2xl cursor-pointer mb-4">
          <VcanaLogo className="w-44" />
        </div>
        <div
          className="h-32 rounded-2xl bg-slate-550"
          onClick={() => {
            checkAgreements();
          }}
        >
          <p className="p-5 lg:p-7 green-two-layers z-10 h-full w-full rounded-2xl after:rounded-2xl text-th-secondary-10 cursor-pointer">
            {t("users:SignIn")}
          </p>
        </div>
      </div>
    </div>
  );
}

export default StartPage;
