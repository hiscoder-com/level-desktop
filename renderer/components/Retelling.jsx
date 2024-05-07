import { useEffect } from "react";

import { useRouter } from "next/router";

import { useSetRecoilState } from "recoil";

import { inactiveState } from "../helpers/atoms";
import Recorder from "./Recorder";

export default function Retelling() {
  const setInactive = useSetRecoilState(inactiveState);
  const router = useRouter();

  useEffect(() => {
    const handleRouteChange = () => {
      setInactive(false);
    };

    router.events.on("routeChangeStart", handleRouteChange);

    return () => {
      router.events.off("routeChangeStart", handleRouteChange);
    };
  }, [router, setInactive]);

  return (
    <>
      <div className="flex justify-center flex-wrap mt-8">
        <div className="w-full pb-4 px-2 mb-4 border-b-4">
          <p className="mb-4">{"OriginalRecording"}</p>
          <Recorder />
        </div>
        <div className="w-full pb-4 px-2 mb-4 border-b-4">
          <p className="mb-4">{"TargetRecording"}</p>
          <Recorder />
        </div>
      </div>
    </>
  );
}
