/* eslint-disable @typescript-eslint/no-this-alias */
/* eslint-disable no-param-reassign */
import isEqual from 'lodash-es/isEqual';
import { parse } from 'querystring';
import * as React from 'react';
import { Subject } from 'rxjs';
import {
  BaseEditor,
  Editor,
  Element,
  Node,
  NodeMatch,
  Path,
  Range,
  RangeMode,
  Selection,
  Text,
  Transforms,
} from 'slate';
import { HistoryEditor } from 'slate-history';
import { ReactEditor } from 'slate-react';
import { T } from 'vitest/dist/chunks/environment.LoooBwUu.js';
import { Elements, FootnoteDefinitionNode, ListNode } from '../el';
import type { MarkdownEditorPlugin } from '../plugin';
import { CommentDataType, MarkdownEditorProps } from '../types';
import { parserMdToSchema } from './parser/parserMdToSchema';
import { KeyboardTask, Methods, parserSlateNodeToMarkdown } from './utils';
import { getOffsetLeft, getOffsetTop } from './utils/dom';
import { EditorUtils, findByPathAndText } from './utils/editorUtils';
import type { MarkdownToHtmlOptions } from './utils/markdownToHtml';
import { markdownToHtmlSync } from './utils/markdownToHtml';
const { createContext, useContext } = React;

/**
 * 编辑器上下文接口
 *
 * 提供编辑器组件间共享的状态和方法
 */
export interface EditorStoreContextType {
  /** 编辑器核心状态存储 */
  store: EditorStore;
  /** 是否启用打字机模式 */
  typewriter: boolean;
  /** 根容器引用 */
  rootContainer?: React.MutableRefObject<HTMLDivElement | undefined>;
  /** 设置显示评论列表 */
  setShowComment: (list: CommentDataType[]) => void;
  /** 是否为只读模式 */
  readonly: boolean;
  /** 键盘任务流 */
  keyTask$: Subject<{
    key: Methods<KeyboardTask>;
    args?: any[];
  }>;
  /** 插入自动完成文本流 */
  insertCompletionText$: Subject<string>;
  /** 打开插入链接流 */
  openInsertLink$: Subject<Selection>;
  /** 是否刷新浮动工具栏 */
  refreshFloatBar?: boolean;
  /** DOM矩形信息 */
  domRect: DOMRect | null;
  /** 设置DOM矩形 */
  setDomRect: (rect: DOMRect | null) => void;
  /** 设置刷新浮动工具栏状态 */
  setRefreshFloatBar?: (refresh: boolean) => void;
  /** 是否打开插入自动完成 */
  openInsertCompletion?: boolean;
  /** 设置打开插入自动完成状态 */
  setOpenInsertCompletion?: (open: boolean) => void;
  /** 编辑器属性配置 */
  editorProps: MarkdownEditorProps;
  /** Markdown编辑器引用 */
  markdownEditorRef: React.MutableRefObject<
    BaseEditor & ReactEditor & HistoryEditor
  >;
  /** Markdown容器引用 */
  markdownContainerRef: React.MutableRefObject<HTMLDivElement | null>;
}

export const EditorStoreContext = createContext<EditorStoreContextType | null>(
  null,
);

/**
 * 获取编辑器存储上下文的Hook
 *
 * 提供安全的上下文访问，包含默认值处理
 *
 * @returns 编辑器存储上下文对象
 *
 * @example
 * ```tsx
 * const { store, readonly, typewriter } = useEditorStore();
 * ```
 */
export const useEditorStore = () => {
  return (
    useContext(EditorStoreContext)! || {
      store: {} as Record<string, any>,
      readonly: true,
      typewriter: false,
      editorProps: {} as MarkdownEditorProps,
      markdownEditorRef: {} as React.MutableRefObject<any>,
    }
  );
};

/** 支持键入操作的标签类型列表 */
const SUPPORT_TYPING_TAG = ['table-cell', 'paragraph', 'head'];

/**
 * 表示更新操作的类型枚举
 */
type OperationType = 'insert' | 'remove' | 'update' | 'replace' | 'text';

/**
 * 表示一个更新操作的接口
 */
interface UpdateOperation {
  /** 操作类型 */
  type: OperationType;
  /** 操作路径 */
  path: Path;
  /** 节点对象 */
  node?: Node;
  /** 节点属性 */
  properties?: Partial<Node>;
  /** 文本内容 */
  text?: string;
  /** 操作优先级，越小越先执行 */
  priority: number;
}

/**
 * 编辑器核心状态管理类
 *
 * 负责管理编辑器的所有状态、操作和事件处理
 * 包括文档结构、选择状态、高亮、拖拽、历史记录等
 *
 * @class
 */
export class EditorStore {
  /** 高亮缓存映射表 */
  highlightCache = new Map<object, Range[]>();

  /** 允许进入的元素类型集合 */
  private ableToEnter = new Set([
    'paragraph',
    'head',
    'blockquote',
    'code',
    'table',
    'list',
    'media',
    'attach',
  ]);

  /** 当前拖拽的元素 */
  draggedElement: null | HTMLElement = null;
  footnoteDefinitionMap: Map<string, FootnoteDefinitionNode> = new Map();
  inputComposition = false;
  plugins?: MarkdownEditorPlugin[];
  domRect: DOMRect | null = null;

  _editor: React.MutableRefObject<BaseEditor & ReactEditor & HistoryEditor>;

  /** 当前 setMDContent 操作的 AbortController */
  private _currentAbortController: AbortController | null = null;
  private markdownToHtmlOptions?: MarkdownToHtmlOptions;

  /**
   * 获取当前编辑器实例。
   *
   * @returns 当前的 Slate 编辑器实例。
   */
  get editor() {
    return this._editor.current;
  }

  constructor(
    _editor: React.MutableRefObject<BaseEditor & ReactEditor & HistoryEditor>,
    plugins?: MarkdownEditorPlugin[],
    markdownToHtmlOptions?: MarkdownToHtmlOptions,
  ) {
    this.dragStart = this.dragStart.bind(this);
    this._editor = _editor;
    this.plugins = plugins;
    this.markdownToHtmlOptions = markdownToHtmlOptions;
  }

  /**
   * 聚焦到编辑器
   */
  focus() {
    const editor = this._editor.current;
    try {
      // 1. 确保编辑器获得焦点
      setTimeout(() => ReactEditor.focus(editor), 0);
      // 2. 处理空文档情况
      if (editor.children.length === 0) {
        const defaultNode = { type: 'paragraph', children: [{ text: '' }] };
        Transforms.insertNodes(editor, defaultNode, { at: [0] });
      }

      // 3. 获取文档末尾位置
      const end = Editor.end(editor, []);

      // 4. 设置光标位置
      Transforms.select(editor, {
        anchor: end,
        focus: end,
      });
    } catch (error) {
      console.error('移动光标失败:', error);
    }
  }

  /**
   * 查找最新的节点索引。
   *
   * @param node - 当前节点。
   * @param index - 当前索引路径。
   * @returns 最新节点的索引路径。
   */
  private findLatest(node: Elements, index: number[]): number[] {
    if (Array.isArray((node as ListNode).children)) {
      if (
        (node as ListNode).children.length === 1 &&
        (SUPPORT_TYPING_TAG.includes((node as ListNode).type) ||
          !(node as ListNode).children[0].type)
      ) {
        return index;
      }

      return this.findLatest(
        (node as ListNode).children[(node as ListNode).children.length - 1]!,
        [...index, (node as ListNode).children.length - 1],
      );
    }
    return index;
  }
  /**
   * 检查给定节点是否是最新节点。用于展示 闪动光标
   *
   * @param node - 要检查的节点。
   * @returns 如果节点是最新节点，则返回 true；否则返回 false。
   */
  isLatestNode(node: Node) {
    try {
      return this.findLatest(this._editor.current.children.at(-1)!, [
        this._editor.current.children.length - 1,
      ])
        .join('-')
        .startsWith(ReactEditor.findPath(this._editor.current, node).join('-'));
    } catch (error) {
      return false;
    }
  }

