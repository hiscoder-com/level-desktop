import { useEffect, useState } from "react";

import { useRouter } from "next/router";

import { useTranslation } from "next-i18next";

import { getStaticPaths, makeStaticProperties } from "../../lib/get-static";

import Check from "../../public/icons/check.svg";

export default function Agreements() {
  const {
    i18n: { language: locale },
    t,
  } = useTranslation(["users", "common", "user-agreement"]);
  const { push } = useRouter();
  const [agreements, setAgreements] = useState({});

  const links = [
    {
      name: t("Agreement"),
      link: "user-agreement",
      done: agreements.userAgreement,
      text: t("user-agreement:TextLicense"),
    },
    {
      name: t("Confession"),
      link: "confession-steps",
      done: agreements.confession,
      text: t("common:DescriptionConfession"),
    },
  ];

  useEffect(() => {
    const _agreements = window.electronAPI.getAgreements();
    if (_agreements) {
      setAgreements(_agreements);
    }
  }, []);

  return (
    <div className="layout-appbar">
      <div className="my-auto card text-center bg-th-secondary-10">
        <div className="flex flex-col sm:flex-row gap-5 mb-7 p-6 sm:px-0 sm:py-1">
          {links.map((agreement) => (
            <div
              key={agreement.name}
              className={`relative flex flex-col justify-start gap-5 py-5 pl-3 pr-4 max-w-xs text-start ${
                agreement.done
                  ? "bg-th-primary-100 text-th-text-secondary-100"
                  : "bg-th-secondary-200 text-th-text-primary"
              } cursor-pointer rounded-md`}
              onClick={() => push(`/${locale}/${agreement.link}`)}
            >
              <div
                className={`absolute top-0 right-0 w-0 h-0 border-[24px] border-solid border-transparent 
              ${
                agreement.done
                  ? "border-b-th-primary-400 border-l-th-primary-400"
                  : "border-b-th-secondary-300 border-l-th-secondary-300"
              } rounded-bl-lg`}
              />
              <div className="absolute top-0 right-0 w-0 h-0 border-[24px] border-solid border-transparent border-t-th-secondary-10 border-r-th-secondary-10" />
              <div className="flex items-center gap-3">
                <h1 className="font-bold text-lg">{agreement.name}</h1>
                {agreement.done && <Check className="w-5 h-5 stroke-2" />}
              </div>
              <p
                dangerouslySetInnerHTML={{
                  __html: t(agreement.text.split("<br /><br />")[0] ?? "", {
                    interpolation: { escapeValue: false },
                  }),
                }}
                className="mb-2"
              />
            </div>
          ))}
        </div>

        <button
          onClick={() => push(`/${locale}/account`)}
          // disabled={!user?.agreement || !user?.confession}
          className="btn-primary"
        >
          {t("common:Next")}
        </button>
      </div>
    </div>
  );
}

Agreements.backgroundColor = "bg-th-secondary-100";

export const getStaticProps = makeStaticProperties([
  "users",
  "common",
  "user-agreement",
]);

export { getStaticPaths };
