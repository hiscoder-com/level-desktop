import dynamic from 'next/dynamic'

import { useRecoilState } from 'recoil'

import { useGetTqResource } from '@/hooks/useGetTqResource'
import { currentVerse } from '@/helpers/atoms'

import Down from 'public/icons/arrow-down.svg'

const TQuestions = dynamic(
  () => import('@texttree/v-cana-rcl').then((mod) => mod.TQuestions),
  {
    ssr: false,
  }
)
function TQ({ config: { resource, id, mainResource, chapter = false, wholeChapter } }) {
  const { isLoading, data } = useGetTqResource({
    id,
    resource,
    mainResource,
    chapter,
    wholeChapter,
  })
  const [currentScrollVerse, setCurrentScrollVerse] = useRecoilState(currentVerse)
  return (
    <div id="container_tq" className="overflow-y-auto h-full">
      <TQuestions
        questionObjects={data}
        toolId="tquestions"
        isLoading={isLoading}
        currentScrollVerse={currentScrollVerse}
        idContainerScroll="container_tq"
        setCurrentScrollVerse={setCurrentScrollVerse}
        classes={{
          verseWrapper: 'flex mx-4 p-4',
          verseNumber: 'text-2xl',
          verseBlock: 'pl-7 w-full text-th-text-primary',
          questionWrapper: 'py-2',
          question: {
            button: 'flex items-center w-full p-2 text-left gap-2 justify-between',
            title: '',
            content: 'w-fit py-4 text-th-text-primary',
            highlightButton: 'bg-th-secondary-100 rounded-lg',
          },
        }}
        nodeOpen={<Down className="w-5 h-5 min-w-[1.25rem] stroke-th-text-primary" />}
      />
    </div>
  )
}

export default TQ
