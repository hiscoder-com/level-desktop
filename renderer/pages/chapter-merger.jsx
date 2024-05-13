import Breadcrumbs from "../components/Breadcrumbs";
import ChaptersMerger from "../components/ChaptersMerger";

export default function ChapterMergerPage() {
  return (
    <div className="layout-appbar">
      <Breadcrumbs />
      <ChaptersMerger />
    </div>
  );
}

// export async function getStaticProps({ locale }) {
//   return {
//     props: {
//       ...(await serverSideTranslations(locale, [
//         "confession-steps",
//         "common",
//         "users",
//       ])),
//     },
//   };
// }
