import React, { lazy, Suspense, useEffect, useMemo, useRef } from 'react';
import { useGetSetState } from 'react-use';
import { useIntersectionOnce } from '../../Hooks/useIntersectionOnce';
import { isCodeBlockLikelyComplete } from '../../MarkdownEditor/editor/utils/findMatchingClose';
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
/**
 * 检查 Mermaid 代码是否可能完整
 * 用于流式输入时判断是否应该尝试渲染
 */
const isCodeLikelyComplete = (code: string): boolean => {
  return isCodeBlockLikelyComplete(code, 'mermaid');
};

const MermaidRendererImpl = (props: { element: CodeNode }) => {
  const [state, setState] = useGetSetState({
    code: '',
    error: '',
    isTyping: false, // 是否正在输入中
  });
  const containerRef = useRef<HTMLDivElement>(null);
  const divRef = useRef<HTMLDivElement>(null);
  const timer = useRef<number | null>(null);
  const renderTimer = useRef<number | null>(null); // 实际渲染的定时器
  const mermaidRef = useRef<MermaidApi | null>(null);
  const lastCodeRef = useRef<string>(''); // 记录上一次的代码
  const changeCountRef = useRef<number>(0); // 记录变化次数
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

    // 如果代码没有变化且没有错误，不需要重新渲染
    if (currentState.code === nextCode && currentState.error === '') {
      return undefined;
    }

    // 清理所有定时器
    if (timer.current !== null) {
      window.clearTimeout(timer.current);
      timer.current = null;
    }
    if (renderTimer.current !== null) {
      window.clearTimeout(renderTimer.current);
      renderTimer.current = null;
    }

    if (!nextCode) {
      timer.current = window.setTimeout(() => {
        setState({ code: '', error: '', isTyping: false });
        if (divRef.current) {
          divRef.current.innerHTML = '';
        }
        lastCodeRef.current = '';
        changeCountRef.current = 0;
        timer.current = null;
      }, 0);
      return () => {
        if (timer.current !== null) {
          window.clearTimeout(timer.current);
          timer.current = null;
        }
      };
    }

    // 检测代码是否在快速变化（流式输入）
    const isCodeChanging = nextCode !== lastCodeRef.current;
    if (isCodeChanging) {
      changeCountRef.current += 1;
      lastCodeRef.current = nextCode;
      // 如果代码在快速变化，标记为正在输入
      setState({ isTyping: true });
    }

    // 检查代码是否可能完整
    const likelyComplete = isCodeLikelyComplete(nextCode);

    // 防抖延迟：根据代码变化频率动态调整
    // 如果代码变化频繁（流式输入），使用更长的延迟以减少抖动
    const baseDelay = 500; // 增加基础延迟
    const typingDelay = changeCountRef.current > 3 ? 1500 : 1200; // 频繁变化时延长到 1.5 秒
    const delay = currentState.code
      ? likelyComplete
        ? baseDelay
        : typingDelay
      : 0;

    // 第一层防抖：检测代码变化
    timer.current = window.setTimeout(() => {
      // 再次检查代码是否还在变化
      const finalCode = props.element.value || '';
      if (finalCode !== nextCode) {
        // 代码还在变化，重新调度
        timer.current = null;
        return;
      }

      // 第二层防抖：实际渲染
      // 如果代码可能不完整，再等待一段时间，增加延迟以减少抖动
      const finalDelay = likelyComplete ? 200 : 800; // 增加延迟时间
      renderTimer.current = window.setTimeout(async () => {
        try {
          const api = mermaidRef.current ?? (await loadMermaid());
          mermaidRef.current = api;

          // 验证代码是否完整（基本检查）
          const trimmedCode = nextCode.trim();
          if (!trimmedCode) {
            setState({ code: '', error: '' });
            if (divRef.current) {
              divRef.current.innerHTML = '';
            }
            timer.current = null;
            return;
          }

          const { svg } = await api.render(id, trimmedCode);

          if (divRef.current) {
            // 使用更平滑的更新方式，避免抖动
            // 先设置透明度，然后更新内容，最后恢复透明度
            const container = divRef.current;

            // 如果已有内容，先淡出
            if (container.children.length > 0) {
              container.style.opacity = '0';
              container.style.transition = 'opacity 0.2s ease-in-out';
            }

            // 使用 requestAnimationFrame 确保平滑更新
            requestAnimationFrame(() => {
              // 清理旧内容
              container.innerHTML = '';

              // 创建隔离的容器包装 SVG
              const wrapper = document.createElement('div');
              wrapper.style.cssText = `
                position: relative;
                width: 100%;
                max-width: 100%;
                overflow: hidden;
                isolation: isolate;
                contain: layout style paint;
                display: flex;
                justify-content: center;
                align-items: center;
                min-height: 200px; /* 保持最小高度，避免尺寸抖动 */
              `;

              // 解析 SVG 并添加隔离属性
              const parser = new DOMParser();
              const svgDoc = parser.parseFromString(svg, 'image/svg+xml');
              const svgElement = svgDoc.querySelector('svg');

              if (svgElement) {
                // 确保 SVG 不会溢出
                const existingStyle = svgElement.getAttribute('style') || '';
                const newStyle =
                  `${existingStyle}; max-width: 100%; height: auto; overflow: hidden;`.trim();
                svgElement.setAttribute('style', newStyle);

                // 添加隔离属性和类名
                svgElement.setAttribute('data-mermaid-svg', 'true');
                svgElement.setAttribute(
                  'class',
                  (svgElement.getAttribute('class') || '') +
                    ' mermaid-isolated',
                );

                // 限制 SVG 内部元素的样式影响范围
                const allElements = svgElement.querySelectorAll('*');
                allElements.forEach((el) => {
                  // 确保内部元素不会影响外部
                  if (el instanceof SVGElement) {
                    el.setAttribute('data-mermaid-internal', 'true');
                  }
                });

                wrapper.appendChild(svgElement);
              } else {
                // 如果解析失败，直接使用原始 SVG，但添加包装
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = svg;
                const extractedSvg = tempDiv.querySelector('svg');
                if (extractedSvg) {
                  extractedSvg.setAttribute(
                    'style',
                    'max-width: 100%; height: auto; overflow: hidden;',
                  );
                  extractedSvg.setAttribute('data-mermaid-svg', 'true');
                  wrapper.appendChild(extractedSvg);
                } else {
                  wrapper.innerHTML = svg;
                }
              }

              container.appendChild(wrapper);

              // 恢复透明度，实现淡入效果
              requestAnimationFrame(() => {
                container.style.opacity = '1';
                container.style.transition = 'opacity 0.3s ease-in-out';
              });
            });
          }

          // 渲染成功，重置状态
          setState({
            code: nextCode,
            error: '',
            isTyping: false,
          });
          changeCountRef.current = 0; // 重置变化计数
        } catch (error) {
          const api = mermaidRef.current;
          const finalCode = props.element.value || '';

          // 如果代码还在变化中，不显示错误（可能是中间状态）
          if (finalCode !== nextCode || state().isTyping) {
            // 代码还在变化，可能是流式输入，不显示错误
            renderTimer.current = null;
            return;
          }

          // 代码已稳定，检查是否是真正的语法错误
          if (api) {
            try {
              await api.parse(finalCode);
              // 如果能解析，说明可能是渲染问题，不显示错误
              renderTimer.current = null;
              return;
            } catch (parseError) {
              // 确实是语法错误，但只在代码稳定后显示
              if (finalCode === nextCode && !state().isTyping) {
                setState({
                  error: String(parseError),
                  code: '',
                  isTyping: false,
                });
                // 确保清理渲染内容
                if (divRef.current) {
                  divRef.current.innerHTML = '';
                }
              }
              renderTimer.current = null;
              return;
            }
          }

          // 其他错误，只在代码稳定后显示
          if (finalCode === nextCode && !state().isTyping) {
            setState({
              error: String(error),
              code: '',
              isTyping: false,
            });
            // 确保清理渲染内容
            if (divRef.current) {
              divRef.current.innerHTML = '';
            }
          }
        } finally {
          // 清理 Mermaid 生成的临时元素
          const tempElement = document.querySelector('#d' + id);
          if (tempElement) {
            tempElement.classList.add('hidden');
            // 尝试移除临时元素，避免 DOM 污染
            try {
              if (tempElement.parentNode) {
                tempElement.parentNode.removeChild(tempElement);
              }
            } catch (e) {
              // 忽略移除失败
            }
          }
          renderTimer.current = null;
        }
        timer.current = null;
      }, finalDelay);
    }, delay);

    return () => {
      if (timer.current !== null) {
        window.clearTimeout(timer.current);
        timer.current = null;
      }
      if (renderTimer.current !== null) {
        window.clearTimeout(renderTimer.current);
        renderTimer.current = null;
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
        // 增加隔离：防止内容溢出影响其他元素
        position: 'relative',
        isolation: 'isolate', // CSS isolation 属性，创建新的堆叠上下文
        contain: 'layout style paint', // CSS containment，限制布局和样式的影响范围
        overflow: 'hidden', // 防止内容溢出
      }}
      contentEditable={false}
    >
      {/* 渲染容器：增加多层隔离 */}
      <div
        contentEditable={false}
        ref={divRef}
        style={{
          width: '100%',
          maxWidth: '100%',
          minHeight: '200px', // 保持最小高度，避免尺寸抖动
          display: 'flex',
          justifyContent: 'center',
          visibility: snapshot.code && !snapshot.error ? 'visible' : 'hidden',
          // 增加隔离样式
          position: 'relative',
          isolation: 'isolate',
          contain: 'layout style paint',
          overflow: 'hidden',
          // 防止 SVG 样式影响外部
          pointerEvents: snapshot.code && !snapshot.error ? 'auto' : 'none',
          // 添加过渡效果，使更新更平滑
          transition: 'opacity 0.3s ease-in-out, min-height 0.2s ease-in-out',
        }}
        // 使用 data 属性标记，方便样式隔离
        data-mermaid-container="true"
      ></div>
      {/* 正在输入时显示提示，不显示错误 */}
      {snapshot.isTyping && !snapshot.code && (
        <div
          style={{
            textAlign: 'center',
            color: '#6B7280',
            padding: '0.5rem',
            position: 'relative',
            zIndex: 1,
            fontStyle: 'italic',
          }}
        >
          正在加载...
        </div>
      )}
      {/* 只在非输入状态且确实有错误时显示错误 */}
      {snapshot.error && !snapshot.isTyping && (
        <div
          style={{
            textAlign: 'center',
            color: 'rgba(239, 68, 68, 0.8)',
            padding: '0.5rem',
            // 错误信息也增加隔离
            position: 'relative',
            zIndex: 1,
            wordBreak: 'break-word',
            maxWidth: '100%',
          }}
        >
          {snapshot.error}
        </div>
      )}
      {!snapshot.code && !snapshot.error && !snapshot.isTyping && (
        <div
          style={{
            textAlign: 'center',
            color: '#6B7280',
            padding: '0.5rem',
            position: 'relative',
            zIndex: 1,
          }}
        >
          Empty
        </div>
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
