import classNames from 'classnames';
import React, { startTransition, useEffect, useRef, useState } from 'react';
import { useGetSetState } from 'react-use';
import { CodeNode } from '../../../../MarkdownEditor/el';
import { loadKatex } from '../../../katex/loadKatex';

export const Katex = (props: { el?: CodeNode }) => {
  const [state, setState] = useGetSetState({
    code: '',
    error: '',
  });
  const [katexLoaded, setKatexLoaded] = useState(false);
  const katexRef = useRef<typeof import('katex').default | null>(null);
  const divRef = useRef<HTMLDivElement>(null);
  const timer = useRef(0);

  // 处理未定义的 el
  const safeEl = props.el || { value: '', type: 'code', language: 'katex' };

  // 异步加载 Katex 库和 CSS
  useEffect(() => {
    if (process.env.NODE_ENV === 'test') {
      setKatexLoaded(true);
      return;
    }

    startTransition(() => {
      // 异步加载在 startTransition 外部执行
      (async () => {
        try {
          const katexModule = await loadKatex();
          katexRef.current = katexModule.default;
          setKatexLoaded(true);
        } catch (error) {
          console.error('Failed to load Katex:', error);
          setKatexLoaded(true);
        }
      })();
    });
  }, []);

  useEffect(() => {
    if (!katexLoaded || !katexRef.current) return;

    const code = safeEl.value || '';
    clearTimeout(timer.current);
    timer.current = window.setTimeout(
      () => {
        setState({
          code: code,
        });
        if (state().code) {
          try {
            if (divRef.current && katexRef.current) {
              katexRef.current.render(state().code, divRef.current!, {
                strict: false,
                output: 'htmlAndMathml',
                throwOnError: false,
                displayMode: true,
                macros: {
                  '\\f': '#1f(#2)',
                },
              });
            }
          } catch (e) {}
        } else {
          setState({ error: '' });
        }
      },
      !state().code ? 0 : 300,
    );
    return () => window.clearTimeout(timer.current);
  }, [safeEl, katexLoaded, state]);
  return (
    <div
      style={{
        marginBottom: '0.75em',
        cursor: 'default',
        userSelect: 'none',
        textAlign: 'center',
        backgroundColor: 'rgba(107, 114, 128, 0.05)',
        paddingTop: '1em',
        paddingBottom: '1em',
        borderRadius: '0.25em',
      }}
      contentEditable={false}
    >
      <div
        ref={divRef}
        className={classNames('katex-container', {
          hidden: !state().code.trim(),
        })}
      />
      {!state().code.trim() && (
        <div style={{ textAlign: 'center', color: '#6B7280' }}>Formula</div>
      )}
    </div>
  );
};
