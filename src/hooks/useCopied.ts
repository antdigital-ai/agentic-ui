import { useCallback, useEffect, useMemo, useState } from 'react';

export const useCopied = () => {
  const [copied, setCopy] = useState(false);

  useEffect(() => {
    if (!copied) return;

    const timer = setTimeout(() => {
      setCopy(false);
    }, 1000);

    return () => {
      if (typeof clearTimeout !== 'undefined') {
        clearTimeout(timer);
      }
    };
  }, [copied]);

  const setCopied = useCallback(() => setCopy(true), []);

  return useMemo(() => ({ copied, setCopied }), [copied]);
};
