import {
  escapeRegExp,
  normalizeMarkdownSearchText,
} from '../editor/utils/markdownSearchText';

export const READONLY_MARKDOWN_CONTAINER_KEY = '__readonlyMarkdownContainer';

export type ReadonlyMarkdownBlockPath = number[];

export type ReadonlyMarkdownSearchEditor = {
  [READONLY_MARKDOWN_CONTAINER_KEY]: HTMLElement | null;
};

export const isReadonlyMarkdownSearchEditor = (
  editor: unknown,
): editor is ReadonlyMarkdownSearchEditor =>
  !!editor &&
  typeof editor === 'object' &&
  READONLY_MARKDOWN_CONTAINER_KEY in editor;

export type ReadonlyMarkdownTextMatch = {
  path: ReadonlyMarkdownBlockPath;
  matchedText: string;
  offset: { start: number; end: number };
  lineContent: string;
  nodeType?: string;
  searchVariant?: string;
  isLink?: boolean;
  linkUrl?: string;
};

const BLOCK_SELECTOR =
  '[data-be="paragraph"], [data-be="head"], [data-be="blockquote"], [data-be="list-item"], [data-be="table-cell"], td, th';

const shouldSkipNode = (node: globalThis.Node): boolean => {
  if (node.nodeType !== Node.ELEMENT_NODE) {
    return false;
  }
  const el = node as HTMLElement;
  const tag = el.tagName.toLowerCase();
  return (
    tag === 'pre' ||
    tag === 'code' ||
    tag === 'script' ||
    tag === 'style' ||
    el.closest('pre,code') !== null
  );
};

const collectBlockElements = (
  root: HTMLElement,
  pathDescription: ReadonlyMarkdownBlockPath,
): HTMLElement[] => {
  const descendantBlocks = Array.from(
    root.querySelectorAll(BLOCK_SELECTOR),
  ).filter((el) => !shouldSkipNode(el)) as HTMLElement[];

  const blocks =
    root.matches(BLOCK_SELECTOR) && !shouldSkipNode(root)
      ? [root, ...descendantBlocks]
      : descendantBlocks;

  if (!pathDescription.length) {
    return blocks;
  }

  const blockIndex = pathDescription[0];
  if (
    typeof blockIndex !== 'number' ||
    blockIndex < 0 ||
    blockIndex >= blocks.length
  ) {
    return [];
  }

  return [blocks[blockIndex]];
};

/** 获取 markdown 只读内容块（供评论高亮等复用） */
export const getReadonlyMarkdownBlocks = (
  root: HTMLElement,
  blockIndex?: number,
): HTMLElement[] => collectBlockElements(root, blockIndex === undefined ? [] : [blockIndex]);

const getBlockPlainText = (block: HTMLElement): string => block.innerText || '';

const findMatchesInText = (
  text: string,
  patterns: Array<{ variant: string; pattern: RegExp }>,
  options: {
    maxResults: number;
    results: ReadonlyMarkdownTextMatch[];
    path: ReadonlyMarkdownBlockPath;
    block: HTMLElement;
  },
) => {
  for (const { variant, pattern } of patterns) {
    if (options.results.length >= options.maxResults) {
      return;
    }

    pattern.lastIndex = 0;
    let match = pattern.exec(text);
    while (match && options.results.length < options.maxResults) {
      const matchedText = match[0];
      const start = match.index;
      const end = start + matchedText.length;
      options.results.push({
        path: options.path,
        matchedText,
        offset: { start, end },
        lineContent: text,
        nodeType: options.block.dataset.be || options.block.tagName.toLowerCase(),
        searchVariant: variant,
      });
      match = pattern.exec(text);
    }
  }
};

/**
 * 在 markdown 只读 DOM 中按块路径与文本搜索（纯 DOM，不依赖 Slate）。
 */
export const findTextInReadonlyMarkdownDom = (
  container: HTMLElement,
  pathDescription: ReadonlyMarkdownBlockPath,
  searchText: string,
  options: {
    caseSensitive?: boolean;
    wholeWord?: boolean;
    maxResults?: number;
    includeMarkdownVariants?: boolean;
  } = {},
): ReadonlyMarkdownTextMatch[] => {
  const {
    caseSensitive = false,
    wholeWord = false,
    maxResults = 50,
    includeMarkdownVariants = true,
  } = options;

  if (!searchText.trim()) {
    return [];
  }

  const searchVariants = includeMarkdownVariants
    ? normalizeMarkdownSearchText(searchText)
    : [searchText.trim()];
  if (!searchVariants.length) {
    return [];
  }

  const flags = caseSensitive ? 'g' : 'gi';
  const patterns = searchVariants.map((variant) => ({
    variant,
    pattern: wholeWord
      ? new RegExp(`\\b${escapeRegExp(variant)}\\b`, flags)
      : new RegExp(escapeRegExp(variant), flags),
  }));

  const blocks = collectBlockElements(container, pathDescription);
  const results: ReadonlyMarkdownTextMatch[] = [];

  blocks.forEach((block, index) => {
    const path: ReadonlyMarkdownBlockPath = pathDescription.length
      ? pathDescription
      : [index];
    const plainText = getBlockPlainText(block);
    if (!plainText.trim()) {
      return;
    }
    findMatchesInText(plainText, patterns, {
      maxResults,
      results,
      path: [typeof path[0] === 'number' ? path[0] : index],
      block,
    });
  });

  return results.slice(0, maxResults);
};
