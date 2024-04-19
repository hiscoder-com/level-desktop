import ReactMarkdown from "react-markdown";

import { Disclosure } from "@headlessui/react";

import { Placeholder } from "./Placeholder";
import { useScroll } from "../hooks/useScroll";
import { useGetTqResource } from "../hooks/useGetTqResource";
import { useRecoilState } from "recoil";
import { currentVerse } from "../helpers/atoms";
import dynamic from "next/dynamic";
import Down from "../public/icons/arrow-down.svg";

const TQuestions = dynamic(
  () => import("@texttree/v-cana-rcl").then((mod) => mod.TQuestions),
  {
    ssr: false,
  }
);
function TQ({
  config: { resource, id, mainResource, chapter = false },
  toolName,
}) {
  const { isLoading, data } = useGetTqResource({
    id,
    resource,
    mainResource,
    chapter,
  });
  const [currentScrollVerse, setCurrentScrollVerse] =
    useRecoilState(currentVerse);
  return (
    <div id="container_tq" className="overflow-y-auto h-full">
      {/* {isLoading ? (
        <Placeholder />
      ) : (
        <QuestionList
          data={data}
          viewAll={viewAllQuestions}
          toolName={toolName}
          isLoading={isLoading}
        />
      )} */}
      <TQuestions
        questionObjects={data}
        toolId="tquestions"
        isLoading={isLoading}
        currentScrollVerse={currentScrollVerse}
        idContainerScroll="container_tq"
        setCurrentScrollVerse={setCurrentScrollVerse}
        classes={{
          verseWrapper: "flex mx-4 p-4",
          verseNumber: "text-2xl",
          verseBlock: "pl-7 w-full text-th-text-primary",
          questionWrapper: "py-2",
          question: {
            button:
              "flex items-center w-full p-2 text-left gap-2 justify-between",
            title: "",
            content: "w-fit py-4 text-th-text-primary",
            highlightButton: "bg-th-secondary-100 rounded-lg",
          },
        }}
        nodeOpen={
          <Down className="w-5 h-5 min-w-[1.25rem] stroke-th-text-primary" />
        }
      />
    </div>
  );
}

export default TQ;

// function QuestionList({ data, viewAll, toolName, isLoading }) {
//   let uniqueVerses = new Set();
//   const reduceQuestions = (title) => {
//     uniqueVerses.add(title);
//     if (Object.values(data).flat().length === uniqueVerses.size) {
//       console.log('все вопросы просмотрены!'); //TODO это для проверки просмотра всех вопросов
//     }
//   };

//   const { highlightId, handleSaveScroll } = useScroll({
//     toolName,
//     isLoading,
//     idPrefix: 'idtq',
//   });

//   return (
//     <div className="divide-y divide-dashed divide-gray-800">
//       {data &&
//         Object.keys(data)?.map((key) => {
//           return (
//             <div key={key} className="flex mx-4 p-4" id={'idtq' + key}>
//               <div className="text-2xl">{key}</div>
//               <div className="pl-7 text-gray-700">
//                 <ul>
//                   {data[key]?.map((item) => {
//                     return (
//                       <li
//                         key={item.id}
//                         id={'id' + item.id}
//                         onClick={() => handleSaveScroll(key, item.id)}
//                         className="py-2">
//                         <Answer
//                           item={item}
//                           reduceQuestions={() => reduceQuestions(item.title)}
//                           viewAll={viewAll}
//                           highlightId={highlightId}
//                         />
//                       </li>
//                     );
//                   })}
//                 </ul>
//               </div>
//             </div>
//           );
//         })}
//     </div>
//   );
// }

// function Answer({ item, reduceQuestions, viewAll, highlightId }) {
//   return (
//     <Disclosure>
//       <Disclosure.Button
//         className={`w-fit text-left ${
//           highlightId === 'id' + item.id ? 'bg-gray-200' : ''
//         }`}
//         onClick={() => {
//           if (viewAll) {
//             reduceQuestions();
//           }
//         }}>
//         <ReactMarkdown>{item.title}</ReactMarkdown>
//       </Disclosure.Button>
//       <Disclosure.Panel className="w-fit py-4 text-cyan-700">
//         <p>{item.text}</p>
//       </Disclosure.Panel>
//     </Disclosure>
//   );
// }
