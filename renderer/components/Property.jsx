import { useEffect } from 'react'

import { useRtlInput } from '@/hooks/useRtlInput'
import ReactTextareaAutosize from 'react-textarea-autosize'

function Property({ t, property, content, onContentChange }) {
  const { value, setValue, direction, handleChange } = useRtlInput(content)

  useEffect(() => {
    setValue(content)
  }, [content, setValue])

  const handleInputChange = (e) => {
    handleChange(e)
    onContentChange(e.target.value, property)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="font-bold">{t(`projects:${property}`)}</div>
      <ReactTextareaAutosize
        maxRows="7"
        className="input-primary"
        placeholder={t(`projects:${property}_placeholder`)}
        value={value}
        onChange={handleInputChange}
        dir={direction}
      />
    </div>
  )
}

export default Property
