import React, { lazy, Suspense, useEffect, useMemo, useRef } from 'react';
import { useGetSetState } from 'react-use';
import { useIntersectionOnce } from '../../Hooks/useIntersectionOnce';
import { CodeNode } from '../../MarkdownEditor/el';

type MermaidApi = typeof import('mermaid').default;

let mermaidLoader: Promise<MermaidApi> | null = null;

/**
 * 加载 Mermaid 库
 * 使用单例模式确保只加载一次，并初始化配置
 */
export const loadMermaid = async (): Promise<MermaidApi> => {
  if (typeof window === 'undefined') {
    throw new Error('Mermaid 仅在浏览器环境中可用');
  }

  if (!mermaidLoader) {
    // 使用 webpack 魔法注释确保正确代码分割和解析
    // webpackChunkName 指定 chunk 名称，webpackMode 指定加载模式
    mermaidLoader = import(
      /* webpackChunkName: "mermaid" */
      /* webpackMode: "lazy" */
      'mermaid'
    )
      .then((module) => {
        const api = module.default;
        if (api?.initialize) {
          api.initialize({ startOnLoad: false });
        }
        return api;
      })
      .catch((error) => {
        mermaidLoader = null;
        throw error;
      });
  }

  return mermaidLoader;
};

/**
 * Mermaid 渲染器组件实现
 * 负责实际的图表渲染逻辑
 */
const MermaidRendererImpl = (props: { element: CodeNode }) => {
  const [state, setState] = useGetSetState({
    code: '',
    error: '',
  });
  const containerRef = useRef<HTMLDivElement>(null);
  const divRef = useRef<HTMLDivElement>(null);
  const timer = useRef<number | null>(null);
  const mermaidRef = useRef<MermaidApi | null>(null);
  const id = useMemo(
    () => 'm' + (Date.now() + Math.ceil(Math.random() * 1000)),
    [],
  );
  const isVisible = useIntersectionOnce(containerRef);

  useEffect(() => {
    const nextCode = props.element.value || '';
    const currentState = state();

    if (!isVisible) {
      return undefined;
    }

    if (currentState.code === nextCode && currentState.error === '') {
      return undefined;
    }

    if (timer.current !== null) {
      window.clearTimeout(timer.current);
      timer.current = null;
    }

    if (!nextCode) {
      timer.current = window.setTimeout(() => {
        setState({ code: '', error: '' });
        if (divRef.current) {
          divRef.current.innerHTML = '';
        }
        timer.current = null;
      }, 0);
      return () => {
        if (timer.current !== null) {
          window.clearTimeout(timer.current);
          timer.current = null;
        }
      };
    }

    const delay = currentState.code ? 300 : 0;

    timer.current = window.setTimeout(async () => {
      try {
        const api = mermaidRef.current ?? (await loadMermaid());
        mermaidRef.current = api;
        const { svg } = await api.render(id, nextCode);
        if (divRef.current) {
          divRef.current.innerHTML = svg;
        }
        setState({ code: nextCode, error: '' });
      } catch (error) {
        const api = mermaidRef.current;
        if (api) {
          try {
            await api.parse(nextCode);
          } catch (parseError) {
            setState({ error: String(parseError), code: '' });
            return;
          }
        }
        setState({ error: String(error), code: '' });
      } finally {
        document.querySelector('#d' + id)?.classList.add('hidden');
      }
      timer.current = null;
    }, delay);

    return () => {
      if (timer.current !== null) {
        window.clearTimeout(timer.current);
        timer.current = null;
      }
    };
  }, [props?.element?.value, id, isVisible, setState, state]);

  const snapshot = state();

  return (
    <div
      ref={containerRef}
      style={{
        marginBottom: '0.75em',
        cursor: 'default',
        userSelect: 'none',
        padding: '0.75rem 0',
        borderRadius: '1em',
        display: 'flex',
        justifyContent: 'center',
      }}
      contentEditable={false}
    >
      <div
        contentEditable={false}
        ref={divRef}
        style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          visibility: snapshot.code && !snapshot.error ? 'visible' : 'hidden',
        }}
      ></div>
      {snapshot.error && (
        <div style={{ textAlign: 'center', color: 'rgba(239, 68, 68, 0.8)' }}>
          {snapshot.error}
        </div>
      )}
      {!snapshot.code && !snapshot.error && (
        <div style={{ textAlign: 'center', color: '#6B7280' }}>Empty</div>
      )}
    </div>
  );
};

/**
 * Mermaid 渲染器组件
 * 使用 React.lazy 延迟加载，仅在需要时加载 mermaid 库
 */
const MermaidRenderer = lazy(async () => {
  await loadMermaid();
  return { default: MermaidRendererImpl };
});

/**
 * 加载中的占位组件
 */
const MermaidFallback = () => (
  <div
    style={{
      marginBottom: '0.75em',
      padding: '0.75rem 0',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      color: '#6B7280',
    }}
  >
    加载中...
  </div>
);

/**
 * Mermaid 组件 - Mermaid图表渲染组件
 *
 * 该组件使用Mermaid库渲染图表，支持流程图、时序图、甘特图等。
 * 使用 React.lazy 和 Suspense 实现代码分割和延迟加载，优化性能。
 *
 * @component
 * @description Mermaid图表渲染组件，支持各种Mermaid图表类型
 * @param {Object} props - 组件属性
 * @param {CodeNode} props.element - 代码节点，包含Mermaid图表代码
 * @param {string} [props.element.value] - Mermaid图表代码字符串
 *
 * @example
 * ```tsx
 * <Mermaid
 *   element={{
 *     type: 'code',
 *     value: 'graph TD\nA[开始] --> B[处理] --> C[结束]'
 *   }}
 * />
 * ```
 *
 * @returns {React.ReactElement} 渲染的Mermaid图表组件
 *
 * @remarks
 * - 基于Mermaid库实现图表渲染
 * - 支持多种图表类型（流程图、时序图、甘特图等）
 * - 使用 React.lazy 和 Suspense 实现代码分割
 * - 提供延迟渲染优化性能
 * - 包含错误处理机制
 * - 支持空状态显示
 * - 提供美观的样式设计
 * - 禁用文本选择
 * - 居中显示图表
 * - 自动生成唯一ID
 */
export const Mermaid = (props: { element: CodeNode }) => {
  const isBrowser = typeof window !== 'undefined';

  if (!isBrowser) {
    return null;
  }

  return (
    <Suspense fallback={<MermaidFallback />}>
      <MermaidRenderer element={props.element} />
    </Suspense>
  );
};
