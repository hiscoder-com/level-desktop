import { useEffect, useState } from 'react'

import { calculateRtlDirection } from '@texttree/notepad-rcl'

export const useRtlInput = (initialValue = '') => {
  const [value, setValue] = useState(initialValue)
  const [direction, setDirection] = useState('ltr')

  useEffect(() => {
    setDirection(calculateRtlDirection(value))
  }, [value])

  const handleChange = (event) => {
    const newValue = event.target.value
    setValue(newValue)
    setDirection(calculateRtlDirection(newValue))
  }

  return { value, setValue, direction, handleChange }
}
