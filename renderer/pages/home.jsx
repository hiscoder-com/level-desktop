import React from "react";
import Head from "next/head";
import Link from "next/link";
import ProjectsList from "../components/ProjectsList";
import StartPage from "../components/StartPage/StartPage";

function Home() {
  const [projects, setProjects] = React.useState([]);

  React.useEffect(() => {
    setProjects(window.electronAPI.getProjects());
  }, []);

  return (
    <>
      <Head>
        <title>V-CANA</title>
      </Head>
      <div className="text-2xl w-full">
        <StartPage />
        {/* <ProjectsList projects={projects} /> */}

        {/* <Link href="/createbp">
          <a className="btn-blue mt-3 text-base">Создать book package</a>
        </Link> */}
      </div>
    </>
  );
}

export default Home;
