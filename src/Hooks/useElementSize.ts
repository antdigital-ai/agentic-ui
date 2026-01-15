import { RefObject, useEffect, useState } from 'react';

export const useElementSize = (element: RefObject<Element | null>) => {
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (!element.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0];
      console.log(entry)
      setSize({
        width: entry.borderBoxSize[0].inlineSize,
        height: entry.borderBoxSize[0].blockSize,
      });
    });
    resizeObserver.observe(element.current);
    return () => {
      resizeObserver.disconnect();
    };
  }, [element]);

  return size;
};
