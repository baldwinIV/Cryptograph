import { useEffect, useRef } from 'react';

export default function useInterval(callback: () => unknown, delay: number) {
  const savedCallback = useRef(callback); // 최근에 들어온 callback을 저장할 ref를 하나 만든다.

  useEffect(() => {
    savedCallback.current = callback; // callback이 바뀔 때마다 ref를 업데이트 해준다.
  }, [callback]);

  useEffect(() => {
    const executeCallback = () => {
      savedCallback.current();
    };
    if (!!delay) {
      const timerId = setInterval(executeCallback, delay);
      return () => clearInterval(timerId);
    }
  }, []);
}
