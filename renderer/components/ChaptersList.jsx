import Link from "next/link";
import React from "react";
import { JsonToPdf } from "@texttree/obs-format-convert-rcl";
const styles = {
  currentPage: {
    fontSize: 16,
    alignment: "center",
    bold: true,
    margin: [0, 10, 0, 0],
  },
  chapterTitle: { fontSize: 20, bold: true, margin: [0, 26, 0, 15] },
  verseNumber: { sup: true, bold: true, opacity: 0.8, margin: [0, 8, 8, 0] },
  defaultPageHeader: { bold: true, width: "50%" },
  text: { alignment: "justify" },
};

function ChapterList({ id, chapters, steps, mutate }) {
  const handleBackStep = (chapter, step) => {
    const backStep = window.electronAPI.goToStep(id, chapter, step - 1);
    if (backStep !== step) {
      mutate();
    }
  };
  const handleDownloadChapter = (chapter) => {
    const savedVerses = Object.entries(
      window.electronAPI.getChapter(id, chapter)
    )
      .map(([k, v]) => ({ verse: k, text: v.text, enabled: v.enabled }))
      .filter((v) => v.enabled);
    const filename = "chapter_" + chapter;
    JsonToPdf({
      data: [{ title: "Chapter " + chapter, verseObjects: savedVerses }],
      styles,
      filename,
      showImages: false,
      combineVerses: false,
      showChapterTitlePage: false,
      showVerseNumber: true,
      bookPropertiesObs: {},
      showPageFooters: false,
    })
      .then(() => console.log("PDF creation completed"))
      .catch((error) => console.error("PDF creation failed:", error));
  };
  return (
    <table className="border-collapse table-auto w-full text-sm">
      <thead>
        <tr>
          <th className="border-b font-medium p-4 pl-8 pt-0 pb-3 text-slate-400 text-left">
            Chapter
          </th>
          <th className="border-b font-medium p-4 pl-8 pt-0 pb-3 text-slate-400 text-left">
            Step
          </th>
          <th className="border-b font-medium p-4 pl-8 pt-0 pb-3 text-slate-400 text-left">
            Step back
          </th>
          <th className="border-b font-medium p-4 pl-8 pt-0 pb-3 text-slate-400 text-left">
            Download
          </th>
        </tr>
      </thead>
      <tbody className="bg-white">
        {chapters.map(([chapter, step]) => (
          <tr key={chapter}>
            <td className="border-b border-slate-100 p-4 pl-8 text-slate-500">
              <Link href={`/project/${id}/${chapter}/${step}`} legacyBehavior>
                <a className="font-bold underline">Chapter {chapter}</a>
              </Link>
            </td>
            <td className="border-b border-slate-100 p-4 pl-8 text-slate-500">
              {steps[step].title} | {steps[step].intro}
            </td>
            <td className="border-b border-slate-100 p-4 pl-8 text-slate-500">
              {step > 0 && (
                <div
                  className="btn-primary text-base"
                  onClick={() => handleBackStep(chapter, step)}
                >
                  Go to step {step}
                </div>
              )}
            </td>
            <td className="border-b border-slate-100 p-4 pl-8 text-slate-500">
              <div
                className="btn-primary text-base"
                onClick={() => handleDownloadChapter(chapter)}
              >
                Download
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default ChapterList;
