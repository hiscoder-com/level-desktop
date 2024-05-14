import React, { useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { books } from "../helpers/books";
import { makeStaticProperties, getStaticPaths } from "../../lib/get-static";

function Create() {
  const {
    i18n: { language: locale },
    t,
  } = useTranslation();
  const [fileUrl, setFileUrl] = useState("");
  const [resources, setResources] = useState([]);

  const onSubmit = (e) => {
    e.preventDefault();
    const data = new FormData(e.target);
    for (let [k, v] of data.entries()) {
      axios.get("https://git.door43.org/unfoldingWord");
      // надо скачать сначала манифесты, потом узнать и скачать файлы literal, simplified, twl, tn, tq
      // потом скачать архив, почистить вордсы
      // скачать полностью лексикон, академию
      // согласно literal создать структуру для книги с главами
      // надо ли все это делать на стороне апи или на клиенте. Ничего не мешает прям тут это провернуть, используя axios и jszip
    }
  };

  return (
    <>
      <Head>
        <title>{t("V-CANA")}</title>
      </Head>
      <div className="text-lg w-full p-4">
        <Link href={`${locale}/home`} legacyBehavior>
          <a className="border py-2 px-3 rounded-md bg-slate-300">
            {t("Back")}
          </a>
        </Link>
        <br />
        <h2 className="text-2xl mt-3 mb-4">{t("CreateBP")}</h2>
        <p>{t("CreationRules")}</p>
        <form onSubmit={onSubmit}>
          <button
            className="border border-green-700 bg-green-600 hover:bg-green-700 active:bg-green-800 shadow-md hover:border-green-800 rounded-md text-white px-3 py-2 text-base mt-3"
            onClick={async (e) => {
              e.preventDefault();
              const { url, resources } = await window.electronAPI.openConfig();
              setFileUrl(url);
              setResources(resources);
            }}
          >
            {t("SelectProjectConfig")}
          </button>
          <input type="text" readOnly name="fileUrl" value={fileUrl} />
          {resources.length
            ? resources.map((resource) => (
                <div key={resource.name}>
                  <label className={resource.isMain ? "font-bold" : ""}>
                    {resource.name}
                    <input name={resource.name} />
                  </label>
                </div>
              ))
            : ""}

          <br />
          <select name="bookKey">
            {books.map((el) => (
              <option key={el} value={el}>
                {el}
              </option>
            ))}
          </select>

          <input
            className="btn-blue text-base mt-3"
            type="submit"
            value={t("Create")}
          />
        </form>
      </div>
    </>
  );
}

export default Create;

export const getStaticProps = makeStaticProperties(["common"]);

export { getStaticPaths };
