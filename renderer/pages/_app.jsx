import React, { useEffect } from "react";

import { appWithTranslation } from "next-i18next";

import "../styles/globals.css";
// import NotifyBox from '../components/NotifyBox';
import { RecoilRoot } from "recoil";

function MyApp({ Component, pageProps }) {
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("theme") || "default";
      document.documentElement.className = savedTheme;
    }
  }, []);
  return (
    <>
      <RecoilRoot>
        <Component {...pageProps} />
        {/* <NotifyBox /> */}
      </RecoilRoot>
    </>
  );
}

export default appWithTranslation(MyApp);
