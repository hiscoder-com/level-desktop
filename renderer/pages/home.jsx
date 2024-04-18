import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import ProjectsList from '../components/ProjectsList';

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
        <h2 className="mt-6 mb-6 text-4xl">Projects</h2>
        <ProjectsList projects={projects} />
        <Link href="/create">
          <a className="btn-blue mt-3 text-base">Create New</a>
        </Link>
        {/* <Link href="/createbp">
          <a className="btn-blue mt-3 text-base">Создать book package</a>
        </Link> */}
      </div>
    </>
  );
}

export default Home;
