import classNames from 'classnames';
import React, { startTransition, useEffect, useRef, useState } from 'react';
import { useGetSetState } from 'react-use';
import { CodeNode } from '../../MarkdownEditor/el';
import { loadKatex } from './loadKatex';

/**
 * Katex 组件 - KaTeX 数学公式渲染组件
 *
 * 该组件使用KaTeX库渲染数学公式，支持LaTeX语法，提供错误处理和延迟渲染。
 * 包含公式渲染、错误状态管理、占位符显示等功能。
 *
 * @component
 * @description KaTeX 数学公式渲染组件，支持LaTeX语法渲染
 * @param {Object} props - 组件属性
 * @param {CodeNode} props.el - 代码节点，包含公式内容
 * @param {string} [props.el.value] - LaTeX公式字符串
 *
 * @example
 * ```tsx
 * <Katex
 *   el={{
 *     type: 'code',
 *     value: '\\sum_{i=1}^{n} x_i = x_1 + x_2 + \\cdots + x_n'
 *   }}
 * />
 * ```
 *
 * @returns {React.ReactElement} 渲染的数学公式组件
 *
 * @remarks
 * - 基于KaTeX库实现数学公式渲染
 * - 支持LaTeX数学语法
 * - 提供延迟渲染优化性能
 * - 包含错误处理机制
 * - 支持占位符显示
 * - 提供美观的样式设计
 * - 禁用文本选择
 * - 居中显示公式
 */
export const Katex = (props: { el: CodeNode }) => {
  const [state, setState] = useGetSetState({
    code: '',
    error: '',
  });
  const [katexLoaded, setKatexLoaded] = useState(false);
  const katexRef = useRef<typeof import('katex').default | null>(null);
  const divRef = useRef<HTMLDivElement>(null);
  const timer = useRef(0);

  // 异步加载 Katex 库和 CSS
  useEffect(() => {
    if (process.env.NODE_ENV === 'test') {
      // 测试环境跳过加载
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
          // 即使加载失败也设置 loaded，避免无限加载
          setKatexLoaded(true);
        }
      })();
    });
  }, []);

  useEffect(() => {
    if (!katexLoaded || !katexRef.current) return;

    const code = props.el.value || '';
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
  }, [props.el, katexLoaded, state]);
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
