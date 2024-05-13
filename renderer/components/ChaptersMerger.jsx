import React, { useRef, useState } from "react";
import JSZip from "jszip";
import Close from "../public/icons/close.svg";
import { convertToUsfm } from "../helpers/usfm";
export default function ChaptersMerger({ book }) {
  const [jsonDataArray, setJsonDataArray] = useState([]);
  const [conflicts, setConflicts] = useState(null);
  const [mergedContent, setMergedContent] = useState(null);
  const fileInputRef = useRef();

  const checkEqualFiles = (file) => {
    const existingFile = jsonDataArray.find((f) => f.filename === file);
    return existingFile;
  };
  const exportToZip = (exportedData, name = "exported") => {
    try {
      if (!exportedData) {
        throw new Error("error:NoData");
      }
      const jsonContent = JSON.stringify(exportedData, null, 2);
      const zip = new JSZip();
      const currentDate = new Date();
      const formattedDate = currentDate
        .toISOString()
        .replace(/:/g, "-")
        .split(".")[0];
      const fileName = `chapter_${formattedDate}.json`;
      zip.file(fileName, jsonContent);
      zip.generateAsync({ type: "blob" }).then(function (content) {
        const blob = content;
        const url = window.URL.createObjectURL(blob);
        const downloadLink = document.createElement("a");
        downloadLink.href = url;
        downloadLink.download = `${name}_${formattedDate}.zip`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        window.URL.revokeObjectURL(url);
      });
    } catch (error) {
      console.log(error.message);
    }
  };
  const handleFiles = async (files) => {
    const jsonPromises = [];
    for (let file of files) {
      const zip = new JSZip();
      const zipContents = await zip.loadAsync(file);
      for (let filename in zipContents.files) {
        const existingFile = checkEqualFiles(filename);
        if (filename.endsWith(".json") && !existingFile) {
          const filePromise = zipContents.files[filename]
            .async("text")
            .then((fileData) => {
              const data = JSON.parse(fileData);
              return { filename, content: data };
            });
          jsonPromises.push(filePromise);
        } else if (filename.endsWith(".json") && existingFile) {
        }
      }
    }

    try {
      const jsonObjects = await Promise.all(jsonPromises);
      setJsonDataArray((prevData) => [...prevData, ...jsonObjects]);
    } catch (error) {
      console.error("Ошибка валидации", error);
    }
  };

  function mergeJsonContents(jsonDataArray) {
    const mergedContent = {};
    const conflicts = [];
    if (jsonDataArray.length < 2) {
      return;
    }

    jsonDataArray.forEach(({ content }) => {
      const chapters = content;
      Object.keys(chapters).forEach((chapter) => {
        if (!mergedContent[chapter]) {
          mergedContent[chapter] = {};
        }
        Object.keys(chapters[chapter]).forEach((verse) => {
          if (chapters[chapter][verse].text && !mergedContent[chapter][verse]) {
            mergedContent[chapter][verse] = chapters[chapter][verse];
          } else if (
            chapters[chapter][verse].text &&
            mergedContent[chapter][verse].text
          ) {
            conflicts.push({
              chapter,
              verse,
              existingText: mergedContent[chapter][verse].text,
              newText: chapters[chapter][verse].text,
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
  const downloadUsfm = (chapters) => {
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
        ref={fileInputRef}
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
                if (fileInputRef.current) {
                  fileInputRef.current.value = "";
                }
                setMergedContent(null);
              }}
            />
          </div>
          // <pre key={index}>{JSON.stringify(json, null, 2)}</pre>
        ))}
      </div>
      {jsonDataArray.length > 0 && (
        <button
          className="btn-primary"
          disabled={jsonDataArray.length < 2}
          onClick={() => mergeChapters()}
        >
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
          <div>
            <p>Конфликтов нет, можно скачать в формате USFM</p>
            <div className="flex gap-2 items-center justify-center">
              <button
                className="btn-primary"
                onClick={() => downloadUsfm(mergedContent)}
              >
                USFM
              </button>

              <button
                className="btn-primary"
                onClick={() => exportToZip(mergedContent, "merged")}
              >
                Архив для переводчиков
              </button>
            </div>
          </div>
        )
      )}
    </div>
  );
}

ChaptersMerger.backgroundColor = "bg-th-secondary-100";
