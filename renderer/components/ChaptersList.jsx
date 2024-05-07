import Link from "next/link";
import React from "react";

function ChapterList({ id, chapters, steps, mutate }) {
  const handleBackStep = (chapter, step) => {
    const backStep = window.electronAPI.goToStep(id, chapter, step - 1);
    if (backStep !== step) {
      mutate();
    }
  };
  const handleDownloadChapter = (chapter) => {};
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
