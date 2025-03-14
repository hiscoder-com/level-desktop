import { useRtlInput } from '@/hooks/useRtlInput'

import Trash from 'public/icons/trash.svg'

const WordItem = ({ word, setIsOpenModal, setWordToDel, setWordId }) => {
  const { direction } = useRtlInput(word.title)

  return (
    <div
      key={word.id}
      dir={direction}
      className="group my-3 flex cursor-pointer items-start justify-between rounded-lg bg-th-secondary-100"
      onClick={() => setWordId(word.id)}
    >
      <div className="mr-4 p-2 font-bold">{word.title}</div>
      <button
        className="top-0 m-1 p-2 opacity-0 group-hover:opacity-100"
        onClick={(e) => {
          e.stopPropagation()
          setIsOpenModal(true)
          setWordToDel(word)
        }}
      >
        <Trash className="h-4 w-4 text-cyan-800" />
      </button>
    </div>
  )
}

export default WordItem
