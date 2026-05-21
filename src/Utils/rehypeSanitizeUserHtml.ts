/**
 * rehype 插件：清理用户输入中的危险 HTML，防止页面布局错乱和 XSS 攻击。
 *
 * 在 rehypeRaw 之后使用，对 hast 树执行：
 * 1. 移除 doctype 声明
 * 2. 完全移除危险元素（script、style 等）及其子节点
 * 3. 解包结构性元素（html、head、body 等），保留子节点
 * 4. 保留 GFM 任务列表的 input[type=checkbox]，移除其他 input
 * 5. 媒体/链接类元素若含 on* 事件、javascript: URL 或非法 HTML URL，降级为纯文本
 * 6. 其余元素仅清理危险属性（on* 事件、javascript: URL）
 */

import {
  hasDangerousUrlScheme,
  serializeHastElement,
  shouldElementRenderAsPlainText,
} from './htmlUrlSafety';

/** 应完全移除（含子节点）的危险 HTML 标签 */
const STRIP_ELEMENTS = new Set([
  'script',
  'noscript',
  'style',
  'meta',
  'title',
  'link',
  'base',
  'object',
  'embed',
  'applet',
  'frame',
  'frameset',
]);

/** 应解包（移除标签但保留子节点）的结构性/表单 HTML 标签 */
const UNWRAP_ELEMENTS = new Set([
  'html',
  'head',
  'body',
  'form',
  'button',
  'select',
  'textarea',
  'option',
  'optgroup',
  'fieldset',
  'legend',
]);

const sanitizeElementProperties = (
  properties: Record<string, unknown>,
): void => {
  if (!properties) return;
  for (const key of Object.keys(properties)) {
    if (key.startsWith('on')) {
      delete properties[key];
      continue;
    }
    const value = properties[key];
    if (typeof value === 'string' && hasDangerousUrlScheme(value)) {
      delete properties[key];
    }
  }
};

/** 判断 input 元素是否为 GFM 任务列表 checkbox，应予保留 */
const isTaskListCheckbox = (node: any): boolean => {
  return node.properties?.type === 'checkbox';
};

/**
 * 递归清理 hast 节点。
 * @returns null = 移除节点 | 数组 = 解包子节点 | 节点对象 = 保留
 */
const sanitizeHastNode = (node: any): any => {
  if (node.type === 'doctype') return null;

  if (node.type === 'element') {
    if (STRIP_ELEMENTS.has(node.tagName)) return null;

    // input: 保留 GFM 任务列表 checkbox，移除其他 input
    if (node.tagName === 'input' && !isTaskListCheckbox(node)) {
      return null;
    }

    if (shouldElementRenderAsPlainText(node)) {
      return { type: 'text', value: serializeHastElement(node) };
    }

    sanitizeElementProperties(node.properties);

    if (UNWRAP_ELEMENTS.has(node.tagName)) {
      const kept: any[] = [];
      for (const child of node.children || []) {
        const result = sanitizeHastNode(child);
        if (result === null) continue;
        if (Array.isArray(result)) kept.push(...result);
        else kept.push(result);
      }
      return kept.length > 0 ? kept : null;
    }
  }

  if (node.children) {
    const newChildren: any[] = [];
    for (const child of node.children) {
      const result = sanitizeHastNode(child);
      if (result === null) continue;
      if (Array.isArray(result)) newChildren.push(...result);
      else newChildren.push(result);
    }
    node.children = newChildren;
  }

  return node;
};

export const rehypeSanitizeUserHtml = () => (tree: any) => {
  sanitizeHastNode(tree);
  return tree;
};
