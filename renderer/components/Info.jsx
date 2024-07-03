import { Placeholder } from './Placeholder'
import MarkdownExtended from './MarkdownExtended'

import { useGetInfoResource } from '@/hooks/useGetInfoResource'

function Info({ config: { resource, id, mainResource, chapter = false }, toolName }) {
  const { isLoading, data: intro } = useGetInfoResource({
    id,
    resource,
    mainResource,
    chapter,
  })

  return (
    <>
      {isLoading ? (
        <Placeholder />
      ) : (
        <div>
          <MarkdownExtended>{intro?.bookIntro}</MarkdownExtended>
          <hr className="my-10" />
          <MarkdownExtended>{intro?.chapterIntro}</MarkdownExtended>
        </div>
      )}
    </>
  )
}

export default Info
