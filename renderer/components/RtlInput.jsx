import { useEffect } from 'react'

import { useRtlInput } from '@/hooks/useRtlInput'

function RtlInput({
  value,
  onChange,
  placeholder,
  readOnly,
  className = '',
  defaultDirection = 'ltr',
}) {
  const {
    value: inputValue,
    handleChange,
    direction,
  } = useRtlInput(value, defaultDirection)

  useEffect(() => {
    if (value !== inputValue) {
      handleChange({ target: { value } })
    }
  }, [value, inputValue, handleChange])

  const handleInputChange = (event) => {
    handleChange(event)
    onChange(event.target.value)
  }

  return (
    <input
      className={className}
      value={inputValue}
      onChange={handleInputChange}
      placeholder={placeholder}
      readOnly={readOnly}
      dir={direction}
    />
  )
}

export default RtlInput
