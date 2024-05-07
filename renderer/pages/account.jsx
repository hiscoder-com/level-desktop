import React from "react";
import Head from "next/head";
import Link from "next/link";
import ProjectsList from "../components/ProjectsList";

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
        <h2 className="mt-6 mb-6 text-4xl ">Projects</h2>
        <Link href="/home" legacyBehavior>
          <a className="btn-primary text-base">Go to home</a>
        </Link>
        <div className="py-4">
          <ProjectsList projects={projects} />
        </div>
        <Link href="/create" legacyBehavior>
          <a className="btn-primary text-base">Import</a>
        </Link>
      </div>
    </>
  );
}

export default Home;
