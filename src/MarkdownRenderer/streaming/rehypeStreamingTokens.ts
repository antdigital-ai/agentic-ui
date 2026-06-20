import type { Plugin } from 'unified';

/**
 * 运行期可切换的开关：processor 在流式会话中保持同一实例（避免 chart/代码块
 * 因 processor 变更而卸载重挂），故用一个稳定的可变对象控制是否拆分 token。
 */
export interface StreamingTokenState {
  /** 为 true 时把文本节点拆成 token span，供 GPT 风格逐词淡入动画使用 */
  enabled: boolean;
}

/** token span 的类名：CSS 仅在流式容器内对其应用淡入动画 */
export const STREAM_TOKEN_CLASS = 'stream-token';

/** 这些标签内的文本不拆分（代码、样式、脚本保持原样） */
const SKIP_TAGS = new Set(['code', 'pre', 'style', 'script', 'textarea']);

/** 公式渲染（KaTeX）自带复杂结构，拆分会破坏布局 */
const isMathElement = (node: HastElement): boolean => {
  const className = node.properties?.className;
  if (!className) return false;
  const list = Array.isArray(className) ? className : [String(className)];
  return list.some(
    (cls) => typeof cls === 'string' && cls.toLowerCase().includes('katex'),
  );
};

interface HastText {
  type: 'text';
  value: string;
}

interface HastElement {
  type: 'element';
  tagName: string;
  properties?: Record<string, unknown> & { className?: unknown };
  children?: HastNode[];
}

type HastNode =
  | HastText
  | HastElement
  | { type: string; children?: HastNode[] };

const isText = (node: HastNode): node is HastText =>
  (node as HastText).type === 'text';

const isElement = (node: HastNode): node is HastElement =>
  (node as HastElement).type === 'element';

/** 把文本拆成「连续非空白」与「连续空白」交替的片段，仅非空白片段包裹成 span */
const wrapTextValue = (value: string): HastNode[] => {
  const pieces = value.match(/\s+|\S+/g);
  if (!pieces || pieces.length === 0) return [{ type: 'text', value }];
  // 纯单段空白或无可见字符时无需包裹，减少 DOM 体积
  if (pieces.length === 1 && /^\s+$/.test(pieces[0])) {
    return [{ type: 'text', value }];
  }
  return pieces.map((piece) => {
    if (/^\s+$/.test(piece)) {
      return { type: 'text', value: piece };
    }
    return {
      type: 'element',
      tagName: 'span',
      properties: { className: [STREAM_TOKEN_CLASS] },
      children: [{ type: 'text', value: piece }],
    } as HastElement;
  });
};

const transformChildren = (parent: { children?: HastNode[] }): void => {
  const children = parent.children;
  if (!children || children.length === 0) return;

  const next: HastNode[] = [];
  for (const child of children) {
    if (isText(child)) {
      next.push(...wrapTextValue(child.value));
      continue;
    }
    if (isElement(child)) {
      if (!SKIP_TAGS.has(child.tagName) && !isMathElement(child)) {
        transformChildren(child);
      }
      next.push(child);
      continue;
    }
    // root / 其他容器节点继续向下
    if ((child as { children?: HastNode[] }).children) {
      transformChildren(child as { children?: HastNode[] });
    }
    next.push(child);
  }
  parent.children = next;
};

/**
 * rehype 插件：流式开启时把可见文本拆成 token span，配合 CSS 实现 GPT 风格的
 * 逐词淡入。已渲染的 token 在重解析时按位置复用 DOM、动画不重放，仅新增 token
 * 挂载时各自淡入一次。
 */
export const createStreamingTokenPlugin = (
  state: StreamingTokenState,
): Plugin => {
  return () => (tree: unknown) => {
    if (!state.enabled) return;
    transformChildren(tree as { children?: HastNode[] });
  };
};
