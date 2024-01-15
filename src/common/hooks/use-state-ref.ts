import { Dispatch, MutableRefObject, SetStateAction, useRef, useState } from 'react';

type UseStateRef = {
  <T>(initialState: T): [T, Dispatch<SetStateAction<T>>, MutableRefObject<T>];
  <T = undefined>(): [T | undefined, Dispatch<SetStateAction<T | undefined>>, MutableRefObject<T | undefined>];
};

const useStateRef: UseStateRef = <T>(initialState?: T) => {
  const [state, setState] = useState(initialState);
  const ref = useRef(initialState);

  if (ref.current !== state) ref.current = state;

  return [state, setState, ref];
};

export { useStateRef };
