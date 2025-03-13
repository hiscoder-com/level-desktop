import { useEffect, useState } from 'react'

import { calculateRtlDirection } from '@texttree/notepad-rcl'

const getDirection = (text, defaultDirection) => {
  return text ? calculateRtlDirection(text) : defaultDirection
}

export const useRtlInput = (initialValue = '', defaultDirection = 'ltr') => {
  const [value, setValue] = useState(initialValue)
  const [direction, setDirection] = useState(getDirection(initialValue, defaultDirection))

  useEffect(() => {
    setDirection(getDirection(value, defaultDirection))
  }, [value, defaultDirection])

  const handleChange = (event) => {
    const newValue = event.target?.value || ''
    setValue(newValue)
  }

  return { value, setValue, direction, handleChange }
}
