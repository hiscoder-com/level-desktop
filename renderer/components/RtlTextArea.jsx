import { useEffect, useRef } from 'react'

import { useRtlInput } from '@/hooks/useRtlInput'

function RtlTextArea({
  value,
  onChange,
  autoFocus = false,
  className = '',
  defaultDirection,
}) {
  const {
    value: inputValue,
    handleChange,
    direction,
  } = useRtlInput(value, defaultDirection)
  const textAreaRef = useRef(null)

  useEffect(() => {
    if (textAreaRef.current) {
      textAreaRef.current.style.height = 'inherit'
      textAreaRef.current.style.height = `${textAreaRef.current.scrollHeight}px`
    }
  }, [inputValue])

  const handleInputChange = (event) => {
    const newValue = event.target.value
      .replace(/  +/g, ' ')
      .replace(/ +([\.\,\)\!\?\;\:])/g, '$1')
      .trim()

    handleChange(event)
    onChange(newValue)

    event.target.style.height = 'inherit'
    event.target.style.height = `${event.target.scrollHeight}px`
  }

  return (
    <textarea
      ref={textAreaRef}
      autoFocus={autoFocus}
      rows={1}
      className={`resize-none ${className} ${inputValue.trim() === '' ? 'bg-th-secondary-100' : ''} `}
      value={inputValue}
      onChange={handleInputChange}
      dir={direction}
    />
  )
}

export default RtlTextArea
