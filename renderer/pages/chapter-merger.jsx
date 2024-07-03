import { Toaster } from 'react-hot-toast'

import Breadcrumbs from '@/components/Breadcrumbs'
import ChaptersMerger from '@/components/ChaptersMerger'

export default function ChapterMergerPage() {
  return (
    <div className="layout-appbar">
      <Breadcrumbs />
      <ChaptersMerger />
      <Toaster />
    </div>
  )
}
