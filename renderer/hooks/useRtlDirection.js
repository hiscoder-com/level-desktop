import { useState, useEffect } from 'react';
import { calculateRtlDirection } from '../helpers';

const useRtlDirection = (text) => {
  const [direction, setDirection] = useState('ltr');

  useEffect(() => {
    setDirection(calculateRtlDirection(text));
  }, [text]);

  return direction;
};

export default useRtlDirection;
