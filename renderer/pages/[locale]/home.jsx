import React from "react";
import Head from "next/head";

import { useTranslation } from "next-i18next";

import StartPage from "../../components/StartPage";
import { getStaticPaths, makeStaticProperties } from "../../lib/get-static";

export default function Home() {
  const {
    i18n: { language: locale },
    t,
  } = useTranslation();

  return (
    <>
      <Head>
        <title>V-CANA</title>
      </Head>
      <div className="text-2xl w-full">
        <StartPage />
      </div>
    </>
  );
}

export const getStaticProps = makeStaticProperties(["common"]);

export { getStaticPaths };