  /**
   * 插入一个链接到编辑器中。
   *
   * @param filePath - 要插入的文件路径。如果路径以 'http' 开头，则链接文本为路径本身，否则为文件名。
   *
   * 该方法首先解析文件路径，并创建一个包含文本和 URL 的节点对象。
   * 然后，它检查当前编辑器的选区是否存在且未折叠。如果选区不存在或已折叠，则方法返回。
   *
   * 接下来，它查找当前选区所在的最低层级的元素节点。如果节点类型是 'table-cell' 或 'paragraph'，
   * 则在当前选区插入链接节点并选中它。
   *
   * 如果当前选区所在的元素节点类型不是 'table-cell' 或 'paragraph'，则查找包含当前选区的父级元素节点，
   * 并在其后插入一个包含链接节点的新段落。
   */
  insertLink(filePath: string) {
    const p = parse(filePath);
    const insertPath = filePath;
    let node = {
      text: filePath.startsWith('http') ? filePath : p.name,
      url: insertPath,
    };
    const sel = this._editor.current.selection;
    if (!sel || !Range.isCollapsed(sel)) return;
    // @ts-ignore
    const [cur] = Editor.nodes<any>(this._editor.current, {
      match: (n) => Element.isElement(n),
      mode: 'lowest',
    });
    if (node.text && ['table-cell', 'paragraph'].includes(cur[0].type)) {
      Transforms.insertNodes(this._editor.current, node, { select: true });
    } else {
      // @ts-ignore
      const [par] = Editor.nodes<any>(this._editor.current, {
        match: (n) =>
          Element.isElement(n) && ['table', 'code', 'head'].includes(n.type),
      });
      Transforms.insertNodes(
        this._editor.current,
        {
          type: 'paragraph',
          children: [node],
        },
        { select: true, at: Path.next(par[1]) },
      );
    }
  }

  /**
   * 插入节点到编辑器中。
   *
   * @param nodes - 要插入的节点，可以是单个节点或节点数组。
   * @param options - 可选参数，用于指定插入节点的选项。
   */
  insertNodes(nodes: Node | Node[], options?: any) {
    Transforms.insertNodes(this._editor.current, nodes, options);
  }

  /**
   * Converts an HTML element to a Slate path and node.
   *
   * @param el - The HTML element to convert.
   * @returns A tuple containing the path and the corresponding Slate node.
   * @private
   */
  private toPath(el: HTMLElement) {
    const node = ReactEditor.toSlateNode(this._editor.current, el);
    const path = ReactEditor.findPath(this._editor.current, node);
    return [path, node] as [Path, Node];
  }

  /**
   * Clears all content from the editor, replacing it with an empty paragraph.
   */
  clearContent() {
    this._editor.current.selection = null;
    this._editor.current.children = [
      {
        type: 'paragraph',
        children: [{ text: '' }],
      },
    ];
  }

  /**
   * 从 markdown 文本设置编辑器内容
   *
   * @param md - 要设置为编辑器内容的 Markdown 字符串
   *             如果为 undefined，方法将直接返回不做任何更改
   *             如果 markdown 与当前内容相同，则不做任何更改
   * @param plugins - 可选的自定义 markdown 解析插件
   * @param options - 可选的配置参数
   *   - chunkSize: 分块大小阈值，默认 5000 字符。超过此大小会启用分批处理
   *   - separator: 分隔符，默认为双换行符 '\n\n'，用于拆分长文本
   *   - useRAF: 是否使用 requestAnimationFrame 优化，默认 true，避免长文本处理时卡顿
   *   - batchSize: 每帧处理的节点数量，默认 50，仅在 useRAF=true 时生效
   *   - onProgress: 进度回调函数，接收当前进度 (0-1) 作为参数
   * @returns 如果使用 RAF，返回 Promise；否则同步执行
   */
  setMDContent(
    md?: string,
    plugins?: MarkdownEditorPlugin[],
    options?: {
      chunkSize?: number;
      separator?: string | RegExp;
      useRAF?: boolean;
      batchSize?: number;
      onProgress?: (progress: number) => void;
    },
  ): void | Promise<void> {
    if (md === undefined) return;

    // 安全地比较当前内容，避免解析异常导致失效
    try {
      const currentMD = parserSlateNodeToMarkdown(
        this._editor.current.children,
      );
      // 使用 trim 和规范化比较，避免空白字符差异
      if (md.trim() === currentMD.trim()) return;
    } catch (error) {
      // 如果解析当前内容失败，继续执行设置新内容
      console.warn(
        'Failed to compare current content, proceeding with setMDContent:',
        error,
      );
    }

    // 取消之前的操作，避免竞态条件
    this.cancelSetMDContent();

    const chunkSize = options?.chunkSize ?? 5000;
    const separator = options?.separator ?? /\n\n/;
    const useRAF = options?.useRAF ?? true;
    const batchSize = options?.batchSize ?? 50;
    const targetPlugins = plugins || this.plugins;

    // 如果内容较短，直接处理
    if (md.length <= chunkSize) {
      try {
        const nodeList = parserMdToSchema(md, targetPlugins).schema;
        this.setContent(nodeList);
        this._editor.current.children = nodeList;
        ReactEditor.deselect(this._editor.current);
        // 调用进度回调
        if (options?.onProgress) {
          options.onProgress(1);
        }
      } catch (error) {
        console.error('Failed to set MD content:', error);
        throw error;
      }
      return;
    }

    // 内容较长时，按指定分隔符拆分并分批处理
    const chunks = this._splitMarkdown(md, separator);

    // 如果禁用 RAF，使用同步模式处理长内容
    if (!useRAF) {
      try {
        const allNodes: Node[] = [];
        for (const chunk of chunks) {
          if (chunk.trim()) {
            const { schema } = parserMdToSchema(chunk, targetPlugins);
            allNodes.push(...schema);
          }
        }

        if (allNodes.length > 0) {
          this.setContent(allNodes);
          this._editor.current.children = allNodes;
          ReactEditor.deselect(this._editor.current);
        }

        // 调用进度回调
        if (options?.onProgress) {
          options.onProgress(1);
        }
      } catch (error) {
        console.error('Failed to set MD content synchronously:', error);
        throw error;
      }
      return;
    }

    // 如果使用 RAF 且分块数量较多，异步解析和插入
    if (chunks.length > 10) {
      // 创建新的 AbortController
      this._currentAbortController = new AbortController();
      return this._parseAndSetContentWithRAF(
        chunks,
        targetPlugins || [],
        batchSize,
        options?.onProgress,
        this._currentAbortController.signal,
      );
    }

    // 如果分块数量 <= 10，使用同步模式处理（修复：之前这里直接返回 undefined）
    try {
      const allNodes: Node[] = [];
      for (const chunk of chunks) {
        if (chunk.trim()) {
          const { schema } = parserMdToSchema(chunk, targetPlugins);
          allNodes.push(...schema);
        }
      }

      if (allNodes.length > 0) {
        this.setContent(allNodes);
        this._editor.current.children = allNodes;
        ReactEditor.deselect(this._editor.current);
      }

      // 调用进度回调
      if (options?.onProgress) {
        options.onProgress(1);
      }
    } catch (error) {
      console.error('Failed to set MD content with small chunks:', error);
      throw error;
    }
  }

