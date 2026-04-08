import React, { useEffect, useMemo, useRef, useState } from 'react';
import type { MermaidApi } from './types';
import {
  applyMermaidTheme,
  cleanupTempElement,
  createMermaidThemeConfig,
  loadMermaid,
  renderSvgToContainer,
} from './utils';
import type { MermaidThemeToken } from './utils';

/**
 * Mermaid 渲染 Hook
 */
export const useMermaidRender = (
  code: string,
  divRef: React.RefObject<HTMLDivElement>,
  id: string,
  isVisible: boolean,
  themeToken?: MermaidThemeToken,
) => {
  const timer = useRef<number | null>(null);
  const mermaidRef = useRef<MermaidApi | null>(null);
  const renderedSignatureRef = useRef<string>('');
  const latestRenderSignatureRef = useRef<string>('');
  const appliedThemeCacheKeyRef = useRef<string>('');
  const [error, setError] = useState<string>('');
  const [renderedCode, setRenderedCode] = useState<string>('');
  const themeConfig = useMemo(
    () => createMermaidThemeConfig(themeToken),
    [
      themeToken?.colorBgContainer,
      themeToken?.colorBgElevated,
      themeToken?.colorBorder,
      themeToken?.colorPrimary,
      themeToken?.colorText,
      themeToken?.colorTextSecondary,
      themeToken?.fontFamily,
    ],
  );
  const renderSignature = `${themeConfig.cacheKey}::${code}`;
  latestRenderSignatureRef.current = renderSignature;

  useEffect(() => {
    if (!isVisible || renderedSignatureRef.current === renderSignature) {
      return;
    }

    if (timer.current) {
      window.clearTimeout(timer.current);
    }

    if (!code) {
      renderedSignatureRef.current = '';
      setRenderedCode('');
      setError('');
      if (divRef.current) {
        divRef.current.innerHTML = '';
      }
      return;
    }

    const currentSignature = renderSignature;
    timer.current = window.setTimeout(async () => {
      if (latestRenderSignatureRef.current !== currentSignature) {
        timer.current = null;
        return;
      }

      try {
        const api = mermaidRef.current ?? (await loadMermaid());
        mermaidRef.current = api;
        if (appliedThemeCacheKeyRef.current !== themeConfig.cacheKey) {
          applyMermaidTheme(api, themeConfig);
          appliedThemeCacheKeyRef.current = themeConfig.cacheKey;
        }

        const trimmedCode = code.trim();
        if (!trimmedCode) {
          renderedSignatureRef.current = '';
          setRenderedCode('');
          setError('');
          if (divRef.current) {
            divRef.current.innerHTML = '';
          }
          timer.current = null;
          return;
        }

        const { svg } = await api.render(
          id,
          trimmedCode.endsWith('```') ? trimmedCode : trimmedCode,
        );

        if (latestRenderSignatureRef.current !== currentSignature) {
          timer.current = null;
          return;
        }

        if (divRef.current) {
          renderSvgToContainer(svg, divRef.current);
        }

        renderedSignatureRef.current = currentSignature;
        setRenderedCode(code);
        setError('');
      } catch (err) {
        if (latestRenderSignatureRef.current === currentSignature) {
          setError(String(err));
          renderedSignatureRef.current = currentSignature;
          setRenderedCode(code);
          if (divRef.current) {
            divRef.current.innerHTML = '';
          }
        }
      } finally {
        cleanupTempElement(id);
        timer.current = null;
      }
    }, 100);

    return () => {
      if (timer.current) {
        window.clearTimeout(timer.current);
        timer.current = null;
      }
    };
  }, [code, id, isVisible, renderSignature, themeConfig, divRef]);

  return { error, renderedCode };
};
