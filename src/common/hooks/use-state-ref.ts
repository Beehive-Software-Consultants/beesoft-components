import { useRef, useState } from 'react';

const useStateRef = <T>(initialState?: T) => {
  const [state, setState] = useState(initialState);
  const ref = useRef(initialState);

  if (ref.current !== state) ref.current = state;

  return [state, setState, ref] as const;
};

export { useStateRef };
