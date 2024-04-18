import React, { useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { books } from "../helpers/books";

function Create() {
  const [fileUrl, setFileUrl] = useState("");
  const [resources, setResources] = useState([]);

  const onSubmit = (e) => {
    e.preventDefault();
    const data = new FormData(e.target);
    // data.append('fileUrl', fileUrl);
    // console.log(data.entries());
    for (let [k, v] of data.entries()) {
      axios.get("https://git.door43.org/unfoldingWord");
      // надо скачать сначала манифесты, потом узнать и скачать файлы literal, simplified, twl, tn, tq
      // потом скачать архив, почистить вордсы
      // скачать полностью лексикон, академию
      // согласно literal создать структуру для книги с главами
      // надо ли все это делать на стороне апи или на клиенте. Ничего не мешает прям тут это провернуть, используя axios и jszip
      console.log(k, v);
    }
  };

  return (
    <>
      <Head>
        <title>V-CANA</title>
      </Head>
      <div className="text-lg w-full p-4">
        <Link href={"/home"} legacyBehavior>
          <a className="border py-2 px-3 rounded-md bg-slate-300">Back</a>
        </Link>
        <br />
        <h2 className="text-2xl mt-3 mb-4">Создать book package</h2>
        <p>
          Работать будет так.
          <br />
          1ым шагом мы загружаем файл с конфигом, где прописаны будут все шаги и
          т.д.
          <br />
          2ой шаг - это указать ссылки на ресурсы
          <br />
          3ий шаг - указать код книги, для которой мы создаем пакет
          <br />
          После этого надо нажать кнопку "Сгенерировать", и у нас получится
          архив со всеми настройками и файлами
        </p>
        <form onSubmit={onSubmit}>
          <button
            className="border border-green-700 bg-green-600 hover:bg-green-700 active:bg-green-800 shadow-md hover:border-green-800 rounded-md text-white px-3 py-2 text-base mt-3"
            onClick={async (e) => {
              e.preventDefault();
              const { url, resources } = await window.electronAPI.openConfig();
              setFileUrl(url);
              setResources(resources);
              console.log({ resources });
            }}
          >
            Выбрать конфиг проекта
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
            value={"Create"}
          />
        </form>
      </div>
    </>
  );
}

export default Create;
