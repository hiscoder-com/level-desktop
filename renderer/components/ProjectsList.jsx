import Link from "next/link";
import React from "react";

function ProjectsList({ projects }) {
  console.log(projects);
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
              <div className="btn-primary">Download</div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default ProjectsList;
