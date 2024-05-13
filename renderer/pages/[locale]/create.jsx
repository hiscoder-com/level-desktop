import React from "react";
import Head from "next/head";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { makeStaticProperties, getStaticPaths } from "../../lib/get-static";

export default function Create() {
  const {
    i18n: { language: locale },
    t,
  } = useTranslation(["common", "projects"]);
  const [fileUrl, setFileUrl] = React.useState(false);
  const onSubmit = (e) => {
    e.preventDefault();
    window.electronAPI.addProject(fileUrl);
  };

  return (
    <>
      <Head>
        <title>{t("V-CANA")}</title>
      </Head>
      <div className="text-2xl w-full">
        <Link href={`/${locale}/account`} legacyBehavior>
          <a className="btn-primary text-base">{t("Back")}</a>
        </Link>
        <br />
        <h2>{t("projects:CreateProject")}</h2>
        <form onSubmit={onSubmit}>
          <button
            className="btn-primary text-base mt-3"
            onClick={async (e) => {
              e.preventDefault();
              const filePath = await window.electronAPI.openFile();
              setFileUrl(filePath);
            }}
          >
            {t("projects:SelectArchiveProject")}
          </button>
          <p>{fileUrl || t("NotSelected")}</p>

          <input
            className="btn-primary text-base mt-3"
            type="submit"
            value={"Create"}
          />
        </form>
      </div>
    </>
  );
}

export const getStaticProps = makeStaticProperties(["common", "projects"]);

export { getStaticPaths };