  /**
   * 取消当前正在进行的 setMDContent 操作
   */
  cancelSetMDContent(): void {
    if (this._currentAbortController) {
      this._currentAbortController.abort();
      this._currentAbortController = null;
    }
  }

  /**
   * 使用 requestAnimationFrame 分批解析和设置内容
   * 边解析边插入，实时显示内容
   *
   * @param chunks - markdown 分块数组
   * @param plugins - 解析插件
   * @param batchSize - 每帧处理的数量
   * @param onProgress - 进度回调函数
   * @returns Promise，在所有内容处理完成后 resolve
   * @private
   */
  private _parseAndSetContentWithRAF(
    chunks: string[],
    plugins: MarkdownEditorPlugin[],
    batchSize: number,
    onProgress?: (progress: number) => void,
    signal?: AbortSignal,
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      let currentChunkIndex = 0;
      const totalChunks = chunks.length;
      const parseChunksPerFrame = Math.max(1, Math.floor(batchSize / 10)); // 每帧解析的 chunk 数
      let isFirstBatch = true;
      let rafId: number | null = null;

      // 边解析边插入
      const parseAndInsertNextBatch = () => {
        try {
          // 检查是否被取消
          if (signal?.aborted) {
            if (rafId) {
              cancelAnimationFrame(rafId);
              rafId = null;
            }
            this._currentAbortController = null;
            reject(new Error('Operation was cancelled'));
            return;
          }

          // 检查编辑器是否仍然有效
          if (!this._editor.current) {
            if (rafId) {
              cancelAnimationFrame(rafId);
              rafId = null;
            }
            this._currentAbortController = null;
            reject(new Error('Editor instance is no longer available'));
            return;
          }

          const endIndex = Math.min(
            currentChunkIndex + parseChunksPerFrame,
            totalChunks,
          );

          // 解析当前批次的 chunks 并立即插入
          for (let i = currentChunkIndex; i < endIndex; i++) {
            const chunk = chunks[i];
            if (chunk.trim()) {
              try {
                const { schema } = parserMdToSchema(chunk, plugins);

                if (schema.length > 0) {
                  if (isFirstBatch) {
                    // 第一批：清空并插入
                    this._editor.current.children = schema;
                    this._editor.current.onChange();
                    isFirstBatch = false;
                  } else {
                    // 后续批次：追加节点
                    Transforms.insertNodes(this._editor.current, schema, {
                      at: [this._editor.current.children.length],
                    });
                  }
                }
              } catch (chunkError) {
                // 单个 chunk 解析失败，记录但继续处理其他 chunks
                console.warn(`Failed to parse chunk ${i}:`, chunkError);
              }
            }
          }

          currentChunkIndex = endIndex;
          // 更新进度
          const progress = currentChunkIndex / totalChunks;
          if (onProgress) {
            try {
              onProgress(progress);
            } catch (progressError) {
              // 进度回调失败不应该中断整个流程
              console.warn('Progress callback failed:', progressError);
            }
          }

          if (currentChunkIndex < totalChunks) {
            // 还有 chunks 未处理，继续下一帧
            rafId = requestAnimationFrame(parseAndInsertNextBatch);
          } else {
            // 所有内容处理完成
            ReactEditor.deselect(this._editor.current);
            rafId = null;
            this._currentAbortController = null;
            resolve();
          }
        } catch (error) {
          // 清理资源并拒绝 Promise
          if (rafId) {
            cancelAnimationFrame(rafId);
            rafId = null;
          }
          this._currentAbortController = null;
          reject(error);
        }
      };

      // 开始处理
      rafId = requestAnimationFrame(parseAndInsertNextBatch);
    });
  }

  /**
   * 使用 requestAnimationFrame 分批设置内容
   * 每帧插入一批节点，避免长时间阻塞主线程
   *
   * @param allNodes - 所有要插入的节点
   * @param batchSize - 每帧处理的节点数量
   * @param onProgress - 进度回调函数
   * @returns Promise，在所有节点插入完成后 resolve
   * @private
   */
  private _setContentWithRAF(
    allNodes: Node[],
    batchSize: number,
    onProgress?: (progress: number) => void,
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      let currentIndex = 0;
      const totalNodes = allNodes.length;
      let rafId: number | null = null;

      const insertBatch = () => {
        try {
          const endIndex = Math.min(currentIndex + batchSize, totalNodes);
          const batch = allNodes.slice(currentIndex, endIndex);

          if (currentIndex === 0) {
            // 第一批：清空并插入
            this._editor.current.children = batch;
            this._editor.current.onChange();
          } else {
            // 后续批次：追加节点
            this._editor.current.children.push(...batch);
            this._editor.current.onChange();
          }

          currentIndex = endIndex;
          const progress = currentIndex / totalNodes;

          // 直接调用进度回调，避免嵌套 requestAnimationFrame
          onProgress?.(progress);

          if (currentIndex < totalNodes) {
            // 还有节点未处理，继续下一帧
            rafId = requestAnimationFrame(insertBatch);
          } else {
            // 所有节点处理完成
            ReactEditor.deselect(this._editor.current);
            rafId = null;
            resolve();
          }
        } catch (error) {
          // 清理资源并拒绝 Promise
          if (rafId) {
            cancelAnimationFrame(rafId);
            rafId = null;
          }
          reject(error);
        }
      };

      // 开始第一帧
      rafId = requestAnimationFrame(insertBatch);
    });
  }

  /**
   * 按指定分隔符拆分 markdown 内容
   * 保持内容结构的完整性
   *
   * @param md - 要拆分的 markdown 字符串
   * @param separator - 分隔符，可以是字符串或正则表达式
   * @returns 拆分后的字符串数组
   * @private
   */
  private _splitMarkdown(md: string, separator: string | RegExp): string[] {
    if (!md) {
      return [];
    }

    const separatorMatches = this._collectSeparatorMatches(md, separator);

    if (separatorMatches.length === 0) {
      return [md];
    }

    const chunks: string[] = [];
    let start = 0;
    let currentMatchIndex = 0;
    let insideFence = false;
    let activeFence: '`' | '~' | null = null;
    let index = 0;

    while (index < md.length) {
      if (this._isLineStart(md, index)) {
        const fence = this._matchFence(md, index);
        if (fence) {
          if (!insideFence) {
            insideFence = true;
            activeFence = fence.marker;
          } else if (activeFence === fence.marker) {
            insideFence = false;
            activeFence = null;
          }
          index = fence.end;
          continue;
        }
      }

      const match = separatorMatches[currentMatchIndex];
      if (!insideFence && match && index === match.index) {
        const chunk = md.slice(start, index);
        if (chunk.length > 0) {
          chunks.push(chunk);
        }
        start = index + match.length;
        currentMatchIndex += 1;
        index = start;
        continue;
      }

      index += 1;
    }

    const tail = md.slice(start);
    if (tail.length > 0) {
      chunks.push(tail);
    }

    return chunks.length > 0 ? chunks : [md];
  }

  private _collectSeparatorMatches(
    md: string,
    separator: string | RegExp,
  ): { index: number; length: number }[] {
    if (typeof separator === 'string') {
      const matches: { index: number; length: number }[] = [];
      let searchIndex = md.indexOf(separator);
      while (searchIndex !== -1) {
        matches.push({ index: searchIndex, length: separator.length });
        searchIndex = md.indexOf(separator, searchIndex + separator.length);
      }
      return matches;
    }

    const flags = separator.flags.includes('g')
      ? separator.flags
      : `${separator.flags}g`;
    const globalRegex = new RegExp(separator.source, flags);
    const matches: { index: number; length: number }[] = [];

    let match: RegExpExecArray | null;
    while ((match = globalRegex.exec(md)) !== null) {
      const matchedText = match[0];
      matches.push({ index: match.index, length: matchedText.length });
      if (matchedText.length === 0) {
        globalRegex.lastIndex += 1;
      }
    }

    return matches;
  }

  private _isLineStart(content: string, position: number): boolean {
    if (position === 0) {
      return true;
    }
    return content[position - 1] === '\n';
  }

  private _matchFence(
    content: string,
    position: number,
  ): { marker: '`' | '~'; end: number } | null {
    let cursor = position;
    let spaces = 0;

    while (cursor < content.length && content[cursor] === ' ' && spaces < 3) {
      cursor += 1;
      spaces += 1;
    }

    if (cursor >= content.length) {
      return null;
    }

    const char = content[cursor];
    if (char !== '`' && char !== '~') {
      return null;
    }

    let fenceLength = 0;
    while (cursor < content.length && content[cursor] === char) {
      cursor += 1;
      fenceLength += 1;
    }

    if (fenceLength < 3) {
      return null;
    }

    const lineEnd = this._findLineEnd(content, cursor);

    return { marker: char as '`' | '~', end: lineEnd };
  }

  private _findLineEnd(content: string, position: number): number {
    let cursor = position;
    while (cursor < content.length && content[cursor] !== '\n') {
      cursor += 1;
    }

    if (cursor < content.length && content[cursor] === '\n') {
      return cursor + 1;
    }

    return cursor;
  }

  /**
   * 移除节点
   * @param options
   */
  removeNodes: (options?: {
    at?: Location;
    match?: NodeMatch<T>;
    mode?: RangeMode;
    hanging?: boolean;
    voids?: boolean;
  }) => void = (options) => {
    Transforms.removeNodes(this._editor.current, options as any);
  };

  /**
   * 获取当前编辑器内容作为节点列表
   *
   * @returns 当前编辑器内容的节点列表
   */
  getContent() {
    const nodeList = this._editor.current.children;
    return nodeList;
  }

  /**
   * 获取当前编辑器内容作为 markdown 字符串
   *
   * @param plugins - 可选的自定义 markdown 转换插件
   * @returns 转换为 markdown 的当前编辑器内容
   */
  getMDContent(plugins?: MarkdownEditorPlugin[]) {
    const nodeList = this._editor.current.children;
    const md = parserSlateNodeToMarkdown(
      nodeList,
      '',
      [{ root: true }],
      plugins || this.plugins,
    );
    return md;
  }

  /**
   * 获取当前编辑器内容作为 HTML 字符串
   *
   * @returns 转换为 HTML 的当前编辑器内容
   */
  getHtmlContent(options?: MarkdownToHtmlOptions) {
    const markdown = this.getMDContent();
    const appliedOptions = options ?? this.markdownToHtmlOptions;
    if (options) {
      this.markdownToHtmlOptions = options;
    }
    return markdownToHtmlSync(markdown, appliedOptions);
  }

  /**
   * 使用节点列表设置编辑器内容
   *
   * @param nodeList - 要设置为编辑器内容的节点列表
   */
  setContent(nodeList: Node[]) {
    this._editor.current.children = nodeList;
    this._editor.current.onChange();

    // 检查最后一个节点是否以换行符结尾
    const lastNode = nodeList[nodeList.length - 1];
    if (lastNode && Text.isText(lastNode)) {
      const text = Node.string(lastNode);
      if (!text.endsWith('\n')) {
        this._editor.current.insertText('\n', {
          at: [nodeList.length - 1],
        });
      }
    }
  }

  /**
   * 使用差异检测和操作队列优化更新节点列表。
   *
   * @param nodeList - 新的节点列表
   *
   * 优化步骤：
   * 1. 过滤无效节点
   * 2. 生成差异操作
   * 3. 执行优化后的操作
   * 4. 处理可能的错误情况
   *
   * 过滤规则：
   * - 移除空的段落节点
   * - 移除空的列表节点
   * - 移除空的列表项节点
   * - 移除无效的代码块节点
   * - 移除无源的图片节点
   *
   * 错误处理：
   * - 如果优化更新失败，会回退到直接替换整个节点列表
   * - 错误信息会被记录到控制台
   */
  updateNodeList(nodeList: Node[]): void {
    if (!nodeList || !Array.isArray(nodeList)) return;

    // 过滤无效节点
    const filteredNodes = nodeList.filter((item) => {
      if (!item) return false;
      if (item.type === 'p' && (!item.children || item.children.length === 0))
        return false;
      if (
        item.type === 'list' &&
        (!item.children || item.children.length === 0)
      )
        return false;
      if (
        item.type === 'listItem' &&
        (!item.children || item.children.length === 0)
      )
        return false;
      if (
        item.type === 'code' &&
        item.language === 'code' &&
        (!item.otherProps || item.otherProps.length === 0)
      )
        return false;
      if (item.type === 'image' && !item.src) return false;
      return true;
    });

    try {
      // 生成差异操作
      const operations = this.generateDiffOperations(
        filteredNodes,
        this._editor.current.children,
      );

      // 执行差异操作
      if (operations.length > 0) {
        this.executeOperations(operations);
      }
    } catch (error) {
      console.error('Failed to update nodes with optimized method:', error);
      // 回退：如果优化方法失败，使用直接替换
      this._editor.current.children = nodeList;
    }
  }

  /**
   * 生成两个节点列表之间的差异操作队列。
   *
   * @param newNodes - 新的节点列表
   * @param oldNodes - 旧的节点列表
   * @returns 包含所有需要执行的操作的队列
   *
   * 该方法通过以下步骤生成差异：
   * 1. 处理节点数量不同的情况
   * 2. 对共有节点进行深度比较
   * 3. 生成最小化的操作序列
   * 4. 根据优先级排序操作
   */
  private generateDiffOperations(
    newNodes: Node[],
    oldNodes: Node[],
  ): UpdateOperation[] {
    if (!newNodes || !oldNodes) return [];

    const operations: UpdateOperation[] = [];

    // 第一阶段：处理节点数量不同的情况
    const lengthDiff = newNodes.length - oldNodes.length;

    if (lengthDiff > 0) {
      // 新列表比旧列表长，添加新节点
      for (let i = oldNodes.length; i < newNodes.length; i++) {
        operations.push({
          type: 'insert',
          path: [i],
          node: newNodes[i],
          priority: 10, // 新增节点优先级较低
        });
      }
    } else if (lengthDiff < 0) {
      // 旧列表比新列表长，需要删除节点
      // 从后往前删除，以避免索引问题
      for (let i = oldNodes.length - 1; i >= newNodes.length; i--) {
        operations.push({
          type: 'remove',
          path: [i],
          priority: 0, // 删除操作优先级最高
        });
      }
    }

    // 第二阶段：深度比较共有的节点
    const minLength = Math.min(newNodes.length, oldNodes.length);
    for (let i = 0; i < minLength; i++) {
      const newNode = newNodes[i];
      const oldNode = oldNodes[i];

      this.compareNodes(newNode, oldNode, [i], operations);
    }

    // 按优先级排序操作队列
    return operations.sort((a, b) => a.priority - b.priority);
  }

  /**
   * 递归比较两个节点及其子节点的差异。
   *
   * @param newNode - 新节点
   * @param oldNode - 旧节点
   * @param path - 当前节点的路径
   * @param operations - 操作队列，用于存储发现的差异操作
   *
   * 比较过程包括：
   * 1. 检查节点类型是否相同
   * 2. 特殊处理表格节点
   * 3. 比较文本节点内容
   * 4. 比较节点属性
   * 5. 递归比较子节点
   * @private
   */
  private compareNodes(
    newNode: Node,
    oldNode: Node,
    path: Path,
    operations: UpdateOperation[],
  ): void {
    // 如果节点类型不同，直接替换整个节点
    if (newNode.type !== oldNode.type) {
      operations.push({
        type: 'replace',
        path,
        node: newNode,
        priority: 5,
      });
      return;
    }

    // 特殊处理表格节点
    if (newNode.type === 'table') {
      this.compareTableNodes(newNode, oldNode, path, operations);
      return;
    }

    // 如果两个节点是文本节点
    if (typeof newNode.text === 'string' && typeof oldNode.text === 'string') {
      if (newNode.text !== oldNode.text) {
        operations.push({
          type: 'text',
          path,
          text: newNode.text,
          priority: 8,
        });
      }

      // 比较文本节点的其他属性（如加粗、斜体等）
      const newProps = { ...newNode };
      const oldProps = { ...oldNode };
      delete newProps.text;
      delete oldProps.text;

      if (!isEqual(newProps, oldProps)) {
        operations.push({
          type: 'update',
          path,
          properties: newProps,
          priority: 7,
        });
      }
      return;
    }

    // 处理其他类型的节点属性更新
    const newProps = { ...newNode, children: undefined };
    const oldProps = { ...oldNode, children: undefined };

    if (!isEqual(newProps, oldProps)) {
      operations.push({
        type: 'update',
        path,
        properties: newProps,
        priority: 7,
      });
    }

    // 递归比较子节点
    if (newNode.children && oldNode.children) {
      // 特殊处理列表、引用等可能有嵌套结构的节点
      const childrenOps = this.generateDiffOperations(
        newNode.children,
        oldNode.children,
      );

      // 将子节点的操作添加到队列中，调整路径
      childrenOps.forEach((op) => {
        operations.push({
          ...op,
          path: [...path, ...op.path],
        });
      });
    }
  }

  /**
   * 特殊处理表格节点的比较。
   *
   * @param newTable - 新的表格节点
   * @param oldTable - 旧的表格节点
   * @param path - 表格节点的路径
   * @param operations - 操作队列
   *
   * 处理步骤：
   * 1. 检查表格结构是否相同
   * 2. 比较表格属性
   * 3. 逐行比较和更新
   * 4. 处理行数变化
   * 5. 必要时进行整表替换
   * @private
   */
  private compareTableNodes(
    newTable: Node,
    oldTable: Node,
    path: Path,
    operations: UpdateOperation[],
  ): void {
    const newRows = newTable.children || [];
    const oldRows = oldTable.children || [];

    // 检查是否是同一个表格的更新（检查表格的关键属性）
    const isSameTableStructure = () => {
      // 如果有表格ID或其他唯一标识符，优先比较这些
      if (newTable.id && oldTable.id) {
        return newTable.id === oldTable.id;
      }

      // 表格结构基本一致的情况（行数相同）
      if (newRows.length === oldRows.length) {
        // 检查每行的单元格数量
        for (let i = 0; i < newRows.length; i++) {
          const newRow = newRows[i];
          const oldRow = oldRows[i];
          if (
            !newRow.children ||
            !oldRow.children ||
            newRow.children.length !== oldRow.children.length
          ) {
            return false;
          }
        }
        return true;
      }

      return false;
    };

    // 非结构化属性对比（排除children）
    const tablePropsChanged = () => {
      const newProps = { ...newTable };
      const oldProps = { ...oldTable };
      delete newProps.children;
      delete oldProps.children;

      return !isEqual(newProps, oldProps);
    };

    // 检查表格是否只有内容变化而结构相同
    if (isSameTableStructure()) {
      // 只更新表格属性（不包括子节点）
      if (tablePropsChanged()) {
        const newTableProps = { ...newTable, children: undefined };
        operations.push({
          type: 'update',
          path,
          properties: newTableProps,
          priority: 7,
        });
      }

      // 逐行比较和更新
      for (let rowIdx = 0; rowIdx < newRows.length; rowIdx++) {
        const rowPath = [...path, rowIdx];
        const newRow = newRows[rowIdx];
        const oldRow = oldRows[rowIdx];

        // 更新行属性（不包括子节点）
        const newRowProps = { ...newRow, children: undefined };
        const oldRowProps = { ...oldRow, children: undefined };

        if (!isEqual(newRowProps, oldRowProps)) {
          operations.push({
            type: 'update',
            path: rowPath,
            properties: newRowProps,
            priority: 7,
          });
        }

        // 单元格比较和更新
        const newCells = newRow.children || [];
        const oldCells = oldRow.children || [];
        const minCellCount = Math.min(newCells.length, oldCells.length);

        // 更新共有的单元格
        for (let cellIdx = 0; cellIdx < minCellCount; cellIdx++) {
          const cellPath = [...rowPath, cellIdx];
          const newCell = newCells[cellIdx];
          const oldCell = oldCells[cellIdx];

          this.compareCells(newCell, oldCell, cellPath, operations);
        }

        // 处理单元格数量变化
        if (newCells.length > oldCells.length) {
          // 添加新单元格
          for (
            let cellIdx = oldCells.length;
            cellIdx < newCells.length;
            cellIdx++
          ) {
            operations.push({
              type: 'insert',
              path: [...rowPath, cellIdx],
              node: newCells[cellIdx],
              priority: 6,
            });
          }
        } else if (newCells.length < oldCells.length) {
          // 删除多余单元格（从后向前删除）
          for (
            let cellIdx = oldCells.length - 1;
            cellIdx >= newCells.length;
            cellIdx--
          ) {
            operations.push({
              type: 'remove',
              path: [...rowPath, cellIdx],
              priority: 1,
            });
          }
        }
      }
    } else {
      // 表格结构发生了变化，检查变化情况决定更新策略

      // 如果是简单的行增减，采用行级更新而非整表替换
      if (Math.abs(newRows.length - oldRows.length) <= 2) {
        // 行数量变化较小，尝试行级别更新

        // 先更新表格属性
        if (tablePropsChanged()) {
          operations.push({
            type: 'update',
            path,
            properties: { ...newTable, children: undefined },
            priority: 7,
          });
        }

        // 更新共有的行
        const minRowCount = Math.min(newRows.length, oldRows.length);
        for (let rowIdx = 0; rowIdx < minRowCount; rowIdx++) {
          const rowPath = [...path, rowIdx];
          this.compareNodes(
            newRows[rowIdx],
            oldRows[rowIdx],
            rowPath,
            operations,
          );
        }

        // 处理行数变化
        if (newRows.length > oldRows.length) {
          // 添加新行
          for (let rowIdx = oldRows.length; rowIdx < newRows.length; rowIdx++) {
            operations.push({
              type: 'insert',
              path: [...path, rowIdx],
              node: newRows[rowIdx],
              priority: 5,
            });
          }
        } else if (newRows.length < oldRows.length) {
          // 从后向前删除多余的行
          for (
            let rowIdx = oldRows.length - 1;
            rowIdx >= newRows.length;
            rowIdx--
          ) {
            operations.push({
              type: 'remove',
              path: [...path, rowIdx],
              priority: 1,
            });
          }
        }
      } else {
        // 结构变化较大，整表替换可能更高效
        operations.push({
          type: 'replace',
          path,
          node: newTable,
          priority: 5,
        });
      }
    }
  }

  /**
   * 比较和更新表格单元格。
   *
   * @param newCell - 新的单元格节点
   * @param oldCell - 旧的单元格节点
   * @param path - 单元格的路径
   * @param operations - 操作队列
   *
   * 处理步骤：
   * 1. 检查单元格属性变化
   * 2. 处理简单文本单元格
   * 3. 处理复杂单元格内容
   * 4. 生成适当的更新操作
   * @private
   */
  private compareCells(
    newCell: Node,
    oldCell: Node,
    path: Path,
    operations: UpdateOperation[],
  ): void {
    // 检查单元格属性是否变化
    this.compareCellProperties(newCell, oldCell, path, operations);

    // 处理单元格内容
    const newChildren = newCell.children || [];
    const oldChildren = oldCell.children || [];

    this.compareCellChildren(newChildren, oldChildren, path, operations);
  }

  /**
   * 比较单元格属性
   */
  private compareCellProperties(
    newCell: Node,
    oldCell: Node,
    path: Path,
    operations: UpdateOperation[],
  ): void {
    const newCellProps = { ...newCell, children: undefined };
    const oldCellProps = { ...oldCell, children: undefined };

    if (!isEqual(newCellProps, oldCellProps)) {
      operations.push({
        type: 'update',
        path,
        properties: newCellProps,
        priority: 7,
      });
    }
  }

  /**
   * 比较单元格子节点
   */
  private compareCellChildren(
    newChildren: Node[],
    oldChildren: Node[],
    path: Path,
    operations: UpdateOperation[],
  ): void {
    // 简单文本单元格的优化处理
    if (this.isSimpleTextCell(newChildren, oldChildren)) {
      this.compareSimpleTextCell(newChildren, oldChildren, path, operations);
      return;
    }

    // 复杂单元格内容
    this.compareComplexCellChildren(newChildren, oldChildren, path, operations);
  }

  /**
   * 判断是否是简单文本单元格
   */
  private isSimpleTextCell(newChildren: Node[], oldChildren: Node[]): boolean {
    return (
      newChildren.length === 1 &&
      oldChildren.length === 1 &&
      typeof newChildren[0].text === 'string' &&
      typeof oldChildren[0].text === 'string'
    );
  }

  /**
   * 比较简单文本单元格
   */
  private compareSimpleTextCell(
    newChildren: Node[],
    oldChildren: Node[],
    path: Path,
    operations: UpdateOperation[],
  ): void {
    // 只有文本内容变化
    if (newChildren[0].text !== oldChildren[0].text) {
      operations.push({
        type: 'text',
        path: [...path, 0],
        text: newChildren[0].text,
        priority: 8,
      });
    }

    // 检查文本节点的属性变化（加粗、斜体等）
    this.compareTextNodeProperties(
      newChildren[0],
      oldChildren[0],
      path,
      operations,
    );
  }

  /**
   * 比较文本节点属性
   */
  private compareTextNodeProperties(
    newChild: Node,
    oldChild: Node,
    path: Path,
    operations: UpdateOperation[],
  ): void {
    const newTextProps = { ...newChild };
    const oldTextProps = { ...oldChild };
    delete newTextProps.text;
    delete oldTextProps.text;

    if (!isEqual(newTextProps, oldTextProps)) {
      operations.push({
        type: 'update',
        path: [...path, 0],
        properties: newTextProps,
        priority: 7,
      });
    }
  }

  /**
   * 比较复杂单元格子节点
   */
  private compareComplexCellChildren(
    newChildren: Node[],
    oldChildren: Node[],
    path: Path,
    operations: UpdateOperation[],
  ): void {
    // 检查是否结构完全不同
    const structurallyDifferent = this.isStructurallyDifferent(
      newChildren,
      oldChildren,
    );

    if (structurallyDifferent) {
      this.replaceComplexCellChildren(
        newChildren,
        oldChildren,
        path,
        operations,
      );
      return;
    }

    // 逐个比较并更新子节点
    this.compareChildrenSequentially(
      newChildren,
      oldChildren,
      path,
      operations,
    );
  }

  /**
   * 判断结构是否不同
   */
  private isStructurallyDifferent(
    newChildren: Node[],
    oldChildren: Node[],
  ): boolean {
    if (newChildren.length !== oldChildren.length) return true;

    return newChildren.some(
      (n: Node, i: number) => oldChildren[i] && n.type !== oldChildren[i].type,
    );
  }

  /**
   * 替换复杂单元格子节点
   */
  private replaceComplexCellChildren(
    newChildren: Node[],
    oldChildren: Node[],
    path: Path,
    operations: UpdateOperation[],
  ): void {
    const childOps = this.generateDiffOperations(newChildren, oldChildren);

    // 调整子操作的路径
    childOps.forEach((op) => {
      operations.push({
        ...op,
        path: [...path, ...op.path],
      });
    });
  }

  /**
   * 逐个比较子节点
   */
  private compareChildrenSequentially(
    newChildren: Node[],
    oldChildren: Node[],
    path: Path,
    operations: UpdateOperation[],
  ): void {
    const length = Math.min(newChildren.length, oldChildren.length);

    for (let i = 0; i < length; i++) {
      this.compareNodes(
        newChildren[i],
        oldChildren[i],
        [...path, i],
        operations,
      );
    }
  }

  /**
   * 执行操作队列中的所有操作。
   *
   * @param operations - 要执行的操作队列
   *
   * 执行过程：
   * 1. 使用批处理模式执行所有操作
   * 2. 按照操作类型分别处理
   * 3. 处理可能的错误情况
   * 4. 保证操作的原子性
   */
  private executeOperations(operations: UpdateOperation[]): void {
    const editor = this._editor.current;
    if (!editor) return;

    // 使用批处理模式执行所有操作
    Editor.withoutNormalizing(editor, () => {
      for (const op of operations) {
        try {
          switch (op.type) {
            case 'insert':
              if (op.node && editor.hasPath(Path.parent(op.path))) {
                Transforms.insertNodes(editor, op.node, { at: op.path });
              }
              break;

            case 'remove':
              if (editor.hasPath(op.path)) {
                Transforms.removeNodes(editor, { at: op.path });
              }
              break;

            case 'update':
              if (op.properties && editor.hasPath(op.path)) {
                Transforms.setNodes(editor, op.properties, { at: op.path });
              }
              break;

            case 'replace':
              if (op.node && editor.hasPath(op.path)) {
                Transforms.removeNodes(editor, { at: op.path });
                Transforms.insertNodes(editor, op.node, { at: op.path });
              }
              break;

            case 'text':
              if (op.text !== undefined && editor.hasPath(op.path)) {
                Transforms.insertText(editor, op.text, {
                  at: op.path,
                  voids: true,
                });
              }
              break;
          }
        } catch (err) {
          console.error(
            `Error executing operation ${op.type} at path ${op.path}:`,
            err,
          );
        }
      }
    });
  }

  /**
   * 处理拖拽开始事件。
   *
   * @param e - React 拖拽事件对象
   * @param container - 容器 div 元素
   *
   * 此方法会在拖拽开始时调用，主要功能包括：
   * 1. 阻止事件传播
   * 2. 设置拖拽图像
   * 3. 初始化拖拽相关的元素和位置数据
   * 4. 添加拖拽过程中和拖拽结束时的事件监听器
   * 5. 计算可拖拽目标的位置
   * 6. 处理拖拽过程中的视觉反馈
   * 7. 在拖拽结束时更新编辑器内容
   */
  dragStart(e: any, container: HTMLDivElement) {
    e.stopPropagation();
    const img = document.createElement('img');
    img.src =
      'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
    e.dataTransfer.setDragImage(img, 1, 1);
    type MovePoint = {
      el: HTMLDivElement;
      direction: 'top' | 'bottom';
      top: number;
      left: number;
    };
    const ableToEnter =
      this.draggedElement?.dataset?.be === 'list-item'
        ? new Set([
            'paragraph',
            'head',
            'blockquote',
            'code',
            'table',
            'list',
            'list-item',
            'media',
            'attach',
          ])
        : this.ableToEnter;
    let mark: null | HTMLDivElement = null;
    const els = document.querySelectorAll<HTMLDivElement>('[data-be]');
    const points: MovePoint[] = [];
    // @ts-ignore
    for (let el of els) {
      if (!ableToEnter.has(el.dataset.be!)) continue;
      if (el.hasAttribute('data-frontmatter')) continue;
      const pre = el.previousSibling as HTMLElement;
      if (
        el.dataset.be === 'paragraph' &&
        this.draggedElement?.dataset.be === 'list-item' &&
        (!pre || pre.hasAttribute('data-check-item'))
      ) {
        continue;
      }
      if (el === this.draggedElement) continue;
      const top = getOffsetTop(el, container!);
      const left = getOffsetLeft(el, container!);
      points.push({
        el: el,
        direction: 'top',
        left: left,
        top: top,
      });
      points.push({
        el: el,
        left: left,
        direction: 'bottom',
        top: top + el.clientHeight + 2,
      });
    }
    let last: MovePoint | null = null;
    const dragover = (e: DragEvent) => {
      e.preventDefault();
      const top = e.clientY - 40 + container!.scrollTop;
      let distance = 1000000;
      let cur: MovePoint | null = null;
      for (let p of points) {
        let curDistance = Math.abs(p.top - top);
        if (curDistance < distance) {
          cur = p;
          distance = curDistance;
        }
      }
      if (cur) {
        const rect = container!.getBoundingClientRect();
        const scrollTop = container!.scrollTop;
        const scrollLeft = container!.scrollLeft;
        last = cur;
        const width =
          last.el.dataset.be === 'list-item'
            ? last.el.clientWidth + 20 + 'px'
            : last.el.clientWidth + 'px';
        if (!mark) {
          mark = document.createElement('div');
          mark.setAttribute('data-move-mark', '');
          mark.style.width = width;
          mark.style.height = '2px';

          mark.style.transform = `translate(${last.left - rect.left - scrollLeft}px, ${last.top - rect.top - scrollTop}px)`;
          container?.parentElement!.append(mark);
        } else {
          mark.style.width = width;
          mark.style.transform = `translate(${last.left - rect.left - scrollLeft}px, ${last.top - rect.top - scrollTop}px)`;
        }
      }
    };
    window.addEventListener('dragover', dragover);
    window.addEventListener(
      'dragend',
      () => {
        try {
          window.removeEventListener('dragover', dragover);
          if (mark) container?.parentElement!.removeChild(mark);
          if (last && this.draggedElement) {
            let [dragPath, dragNode] = this.toPath(this.draggedElement);
            let [targetPath] = this.toPath(last.el);
            let toPath =
              last.direction === 'top' ? targetPath : Path.next(targetPath);
            if (!Path.equals(targetPath, dragPath)) {
              const parent = Node.parent(this._editor.current, dragPath);
              if (
                Path.equals(Path.parent(targetPath), Path.parent(dragPath)) &&
                Path.compare(dragPath, targetPath) === -1
              ) {
                toPath = Path.previous(toPath);
              }
              let delPath = Path.parent(dragPath);
              const targetNode = Node.get(this._editor.current, targetPath);
              if (dragNode.type === 'list-item') {
                if (targetNode.type !== 'list-item') {
                  Transforms.delete(this._editor.current, { at: dragPath });
                  Transforms.insertNodes(
                    this._editor.current,
                    {
                      ...parent,
                      children: [EditorUtils.copy(dragNode)],
                    },
                    { at: toPath, select: true },
                  );
                  if (parent.children?.length === 1) {
                    if (
                      EditorUtils.isNextPath(Path.parent(dragPath), targetPath)
                    ) {
                      delPath = Path.next(Path.parent(dragPath));
                    } else {
                      delPath = Path.parent(dragPath);
                    }
                  }
                } else {
                  Transforms.moveNodes(this._editor.current, {
                    at: dragPath,
                    to: toPath,
                  });
                }
              } else {
                Transforms.moveNodes(this._editor.current, {
                  at: dragPath,
                  to: toPath,
                });
              }
              if (parent.children?.length === 1) {
                if (
                  Path.equals(Path.parent(toPath), Path.parent(delPath)) &&
                  Path.compare(toPath, delPath) !== 1
                ) {
                  delPath = Path.next(delPath);
                }
                Transforms.delete(this._editor.current, { at: delPath });
              }
            }
            if (dragNode?.type !== 'media')
              this.draggedElement!.draggable = false;
          }
          this.draggedElement = null;
        } catch (error) {
          console.error(error);
        }
      },
      { once: true },
    );
  }

  /**
   * 替换编辑器中的文本内容
   *
   * @param searchText - 要查找和替换的原始文本
   * @param replaceText - 替换后的新文本
   * @param options - 可选参数
   * @param options.caseSensitive - 是否区分大小写，默认为 false
   * @param options.wholeWord - 是否只匹配完整单词，默认为 false
   * @param options.replaceAll - 是否替换所有匹配项，默认为 true
   *
   * @returns 替换操作的数量
   *
   * @example
   * ```ts
   * // 替换所有 "old" 为 "new"
   * const count = store.replaceText("old", "new");
   *
   * // 只替换第一个匹配项，区分大小写
   * const count = store.replaceText("Old", "New", {
   *   caseSensitive: true,
   *   replaceAll: false
   * });
   * ```
   */
  replaceText(
    searchText: string,
    replaceText: string,
    options: {
      caseSensitive?: boolean;
      wholeWord?: boolean;
      replaceAll?: boolean;
    } = {},
  ): number {
    const {
      caseSensitive = false,
      wholeWord = false,
      replaceAll = true,
    } = options;

    if (!searchText) return 0;

    const editor = this._editor.current;
    let replaceCount = 0;

    // 遍历所有文本节点进行替换
    const textNodes = Array.from(
      Editor.nodes(editor, {
        at: [],
        match: (n) => Text.isText(n) && typeof n.text === 'string',
      }),
    );

    Editor.withoutNormalizing(editor, () => {
      if (replaceAll) {
        // 替换所有：从后往前处理，避免路径变化影响前面的操作
        for (let i = textNodes.length - 1; i >= 0; i--) {
          const [node, path] = textNodes[i] as [Node, Path];
          const originalText = node.text;
          let newText = originalText;
          let nodeReplaceCount = 0;

          if (caseSensitive) {
            if (wholeWord) {
              // 匹配完整单词
              const regex = new RegExp(
                `\\b${this.escapeRegExp(searchText)}\\b`,
                'g',
              );
              newText = originalText.replace(regex, () => {
                nodeReplaceCount++;
                return replaceText;
              });
            } else {
              // 普通字符串替换
              newText = originalText.replace(
                new RegExp(this.escapeRegExp(searchText), 'g'),
                () => {
                  nodeReplaceCount++;
                  return replaceText;
                },
              );
            }
          } else {
            if (wholeWord) {
              // 匹配完整单词，不区分大小写
              const regex = new RegExp(
                `\\b${this.escapeRegExp(searchText)}\\b`,
                'gi',
              );
              newText = originalText.replace(regex, () => {
                nodeReplaceCount++;
                return replaceText;
              });
            } else {
              // 普通字符串替换，不区分大小写
              newText = originalText.replace(
                new RegExp(this.escapeRegExp(searchText), 'gi'),
                () => {
                  nodeReplaceCount++;
                  return replaceText;
                },
              );
            }
          }

          // 如果文本发生了变化，更新节点
          if (newText !== originalText) {
            Transforms.insertText(editor, newText, {
              at: path,
              voids: true,
            });
            replaceCount += nodeReplaceCount;
          }
        }
      } else {
        // 只替换第一个：从前往后处理，找到第一个匹配就停止
        for (let i = 0; i < textNodes.length; i++) {
          const [node, path] = textNodes[i] as [Node, Path];
          const originalText = node.text;
          let newText = originalText;
          let nodeReplaceCount = 0;

          if (caseSensitive) {
            if (wholeWord) {
              // 匹配完整单词
              const regex = new RegExp(
                `\\b${this.escapeRegExp(searchText)}\\b`,
                '',
              );
              newText = originalText.replace(regex, () => {
                nodeReplaceCount++;
                return replaceText;
              });
            } else {
              // 普通字符串替换
              newText = originalText.replace(
                new RegExp(this.escapeRegExp(searchText), ''),
                () => {
                  nodeReplaceCount++;
                  return replaceText;
                },
              );
            }
          } else {
            if (wholeWord) {
              // 匹配完整单词，不区分大小写
              const regex = new RegExp(
                `\\b${this.escapeRegExp(searchText)}\\b`,
                'i',
              );
              newText = originalText.replace(regex, () => {
                nodeReplaceCount++;
                return replaceText;
              });
            } else {
              // 普通字符串替换，不区分大小写
              newText = originalText.replace(
                new RegExp(this.escapeRegExp(searchText), 'i'),
                () => {
                  nodeReplaceCount++;
                  return replaceText;
                },
              );
            }
          }

          // 如果文本发生了变化，更新节点并停止
          if (newText !== originalText) {
            Transforms.insertText(editor, newText, {
              at: path,
              voids: true,
            });
            replaceCount += nodeReplaceCount;
            break; // 只替换第一个匹配项
          }
        }
      }
    });

    return replaceCount;
  }

  /**
   * 在选中的区域内替换文本
   *
   * @param searchText - 要查找和替换的原始文本
   * @param replaceText - 替换后的新文本
   * @param options - 可选参数
   * @param options.caseSensitive - 是否区分大小写，默认为 false
   * @param options.wholeWord - 是否只匹配完整单词，默认为 false
   * @param options.replaceAll - 是否替换所有匹配项，默认为 true
   *
   * @returns 替换操作的数量，如果没有选中区域则返回 0
   *
   * @example
   * ```ts
   * // 在选中区域内替换文本
   * const count = store.replaceTextInSelection("old", "new");
   * ```
   */
  replaceTextInSelection(
    searchText: string,
    replaceText: string,
    options: {
      caseSensitive?: boolean;
      wholeWord?: boolean;
      replaceAll?: boolean;
    } = {},
  ): number {
    const editor = this._editor.current;
    const selection = editor.selection;

    if (!selection || Range.isCollapsed(selection)) {
      return 0;
    }

    const {
      caseSensitive = false,
      wholeWord = false,
      replaceAll = true,
    } = options;

    if (!searchText) return 0;

    let replaceCount = 0;

    // 获取选中区域的文本节点
    const textNodes = Array.from(
      Editor.nodes(editor, {
        at: selection,
        match: (n) => Text.isText(n) && typeof n.text === 'string',
      }),
    );

    Editor.withoutNormalizing(editor, () => {
      // 从后往前处理，避免路径变化影响前面的操作
      for (let i = textNodes.length - 1; i >= 0; i--) {
        const [node, path] = textNodes[i] as [Node, Path];
        const originalText = node.text;
        let newText = originalText;
        let nodeReplaceCount = 0;

        if (caseSensitive) {
          if (wholeWord) {
            const regex = new RegExp(
              `\\b${this.escapeRegExp(searchText)}\\b`,
              'g',
            );
            newText = originalText.replace(regex, () => {
              nodeReplaceCount++;
              return replaceText;
            });
          } else {
            newText = originalText.replace(
              new RegExp(this.escapeRegExp(searchText), 'g'),
              () => {
                nodeReplaceCount++;
                return replaceText;
              },
            );
          }
        } else {
          if (wholeWord) {
            const regex = new RegExp(
              `\\b${this.escapeRegExp(searchText)}\\b`,
              'gi',
            );
            newText = originalText.replace(regex, () => {
              nodeReplaceCount++;
              return replaceText;
            });
          } else {
            newText = originalText.replace(
              new RegExp(this.escapeRegExp(searchText), 'gi'),
              () => {
                nodeReplaceCount++;
                return replaceText;
              },
            );
          }
        }

        if (newText !== originalText) {
          Transforms.insertText(editor, newText, {
            at: path,
            voids: true,
          });
          replaceCount += nodeReplaceCount;

          if (!replaceAll && nodeReplaceCount > 0) {
            break;
          }
        }
      }
    });

    return replaceCount;
  }

  /**
   * 替换所有匹配的文本（replaceText 的简化版本）
   *
   * @param searchText - 要查找和替换的原始文本
   * @param replaceText - 替换后的新文本
   * @param caseSensitive - 是否区分大小写，默认为 false
   *
   * @returns 替换操作的数量
   *
   * @example
   * ```ts
   * // 替换所有 "old" 为 "new"
   * const count = store.replaceAll("old", "new");
   *
   * // 区分大小写替换
   * const count = store.replaceAll("Old", "New", true);
   * ```
   */
  replaceAll(
    searchText: string,
    replaceText: string,
    caseSensitive: boolean = false,
  ): number {
    return this.replaceText(searchText, replaceText, {
      caseSensitive,
      replaceAll: true,
    });
  }

  /**
   * 转义正则表达式特殊字符
   *
   * @param string - 需要转义的字符串
   * @returns 转义后的字符串
   * @private
   */
  private escapeRegExp(string: string): string {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  /**
   * 在编辑器中根据路径描述和文本内容查找并选择匹配位置
   *
   * @param pathDescription - 路径描述，用于限制搜索范围。可以是：
   *                         - 节点类型（如 "paragraph", "table", "list"）
   *                         - 包含特定文本的节点区域
   *                         - 空字符串表示在整个编辑器中搜索
   * @param searchText - 要查找的文本内容
   * @param options - 查找选项
   * @returns 匹配结果数组
   *
   * @example
   * ```ts
   * // 查找所有包含 "focus" 的位置
   * const results = store.findByPathAndText("", "focus");
   */
  findByPathAndText(
    pathDescription: Path,
    searchText: string,
    options: {
      caseSensitive?: boolean;
      wholeWord?: boolean;
      maxResults?: number;
    } = {},
  ) {
    const {
      caseSensitive = false,
      wholeWord = false,
      maxResults = 50,
    } = options;

    if (!searchText.trim()) return [];

    const editor = this._editor.current;
    return findByPathAndText(editor, pathDescription, searchText, {
      caseSensitive,
      wholeWord,
      maxResults,
    });
  }

  /**
   * 更新编辑器的状态数据
   *
   * @param value - 状态更新器，可以是函数或对象
   *
   * 该方法提供两种更新状态的方式：
   * 1. 函数式更新：传入一个函数，可以直接修改状态
   * 2. 对象式更新：传入一个对象，直接覆盖对应的状态值
   *
   * @example
   * ```ts
   * // 函数式更新 - 可以访问当前状态
   * setState((state) => {
   *   state.focus = true;
   *   state.manual = false;
   * });
   *
   * // 对象式更新 - 直接设置新值
   * setState({
   *   focus: true,
   *   manual: false
   * });
   * ```
   */
  setState(value: (state: EditorStore) => void) {
    if (value instanceof Function) {
      value(this);
    } else {
      for (let key of Object.keys(value)) {
        // @ts-ignore
        this[key] = value[key];
      }
    }
  }
}
