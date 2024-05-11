import React, { useState } from "react";
import JSZip from "jszip";
import Close from "../public/icons/close.svg";
import { convertToUsfm } from "../helpers/usfm";
// import toast from "react-hot-toast";
export default function ChaptersMerger({ book }) {
  const [jsonDataArray, setJsonDataArray] = useState([]);
  const [conflicts, setConflicts] = useState(null);
  const [mergedContent, setMergedContent] = useState(null);

  const checkEqualFiles = (file) => {
    const existingFile = jsonDataArray.find((f) => f.filename === file);
    return existingFile;
  };
  const handleFiles = async (files) => {
    const jsonPromises = [];

    for (let i = 0; i < files.length; i++) {
      const zip = new JSZip();

      const zipContents = await zip.loadAsync(files[i]);

      Object.keys(zipContents.files).forEach((filename) => {
        const existingFile = checkEqualFiles(filename);

        if (filename.endsWith(".json") && !existingFile) {
          const filePromise = zipContents.files[filename]
            .async("text")
            .then((fileData) => {
              return { filename, content: JSON.parse(fileData) };
            });

          jsonPromises.push(filePromise);
        } else {
          // toast.error("Файлы с таким именем уже существуют");
        }
      });
    }
    const jsonObjects = await Promise.all(jsonPromises);

    setJsonDataArray((prevData) => [...prevData, ...jsonObjects]);
  };

  function mergeJsonContents(jsonDataArray) {
    const mergedContent = {};

    const conflicts = [];

    jsonDataArray.forEach(({ content }) => {
      Object.keys(content).forEach((chapter) => {
        if (!mergedContent[chapter]) {
          mergedContent[chapter] = {};
        }

        Object.keys(content[chapter]).forEach((verse) => {
          if (content[chapter][verse].text && !mergedContent[chapter][verse]) {
            mergedContent[chapter][verse] = content[chapter][verse];
          } else if (
            content[chapter][verse].text &&
            mergedContent[chapter][verse].text
          ) {
            conflicts.push({
              chapter,
              verse,
              existingText: mergedContent[chapter][verse].text,
              newText: content[chapter][verse].text,
            });
          }
        });
      });
    });

    if (conflicts.length > 0) {
      conflicts.forEach((conflict, index) => {
        console.log(
          `${index + 1}. Chapter: ${conflict.chapter}, Verse: ${
            conflict.verse
          }, Existing Text: "${conflict.existingText}", New Text: "${
            conflict.newText
          }"`
        );
      });
    }

    return {
      mergedContent,
      conflicts,
    };
  }

  const mergeChapters = () => {
    const { mergedContent, conflicts } = mergeJsonContents(jsonDataArray);
    if (conflicts.length > 0) {
      setConflicts(conflicts);
    } else {
      setMergedContent(mergedContent);
    }
  };
  const convertJson = (chapters) => {
    const convertedChapters = [];
    for (const num in chapters) {
      if (Object.hasOwnProperty.call(chapters, num)) {
        const chapter = chapters[num];
        const convertedChapter = Object.keys(chapter).reduce((acc, verse) => {
          return { ...acc, [verse]: chapter[verse].text };
        }, {});
        convertedChapters.push({ num: num, text: convertedChapter });
      }
    }
    return convertedChapters;
  };
  const downloadFile = (chapters) => {
    const convertedChapters = convertJson(chapters);
    const merge = convertToUsfm({
      jsonChapters: convertedChapters,
      book: {
        code: "",
        properties: {
          scripture: {
            h: "",
            toc1: "",
            toc2: "",
            toc3: "",
            mt: "",
            chapter_label: "",
          },
        },
      },
      project: { code: "", language: { code: "", orig_name: "" }, title: "" },
    });

    const blob = new Blob([merge], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${book ?? "book"}.usfm`);
    document.body.appendChild(link);
    link.click();
  };

  return (
    <div className="layout-appbar">
      <input
        type="file"
        multiple
        onChange={(e) => handleFiles(e.target.files)}
      />
      <div>
        <p>Загруженные файлы:</p>
        {jsonDataArray.map((json, index) => (
          <div className="flex gap-2 items-center" key={index}>
            <h1 key={index}>{json.filename}</h1>
            <Close
              className="w-5 h-5 cursor-pointer"
              onClick={() => {
                setJsonDataArray(jsonDataArray.filter((_, i) => i !== index));
                setConflicts(null);
              }}
            />
          </div>
          // <pre key={index}>{JSON.stringify(json, null, 2)}</pre>
        ))}
      </div>
      {jsonDataArray.length > 0 && (
        <button className="btn-primary" onClick={() => mergeChapters()}>
          Merge
        </button>
      )}
      {conflicts ? (
        <div>
          <p className="font-bold mb-2">Есть конфликты, надо их исправить</p>
          {conflicts.map((conflict, index) => (
            <div key={index}>
              <p>
                Chapter {conflict.chapter}, Verse {conflict.verse}
              </p>
              <p>Existing Text: {conflict.existingText}</p>
              <p>New Text: {conflict.newText}</p>
            </div>
          ))}
        </div>
      ) : (
        mergedContent && (
          <div className="flex flex-col gap-2 items-center">
            <p>Конфликтов нет, можно скачать в формате USFM</p>
            <button
              className="btn-primary"
              onClick={() => downloadFile(mergedContent)}
            >
              Скачать
            </button>
          </div>
        )
      )}
    </div>
  );
}

ChaptersMerger.backgroundColor = "bg-th-secondary-100";
