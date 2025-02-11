import { useRtlInput } from '@/hooks/useRtlInput'

function RtlInput({ value, onChange, placeholder, readOnly, className = '' }) {
  const { value: inputValue, handleChange, direction } = useRtlInput(value)

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
