import React from "react";
import Head from "next/head";

import { useTranslation } from "react-i18next";
import { getStaticPaths, makeStaticProperties } from "../../lib/get-static";

import StartPage from "../../components/StartPage";
import LanguageSwitcher from "../../components/LanguageSwitcher";

export default function Home() {
  const { t } = useTranslation();
  return (
    <>
      <Head>
        <title>{t("V-CANA")}</title>
      </Head>
      <div className="text-2xl w-full">
        <LanguageSwitcher />
        <StartPage />
      </div>
    </>
  );
}

export const getStaticProps = makeStaticProperties(["common", "users"]);

export { getStaticPaths };
