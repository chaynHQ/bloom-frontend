import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { selectCurrent } from '../app/currentSlice';

export const useCurrent = () => {
  const current = useSelector(selectCurrent);

  return useMemo(() => ({ current }), [current]);
};
