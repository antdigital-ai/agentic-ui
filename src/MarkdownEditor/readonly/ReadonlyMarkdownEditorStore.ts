import type React from 'react';
import {
  findTextInReadonlyMarkdownDom,
  READONLY_MARKDOWN_CONTAINER_KEY,
  type ReadonlyMarkdownBlockPath,
  type ReadonlyMarkdownSearchEditor,
} from './findTextInReadonlyMarkdownDom';

/**
 * markdown 只读模式下的轻量 store：提供与 EditorStore 相近的查询 API，无 Slate 文档树。
 */
export class ReadonlyMarkdownEditorStore {
  private contentGetter: () => string;

  private containerGetter: () => HTMLElement | null;

  constructor(options: {
    getContent: () => string;
    getContainer: () => HTMLElement | null;
  }) {
    this.contentGetter = options.getContent;
    this.containerGetter = options.getContainer;
  }

  /** 供 `findByPathAndText(editor, ...)` 使用的只读搜索上下文 */
  get editor(): ReadonlyMarkdownSearchEditor {
    return {
      [READONLY_MARKDOWN_CONTAINER_KEY]: this.getContentContainer(),
    };
  }

  getMDContent(): string {
    return this.contentGetter();
  }

  setMDContent(_markdown: string): void {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(
        '[ReadonlyMarkdownEditorStore] setMDContent 在 renderMode=markdown 下不可用，请更新 initValue',
      );
    }
  }

  getContentContainer(): HTMLElement | null {
    const container = this.containerGetter();
    if (!container) {
      return null;
    }
    return (
      container.querySelector<HTMLElement>('[class*="-content-markdown-readonly"]') ||
      container.querySelector<HTMLElement>('[class*="-content"]') ||
      container
    );
  }

  findByPathAndText(
    pathDescription: ReadonlyMarkdownBlockPath,
    searchText: string,
    options: {
      caseSensitive?: boolean;
      wholeWord?: boolean;
      maxResults?: number;
      includeMarkdownVariants?: boolean;
    } = {},
  ) {
    const contentRoot = this.getContentContainer();
    if (!contentRoot) {
      return [];
    }
    return findTextInReadonlyMarkdownDom(
      contentRoot,
      pathDescription,
      searchText,
      options,
    );
  }

  /** Slate store 兼容占位 */
  updateNodeList = () => {};

  insertNodes = () => {};

  footnoteDefinitionMap = new Map<string, unknown>();
}

export type ReadonlyMarkdownEditorInstance = {
  markdownContainerRef: React.MutableRefObject<HTMLDivElement | null>;
  markdownEditorRef: React.MutableRefObject<null>;
  store: ReadonlyMarkdownEditorStore;
  getDisplayedContent: () => string;
  exportHtml: (filename?: string) => void;
};

export const createReadonlyMarkdownEditorInstance = (options: {
  markdownContainerRef: React.MutableRefObject<HTMLDivElement | null>;
  getDisplayedContent: () => string;
}): ReadonlyMarkdownEditorInstance => {
  const store = new ReadonlyMarkdownEditorStore({
    getContent: options.getDisplayedContent,
    getContainer: () => options.markdownContainerRef.current,
  });

  return {
    markdownContainerRef: options.markdownContainerRef,
    markdownEditorRef: { current: null },
    store,
    getDisplayedContent: options.getDisplayedContent,
    exportHtml: (filename = 'document.html') => {
      const root = options.markdownContainerRef.current;
      if (!root) {
        return;
      }
      const html = root.innerHTML;
      const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename.endsWith('.html') ? filename : `${filename}.html`;
      link.click();
      URL.revokeObjectURL(url);
    },
  };
};
