import { useEffect, useState } from "react";

import { Placeholder } from "./Placeholder";
import { useGetTnResource } from "../hooks/useGetTnResource";
import dynamic from "next/dynamic";
import Back from "../public/icons/left.svg";
import { checkLSVal } from "../helpers/checkls";
import { useRecoilState } from "recoil";
import { currentVerse } from "../helpers/atoms";

const TNotes = dynamic(
  () => import("@texttree/v-cana-rcl").then((mod) => mod.TNotes),
  {
    ssr: false,
  }
);

function filterNotes(newNote, verse, notes) {
  if (Array.isArray(verse)) {
    verse.forEach((el) => {
      if (!notes[el]) {
        notes[el] = [newNote];
      } else {
        notes[el].push(newNote);
      }
    });
  } else {
    if (!notes[verse]) {
      notes[verse] = [newNote];
    } else {
      notes[verse].push(newNote);
    }
  }
}

function TN({
  config: { resource, id, mainResource, chapter = false },
  toolName,
}) {
  const [currentScrollVerse, setCurrentScrollVerse] =
    useRecoilState(currentVerse);
  const [tnotes, setTnotes] = useState([]);
  const { isLoading, data } = useGetTnResource({
    id,
    resource,
    mainResource,
    chapter,
  });

  useEffect(() => {
    if (data) {
      const _data = [];
      for (const el of data) {
        filterNotes(el, el.verse, _data);
      }
      setTnotes(_data);
    }
  }, [data]);

  return (
    <div id="container_tn" className="overflow-y-auto h-full">
      <TNotes
        tnotes={tnotes}
        nodeContentBack={
          <span>
            <Back className="w-8 stroke-th-primary-200" />
          </span>
        }
        classes={{
          content: {
            container:
              "absolute top-0 bottom-0 pr-2 ,bg-th-secondary-10 overflow-auto left-0 right-0",
            header: "sticky flex top-0 pb-4 bg-th-secondary-10",
            backButton:
              "w-fit h-fit p-1 mr-2.5 cursor-pointer hover:opacity-70 rounded-full bg-th-secondary-100",
            title: "font-bold text-xl mt-1",
            text: "markdown-body",
          },
          main: "relative h-full",
          list: {
            verseNumber: "text-2xl",
            container:
              "divide-y divide-th-text-primary divide-dashed h-full overflow-auto",
            verseBlock: "pl-7 flex-1",
            currentNote: "bg-th-secondary-300",
            note: "p-2 cursor-pointer rounded-lg hover:bg-th-secondary-100",
            verseWrapper: "p-4 flex mx-4",
          },
        }}
        nodeLoading={<Placeholder />}
        isLoading={isLoading}
        scrollTopOffset={20}
        startHighlightIds={checkLSVal("highlightIds", {}, "object")}
        currentScrollVerse={currentScrollVerse}
        toolId={toolName}
        idContainerScroll={"container_tn"}
        setCurrentScrollVerse={setCurrentScrollVerse}
        delayScroll={500}
      />
    </div>
  );
}

export default TN;
