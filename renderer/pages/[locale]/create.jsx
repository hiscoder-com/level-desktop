import React from "react";
import Head from "next/head";
import Link from "next/link";

function Create() {
  const [fileUrl, setFileUrl] = React.useState(false);
  const onSubmit = (e) => {
    e.preventDefault();
    window.electronAPI.addProject(fileUrl);
  };

  return (
    <>
      <Head>
        <title>V-CANA</title>
      </Head>
      <div className="text-2xl w-full">
        <Link href={"/account"} legacyBehavior>
          <a className="btn-primary text-base">Back</a>
        </Link>
        <br />
        <h2>Создать проект</h2>
        <form onSubmit={onSubmit}>
          <button
            className="btn-primary text-base mt-3"
            onClick={async (e) => {
              e.preventDefault();
              const filePath = await window.electronAPI.openFile();
              setFileUrl(filePath);
            }}
          >
            Выбрать архив с проектом
          </button>
          <p>{fileUrl || "Не выбран"}</p>

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

export default Create;
