import ReactMarkdown from 'react-markdown'

import MarkdownExtended from './MarkdownExtended'

import Close from 'public/icons/close.svg'

function TNTWLContent({ setItem, item }) {
  return (
    <div
      className={`absolute bottom-0 left-0 right-0 top-0 overflow-auto bg-white px-2 pt-8 ${
        item ? '' : 'hidden'
      } z-10`}
    >
      <div
        className="absolute right-0 top-0 flex w-12 cursor-pointer pr-4"
        onClick={() => setItem(null)}
      >
        <Close />
      </div>
      {!['intro', 'front'].includes(item?.title) && (
        <div className="mb-2 text-xl font-bold">
          <ReactMarkdown className="mb-4 text-2xl">{item?.title}</ReactMarkdown>
        </div>
      )}
      <MarkdownExtended>{item?.text}</MarkdownExtended>
    </div>
  )
}
export default TNTWLContent
