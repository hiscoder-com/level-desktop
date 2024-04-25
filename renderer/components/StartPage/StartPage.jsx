import { useTranslation } from "next-i18next";

import VcanaLogo from "../../public/icons/vcana-logo-color.svg";
import Link from "next/link";

function StartPage({ defaultContentKey = null }) {
  const { t } = useTranslation(["start-page", "projects", "users", "common"]);

  return (
    <div className="flex flex-col justify-center items-center gap-4 h-screen w-full ">
      <div>
        <div className="flex flex-grow items-center justify-center p-5  h-24 bg-white rounded-2xl cursor-pointer mb-4">
          <VcanaLogo className="w-44" />
        </div>
        <Link href="/account">
          <div className="h-32 rounded-2xl bg-slate-550">
            <p className="p-5 lg:p-7 green-two-layers z-10 h-full w-full rounded-2xl after:rounded-2xl text-th-secondary-10 cursor-pointer">
              {t("users:SignIn")}
            </p>
          </div>
        </Link>
      </div>
    </div>
  );
}

export default StartPage;
