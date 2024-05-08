import Link from "next/link";
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

function ProjectsList({ projects }) {
  const download = (id) => {
    const _project = window.electronAPI.getBook(id);
    const book = [];
    for (const chapterNum in _project) {
      if (Object.hasOwnProperty.call(_project, chapterNum)) {
        const chapter = Object.entries(_project[chapterNum]).map(([k, v]) => ({
          verse: k,
          text: v.text,
          enabled: v.enabled,
        }));
        book.push({
          title: "Chapter " + chapterNum,
          verseObjects: chapter,
        });
      }
    }

    JsonToPdf({
      data: book,
      showImages: false,
      combineVerses: false,
      showChapterTitlePage: false,
      showVerseNumber: true,
      showPageFooters: false,
      styles,
    })
      .then(() => console.log("PDF creation completed"))
      .catch((error) => console.error("PDF creation failed:", error));
  };
  return (
    <table className="border-collapse table-auto w-full text-sm">
      <thead>
        <tr>
          <th className="border-b font-medium p-4 pl-8 pt-0 pb-3 text-slate-400 text-left">
            Book
          </th>
          <th className="border-b font-medium p-4 pl-8 pt-0 pb-3 text-slate-400 text-left">
            Project
          </th>
          <th className="border-b font-medium p-4 pl-8 pt-0 pb-3 text-slate-400 text-left">
            Method
          </th>
          <th className="border-b font-medium p-4 pl-8 pt-0 pb-3 text-slate-400 text-left">
            ID
          </th>
          <th className="border-b font-medium p-4 pl-8 pt-0 pb-3 text-slate-400 text-left">
            Created At
          </th>
          <th className="border-b font-medium p-4 pl-8 pt-0 pb-3 text-slate-400 text-left"></th>
        </tr>
      </thead>
      <tbody className="bg-white">
        {projects.map((project) => (
          <tr key={project.id}>
            <td className="border-b border-slate-100 p-4 pl-8 text-slate-500">
              <Link href={"project/" + project.id} legacyBehavior>
                <a className="font-bold underline">
                  {project.book.name} ({project.book.code})
                </a>
              </Link>
            </td>
            <td className="border-b border-slate-100 p-4 pl-8 text-slate-500">
              {project.name}
            </td>
            <td className="border-b border-slate-100 p-4 pl-8 text-slate-500">
              {project.method}
            </td>
            <td className="border-b border-slate-100 p-4 pl-8 text-slate-500">
              {project.id}
            </td>
            <td className="border-b border-slate-100 p-4 pl-8 text-slate-500">
              {new Date(project.createdAt).toLocaleDateString()}
            </td>
            <td className="border-b border-slate-100 p-4 pl-8 text-slate-500">
              <div className="btn-primary" onClick={() => download(project.id)}>
                Download
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default ProjectsList;
