import React from "react";
import Head from "next/head";

import StartPage from "../components/StartPage/StartPage";

function Home() {
  const [projects, setProjects] = React.useState([]);

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

export default Home;
