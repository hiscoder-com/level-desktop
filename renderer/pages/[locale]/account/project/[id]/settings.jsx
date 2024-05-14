import React from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useTranslation } from "react-i18next";

function Settings() {
  const {
    i18n: { language: locale },
    t,
  } = useTranslation();
  const {
    query: { id },
  } = useRouter();
  return (
    <React.Fragment>
      <Head>
        <title>{t("V-CANA")}</title>
      </Head>
      <div>
        <Link href={"/project/" + id}>
          <a>{t("Back")}</a>
        </Link>
        <p>{id}</p>
      </div>
    </React.Fragment>
  );
}

export default Settings;
