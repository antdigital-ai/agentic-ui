/**
 * 懒加载 PDF 跳转工具函数
 * 用于处理懒加载场景下的段落定位和强制加载
 */

import React, { useEffect, useRef, useState } from 'react';

/**
 * 获取元素相对于容器的偏移量
 */
export const getOffsetTop = (
  element: HTMLElement,
  container: HTMLElement,
): number => {
  let offsetTop = 0;
  let currentElement: HTMLElement | null = element;

  while (currentElement && currentElement !== container) {
    offsetTop += currentElement.offsetTop;
    currentElement = currentElement.offsetParent as HTMLElement;
  }

  return offsetTop;
};

/**
 * 滚动到指定段落并强制加载（如果是占位符）
 *
 * @param paragraphId - 段落唯一ID
 * @param options - 配置选项
 * @returns 是否找到目标元素
 *
 * @example
 * ```tsx
 * // 基本使用
 * scrollToAndLoadParagraph('para-1');
 *
 * // 自定义容器
 * scrollToAndLoadParagraph('para-1', {
 *   containerRef: editorContainerRef
 * });
 *
 * // 自定义加载回调
 * scrollToAndLoadParagraph('para-1', {
 *   onLoad: (id) => console.log(`段落 ${id} 已加载`),
 * });
 * ```
 */
export const scrollToAndLoadParagraph = (
  paragraphId: string,
  options?: {
    /** 滚动容器的 ref */
    containerRef?: React.RefObject<HTMLElement | null>;
    /** 滚动动画持续时间（ms） */
    scrollDuration?: number;
    /** 强制加载延迟（ms），等待滚动动画完成 */
    forceLoadDelay?: number;
    /** 加载完成回调 */
    onLoad?: (paragraphId: string) => void;
    /** 是否启用滚动抖动（触发 IntersectionObserver） */
    enableScrollJitter?: boolean;
  },
): boolean => {
  const {
    containerRef,
    forceLoadDelay = 600,
    onLoad,
    enableScrollJitter = true,
  } = options || {};

  // 1. 查找目标元素（可能是占位符或实际内容）
  const targetElement = document.querySelector(
    `[data-content-id="${paragraphId}"]`,
  ) as HTMLElement;

  if (!targetElement) {
    console.warn(`未找到 ID 为 "${paragraphId}" 的段落`);
    return false;
  }

  const container = containerRef?.current;
  const isPlaceholder = targetElement.dataset.placeholder === 'true';

  console.log(`跳转到段落: ${paragraphId}, 是否为占位符: ${isPlaceholder}`);

  // 2. 滚动到目标位置（居中）
  if (container) {
    const offsetTop = getOffsetTop(targetElement, container);
    const containerHeight = container.clientHeight;
    const targetHeight = targetElement.clientHeight;

    // 计算滚动位置，使目标元素位于容器中间
    const scrollPosition = offsetTop - containerHeight / 2 + targetHeight / 2;

    container.scrollTo({
      top: Math.max(0, scrollPosition),
      behavior: 'smooth',
    });
  } else {
    targetElement.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    });
  }

  // 3. 如果是占位符，强制触发加载
  if (isPlaceholder) {
    console.log(`准备强制加载占位符: ${paragraphId}`);

    // 方案1: 触发自定义事件
    setTimeout(() => {
      const event = new CustomEvent('forceLoad', {
        bubbles: true,
        detail: { paragraphId },
      });
      targetElement.dispatchEvent(event);
      console.log(`已触发强制加载事件: ${paragraphId}`);
      onLoad?.(paragraphId);
    }, forceLoadDelay);

    // 方案2: 使用微小滚动抖动触发 IntersectionObserver（可选）
    if (enableScrollJitter) {
      setTimeout(() => {
        if (container) {
          const currentScroll = container.scrollTop;
          container.scrollTo({ top: currentScroll + 1 });
          setTimeout(() => {
            container.scrollTo({ top: currentScroll });
          }, 50);
        } else {
          window.scrollBy(0, 1);
          setTimeout(() => window.scrollBy(0, -1), 50);
        }
      }, forceLoadDelay + 50);
    }
  }

  return true;
};

/**
 * 自定义占位符组件（支持强制加载）
 */
export const ForceLoadPlaceholder: React.FC<{
  paragraphId: string;
  paragraphIndex: number;
  height: number;
  isIntersecting: boolean;
  style: React.CSSProperties;
  onForceLoad?: (id: string) => void;
}> = ({
  paragraphId,
  paragraphIndex,
  height,
  isIntersecting,
  style,
  onForceLoad,
}) => {
  const placeholderRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const handleForceLoad = (e: Event) => {
      const customEvent = e as CustomEvent;
      const targetId = customEvent.detail?.paragraphId;

      if (targetId === paragraphId) {
        console.log(`占位符 ${paragraphId} 收到强制加载事件`);
        setIsLoading(true);
        onForceLoad?.(paragraphId);

        // 模拟加载延迟
        setTimeout(() => {
          setIsLoading(false);
        }, 500);
      }
    };

    const element = placeholderRef.current;
    if (element) {
      element.addEventListener('forceLoad', handleForceLoad);
      return () => {
        element.removeEventListener('forceLoad', handleForceLoad);
      };
    }
  }, [paragraphId, onForceLoad]);

  return (
    <div
      ref={placeholderRef}
      style={{
        ...style,
        height,
        minHeight: height,
        border: '2px dashed #d9d9d9',
        borderRadius: 8,
        backgroundColor: isLoading ? '#e6f7ff' : '#fafafa',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        transition: 'all 0.3s',
      }}
      data-content-id={paragraphId}
      data-placeholder="true"
      className="pml-item pml-placeholder"
    >
      {isLoading ? (
        <div style={{ color: '#1890ff', fontSize: '14px' }}>
          🔄 强制加载中...
        </div>
      ) : (
        <>
          <div
            style={{
              color: isIntersecting ? '#52c41a' : '#999',
              fontSize: '14px',
              marginBottom: 8,
            }}
          >
            {isIntersecting ? '🔄 正在加载...' : '💤 等待加载'}
          </div>
          <div style={{ color: '#bbb', fontSize: '12px' }}>
            段落 #{paragraphIndex + 1}
          </div>
          <div
            style={{
              color: '#ddd',
              fontSize: '11px',
              fontFamily: 'monospace',
              marginTop: 4,
            }}
          >
            ID: {paragraphId}
          </div>
        </>
      )}
    </div>
  );
};

/**
 * 批量绑定段落 ID 到元素
 *
 * @example
 * ```tsx
 * <BaseMarkdownEditor
 *   eleItemRender={(eleProps, defaultDom) => {
 *     return bindParagraphId(eleProps, defaultDom, paragraphIdList);
 *   }}
 * />
 * ```
 */
export const bindParagraphId = (
  eleProps: any,
  defaultDom: React.ReactElement,
  paragraphIdList: string[],
): React.ReactElement => {
  const elementIndex = eleProps.element?.index;
  const paragraphId = paragraphIdList[elementIndex] || '';

  return (
    <div data-content-id={paragraphId} className="pml-item">
      {defaultDom}
    </div>
  );
};
