import Breadcrumbs from '../components/Breadcrumbs'
import ChaptersMerger from '../components/ChaptersMerger'
// import { getStaticPaths, makeStaticProperties } from '@/lib/get-static'

export default function ChapterMergerPage() {
  return (
    <div className="layout-appbar">
      <Breadcrumbs />
      <ChaptersMerger />
    </div>
  )
}

// export const getStaticProps = makeStaticProperties([])

// export { getStaticPaths }
