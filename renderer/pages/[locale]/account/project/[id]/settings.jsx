import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';

function Settings() {
  const {
    query: { id },
  } = useRouter();
  return (
    <React.Fragment>
      <Head>
        <title>V-CANA</title>
      </Head>
      <div>
        <Link href={'/project/' + id}>
          <a>Back</a>
        </Link>
        <p>{id}</p>
      </div>
    </React.Fragment>
  );
}

export default Settings;
