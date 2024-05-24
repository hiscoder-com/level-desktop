import { useEffect, useState } from 'react'

import ReactTextareaAutosize from 'react-textarea-autosize'

function Property({ t, property, content, onContentChange }) {
  const [propertyContent, setPropertyContent] = useState()

  useEffect(() => {
    setPropertyContent(content)
  }, [content])

  const handleChange = (e) => {
    setPropertyContent(e.target.value)
    onContentChange(e.target.value, property)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="font-bold">{t(`projects:${property}`)}</div>
      <ReactTextareaAutosize
        maxRows="7"
        className="input-primary"
        placeholder={t(`projects:${property}_placeholder`)}
        value={propertyContent}
        onChange={handleChange}
      />
    </div>
  )
}

export default Property
