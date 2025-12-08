import React, { useEffect, useRef, useState } from 'react';
import type { MermaidApi } from './types';
import { cleanupTempElement, loadMermaid, renderSvgToContainer } from './utils';

/**
 * Mermaid 渲染 Hook
 */
export const useMermaidRender = (
  code: string,
  divRef: React.RefObject<HTMLDivElement>,
  id: string,
  isVisible: boolean,
) => {
  const timer = useRef<number | null>(null);
  const mermaidRef = useRef<MermaidApi | null>(null);
  const renderedCodeRef = useRef<string>('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (!isVisible || renderedCodeRef.current === code) {
      return;
    }

    if (timer.current) {
      window.clearTimeout(timer.current);
    }

    if (!code) {
      renderedCodeRef.current = '';
      setError('');
      if (divRef.current) {
        divRef.current.innerHTML = '';
      }
      return;
    }

    const currentCode = code;
    timer.current = window.setTimeout(async () => {
      if (code !== currentCode) {
        timer.current = null;
        return;
      }

      try {
        const api = mermaidRef.current ?? (await loadMermaid());
        mermaidRef.current = api;

        const trimmedCode = code.trim();
        if (!trimmedCode) {
          renderedCodeRef.current = '';
          setError('');
          if (divRef.current) {
            divRef.current.innerHTML = '';
          }
          timer.current = null;
          return;
        }

        const { svg } = await api.render(id, trimmedCode);
        if (divRef.current) {
          renderSvgToContainer(svg, divRef.current);
        }

        renderedCodeRef.current = code;
        setError('');
      } catch (err) {
        if (code === currentCode) {
          setError(String(err));
          renderedCodeRef.current = '';
          if (divRef.current) {
            divRef.current.innerHTML = '';
          }
        }
      } finally {
        cleanupTempElement(id);
        timer.current = null;
      }
    }, 500);

    return () => {
      if (timer.current) {
        window.clearTimeout(timer.current);
        timer.current = null;
      }
    };
  }, [code, id, isVisible]);

  return { error, renderedCode: renderedCodeRef.current };
};
