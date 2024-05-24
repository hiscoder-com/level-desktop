import { useEffect, useState } from 'react'

import ReactTextareaAutosize from 'react-textarea-autosize'

function Property({ t, property, content, updateProperty }) {
  const [propertyContent, setPropertyContent] = useState()
  useEffect(() => {
    setPropertyContent(content)
  }, [content])

  return (
    <div className="flex flex-col gap-4">
      <div className="font-bold">{t(`projects:${property}`)}</div>
      <ReactTextareaAutosize
        maxRows="7"
        className="input-primary"
        placeholder={t(`projects:${property}_placeholder`)}
        value={propertyContent}
        onChange={(e) => setPropertyContent(e.target.value)}
        onBlur={() => updateProperty(propertyContent, property)}
      />
    </div>
  )
}

export default Property
