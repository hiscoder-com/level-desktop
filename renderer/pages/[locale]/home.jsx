import React from "react";
import Head from "next/head";

import { getStaticPaths, makeStaticProperties } from "../../lib/get-static";

import StartPage from "../../components/StartPage";
import LanguageSwitcher from "../../components/LanguageSwitcher";

export default function Home() {
  return (
    <>
      <Head>
        <title>V-CANA</title>
      </Head>
      <div className="text-2xl w-full">
        <LanguageSwitcher />
        <StartPage />
      </div>
    </>
  );
}

export const getStaticProps = makeStaticProperties(["common"]);

export { getStaticPaths };
