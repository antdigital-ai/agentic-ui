/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable react/no-children-prop */
import classNames from 'clsx';
import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import {
  BaseRange,
  BaseSelection,
  Editor,
  Node,
  Range,
  Transforms,
} from 'slate';
import {
  ReactEditor,
  RenderElementProps,
  RenderLeafProps,
  Slate,
} from 'slate-react';
import { useDebounceFn } from '../../Hooks/useDebounceFn';
import { useRefFunction } from '../../Hooks/useRefFunction';
import { isWeChat } from '../../Utils/env';
import { parserMdToSchema } from '../BaseMarkdownEditor';
import { Elements } from '../el';
import { PluginContext } from '../plugin';
import {
  CommentDataType,
  MarkdownEditorInstance,
  MarkdownEditorProps,
} from '../types';
import { LazyElement } from './components/LazyElement';
import { EditorEditable } from './components/EditorEditable';
import { MElement, MLeaf } from './elements';
import { buildFootnoteDefinitionChangePayload } from './utils/footnoteDisplay';
import { applyTableMinSizeToSchema } from './utils/genTableMinSize';
import {
  handleFilesPaste,
  handleHtmlPaste,
  handleHttpLinkPaste,
  handlePlainTextPaste,
  handleSlateMarkdownFragment,
  handleSpecialTextPaste,
  handleTagNodePaste,
  shouldInsertTextDirectly,
} from './plugins/handlePaste';
import { parseMarkdownToNodesAndInsert } from './plugins/parseMarkdownToNodesAndInsert';
import { useHighlight } from './plugins/useHighlight';
import { useKeyboard } from './plugins/useKeyboard';
import { useOnchange } from './plugins/useOnchange';
import { useEditorStore } from './store';
import { useStyle } from './style';
import { MARKDOWN_EDITOR_EVENTS, copy, parserSlateNodeToMarkdown } from './utils';
import {
  cleanWordHtml,
  htmlToMarkdown,
  isWordHtml,
} from './utils/htmlToMarkdown';
import {
  EditorUtils,
  findByPathAndText,
  findLeafPath,
  getSelectionFromDomSelection,
  hasEditableTarget,
  isEventHandled,
  isPath,
} from './utils/editorUtils';
import {
  commitImeCompositionTextIfMissing,
  getEditorTextSnapshot,
  clearImeEnterCommitGuard,
  markImeEnterCommitGuard,
  scheduleClearInputComposition,
} from './utils/isImeComposing';

// 默认允许的类型
const defaultAllowedTypes = [
  'application/x-slate-md-fragment',
  'text/html',
  'Files',
  'text/markdown',
  'text/plain',
];
/**
 * Markdown 编辑器组件的属性接口
 *
 * 扩展了基础的 MarkdownEditorProps，添加了编辑器特定的配置
 */
export type MEditorProps = {
  /** 自定义元素项渲染函数 */
  eleItemRender?: MarkdownEditorProps['eleItemRender'];
  /** 自定义叶子节点渲染函数 */
  leafRender?: MarkdownEditorProps['leafRender'];
  /** 内容变化时的回调函数 */
  onChange?: MarkdownEditorProps['onChange'];
  /** 编辑器实例对象 */
  instance: MarkdownEditorInstance;
  /** 自定义CSS类名 */
  className?: string;
  /** 评论相关配置 */
  comment?: MarkdownEditorProps['comment'];
  /** CSS前缀类名 */
  prefixCls?: string;
  /** 是否为报告模式 */
  reportMode?: MarkdownEditorProps['reportMode'];
  /** 输入框占位符文本 */
  placeholder?: string;
  /** Slate 壳 remount 序号（插件 withEditor 栈变化时递增） */
  slateRemountKey?: number;
} & MarkdownEditorProps;

/**
 * SlateMarkdownEditor 组件 - Slate Markdown编辑器组件
 *
 * 基于 Slate.js 的 Markdown 编辑器，状态由 EditorStore 与 React Context 协作管理。
 *
 * @component
 * @description 基于Slate.js的Markdown编辑器组件
 * @param {MEditorProps} props - 编辑器属性
 * @param {Function} [props.eleItemRender] - 自定义元素渲染函数
 * @param {Function} [props.leafRender] - 自定义叶子节点渲染函数
 * @param {Function} [props.onChange] - 内容变化回调
 * @param {MarkdownEditorInstance} props.instance - 编辑器实例
 * @param {string} [props.className] - 自定义CSS类名
 * @param {CommentDataType} [props.comment] - 评论数据
 * @param {string} [props.prefixCls] - 前缀类名
 * @param {boolean} [props.reportMode] - 是否为报告模式
 * @param {string} [props.placeholder] - 占位符文本
 *
 * @example
 * ```tsx
 * <SlateMarkdownEditor
 *   instance={editorInstance}
 *   onChange={(value) => console.log('内容变化:', value)}
 *   placeholder="请输入Markdown内容..."
 *   reportMode={false}
 * />
 * ```
 *
 * @returns {React.ReactElement} 渲染的Markdown编辑器组件
 *
 * @remarks
 * - 基于Slate.js实现
 * - 支持丰富的Markdown语法
 * - 提供自定义渲染功能
 * - 支持插件系统
 * - 集成状态管理
 * - 支持键盘快捷键
 * - 提供粘贴处理
 * - 支持错误边界
 * - 响应式布局
 */
export const SlateMarkdownEditor = React.memo((props: MEditorProps) => {
  // 所有hooks必须在组件顶部按固定顺序调用
  const {
    store,
    markdownEditorRef,
    markdownContainerRef,
    readonly,
    setDomRect,
    jinjaEnabled,
  } = useEditorStore();

  // 懒加载元素索引计数器
  const lazyElementIndexRef = useRef(0);
  // 用于标记是否已在当前渲染周期重置过索引
  const hasResetIndexRef = useRef(false);

  // 计算懒加载元素总数的函数
  const countLazyElements = useRefFunction((nodes: any[]): number => {
    let count = 0;
    const traverse = (nodeList: any[]) => {
      nodeList.forEach((node) => {
        // 跳过表格单元格和表格行
        if (node.type !== 'table-cell' && node.type !== 'table-row') {
          count++;
        }
        // 继续遍历子节点（例如表格内的元素）
        if (node.children && Array.isArray(node.children)) {
          traverse(node.children);
        }
      });
    };
    traverse(nodes);
    return count;
  });

  const changedMark = useRef(false);
  const value = useRef<any[]>([EditorUtils.p]);
  const nodeRef = useRef<MarkdownEditorInstance>();
  const first = useRef(true);
  const cancelClearInputCompositionRef = useRef<(() => void) | null>(null);
  const [suppressPlaceholderForIme, setSuppressPlaceholderForIme] =
    useState(false);
  const [hasEmptyRootParagraph, setHasEmptyRootParagraph] = useState(false);
  const lastCompositionDataRef = useRef('');

  const plugins = useContext(PluginContext);

  const onKeyDown = useKeyboard(store, markdownEditorRef, props);
  // 选区跟踪开关：FloatBar 启用 或 提供了 onSelectionChange 才需要每次都跑 Editor.nodes/DOMRect
  const selectionTrackingEnabled =
    !!props.onSelectionChange ||
    (readonly
      ? !!props.reportMode && props.floatBar?.enable !== false
      : props.floatBar?.enable !== false);
  const onChange = useOnchange(props.onChange, {
    wait: props.onChangeDebounceWait,
    selectionTrackingEnabled,
  });
  const high = useHighlight(store, jinjaEnabled);

  const readonlyCls = useMemo(() => {
    if (readonly) return 'readonly';
    return hasEmptyRootParagraph ? 'focus' : '';
  }, [readonly, hasEmptyRootParagraph]);

  const { hashId } = useStyle(`${props.prefixCls}-content`, {
    placeholderContent: props?.textAreaProps?.placeholder || props?.placeholder,
  });

  const commentMap = useMemo(() => {
    const map = new Map<string, Map<string, CommentDataType[]>>();
    props?.comment?.commentList?.forEach((c: CommentDataType) => {
      c.updateTime = Date.now();
      const path = c.path.join(',');
      if (map.has(path)) {
        const childrenMap = map.get(path);
        const selection = JSON.stringify(c.selection);
        if (childrenMap?.has(selection)) {
          childrenMap.set(selection, [
            ...(childrenMap.get(selection) || []),
            c,
          ]);
          map.set(path, childrenMap);
          return;
        } else if (childrenMap) {
          childrenMap?.set(selection, [c]);
          map.set(path, childrenMap);
          return;
        }
      }
      const childrenMap = new Map<string, CommentDataType[]>();
      childrenMap.set(JSON.stringify(c.selection), [c]);
      map.set(path, childrenMap);
    });
    return map;
  }, [props?.comment?.commentList]);

  const handleSelectionChange = useDebounceFn(
    async (e?: React.SyntheticEvent<HTMLDivElement>) => {
      // 只读且不需要选区（无 onSelectionChange、无 FloatBar）时，跳过选区同步与 DOM 测量，提升性能
      if (
        readonly &&
        !props.onSelectionChange &&
        (!props.reportMode || props.floatBar?.enable === false)
      ) {
        setDomRect?.(null);
        return;
      }
      const currentSelection = markdownEditorRef.current.selection;

      // 获取选中内容的 markdown 和节点
      const getSelectionContent = (selection: BaseSelection | null) => {
        if (!selection || Range.isCollapsed(selection)) {
          return { markdown: '', nodes: [] };
        }

        try {
          const fragment = Editor.fragment(
            markdownEditorRef.current,
            selection,
          );
          const markdown = parserSlateNodeToMarkdown(fragment);
          return { markdown, nodes: fragment };
        } catch (error) {
          console.error('Failed to get selection content:', error);
          return { markdown: '', nodes: [] };
        }
      };

      if (!readonly) {
        // 非只读模式下的选区处理
        const event = new CustomEvent<BaseSelection>(
          MARKDOWN_EDITOR_EVENTS.SELECTIONCHANGE,
          {
            ...e,
            detail: currentSelection,
          },
        );
        markdownContainerRef?.current?.dispatchEvent(event);

        // 调用 props.onSelectionChange 回调
        if (props.onSelectionChange) {
          const { markdown, nodes } = getSelectionContent(currentSelection);
          props.onSelectionChange?.(currentSelection, markdown, nodes);
        }

        return;
      }
      if (typeof window === 'undefined') return;
      // 只读模式下的选区处理
      const domSelection = window.getSelection();
      if (!domSelection) {
        setDomRect?.(null);
        // 调用 props.onSelectionChange 回调（无选中）
        if (props.onSelectionChange) {
          props.onSelectionChange?.(null, '', []);
        }
        return;
      }

      try {
        const selection = getSelectionFromDomSelection(
          markdownEditorRef.current,
          domSelection,
        );

        if (selection) {
          // 更新编辑器的选区
          markdownEditorRef.current.selection = selection;

          // 触发选区变化事件
          const event = new CustomEvent<BaseSelection>(
            MARKDOWN_EDITOR_EVENTS.SELECTIONCHANGE,
            {
              detail: selection,
            },
          );
          markdownContainerRef?.current?.dispatchEvent(event);

          // 调用 props.onSelectionChange 回调
          if (props.onSelectionChange) {
            const { markdown, nodes } = getSelectionContent(selection);
            props.onSelectionChange?.(selection, markdown, nodes);
          }

          if (
            !Range.isCollapsed(selection) &&
            Editor.hasPath(markdownEditorRef.current, selection.anchor.path) &&
            Editor.hasPath(markdownEditorRef.current, selection.focus.path)
          ) {
            try {
              const range = ReactEditor.toDOMRange(
                markdownEditorRef.current,
                selection,
              );
              const rect = range?.getBoundingClientRect();
              setDomRect?.(rect ?? null);
            } catch {
              setDomRect?.(null);
            }
          } else {
            setDomRect?.(null);
          }
        } else {
          setDomRect?.(null);
          // 调用 props.onSelectionChange 回调（无选中）
          if (props.onSelectionChange) {
            props.onSelectionChange?.(null, '', []);
          }
        }
      } catch (error) {
        console.error('Selection change error:', error);
      }
    },
    16,
  );

  // 添加选区变化的监听
  useEffect(() => {
    const container = markdownContainerRef?.current;
    if (!container) return;

    // 勿对 mouseup/touchend 调用 preventDefault：移动端触摸会合成 mouse 事件，
    // 阻止默认行为会导致 contenteditable 无法稳定聚焦或 IME 无法写入（与 #401 同类）。
    const handlePointerUp = (e: MouseEvent | TouchEvent) => {
      handleSelectionChange.run();
      if (readonly || !isWeChat()) return;
      const target = e.target as HTMLElement | null;
      if (!target?.closest('[contenteditable="true"]')) return;
      const editor = markdownEditorRef.current;
      if (!editor) return;
      requestAnimationFrame(() => {
        try {
          if (!ReactEditor.isFocused(editor)) {
            EditorUtils.focus(editor);
          }
        } catch {
          // 编辑器未挂载或只读态下忽略
        }
      });
    };
    container.addEventListener('mouseup', handlePointerUp);
    container.addEventListener('touchend', handlePointerUp, { passive: true });

    return () => {
      container.removeEventListener('mouseup', handlePointerUp);
      container.removeEventListener('touchend', handlePointerUp);
      handleSelectionChange.cancel();
    };
  }, [readonly, markdownContainerRef?.current]);

  useEffect(() => {
    if (nodeRef.current !== props.instance) {
      initialNote();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- markdownEditorRef.current 是可变 ref，此处需在编辑器实例变化时重新执行
  }, [props.instance]);

  const emitFootnoteDefinitionChange = useRefFunction((schema: Elements[]) => {
    const onFootnoteDefinitionChange =
      props?.fncProps?.onFootnoteDefinitionChange;
    if (!onFootnoteDefinitionChange) {
      return;
    }
    onFootnoteDefinitionChange(buildFootnoteDefinitionChangePayload(schema));
  });

  useEffect(() => {
    emitFootnoteDefinitionChange(markdownEditorRef.current.children);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 挂载 / 回调引用变更时同步一次
  }, [props?.fncProps?.onFootnoteDefinitionChange]);

  // 非hook变量声明
  const { prefixCls = '$' } = props.tagInputProps || {};
  const baseClassName = `${props.prefixCls}-content`;

  const onSlateChange = useRefFunction((v: any[]) => {
    const operations = [...(markdownEditorRef.current.operations ?? [])];
    const hasContentChanges = operations.some(
      (op) => op.type !== 'set_selection',
    );

    // 忽略初始化时「仅选区 / 无实质操作」的第一次回调；若用户首次交互就是改内容（如 void 代码块 textarea），必须上报
    if (first.current) {
      if (!hasContentChanges) {
        return;
      }
      first.current = false;
    }

    // 更新当前值引用
    value.current = v;
    setHasEmptyRootParagraph(
      v.some(
        (node) =>
          node.type === 'paragraph' && node.children?.at?.(0)?.text === '',
      ),
    );
    // 触发onChange回调
    onChange(v, operations);
    // 检查是否存在非选区变化操作，如有则标记内容已变更
    if (hasContentChanges && !changedMark.current) {
      changedMark.current = true;
    }
    if (hasContentChanges) {
      emitFootnoteDefinitionChange(v);
    }
  });

  const checkEnd = useRefFunction((e: React.MouseEvent) => {
    // 如果启用打字机模式或为只读模式，不处理定位逻辑
    if (props?.typewriter) return;
    if (readonly) {
      // 点击时清除工具栏
      setDomRect?.(null);
      return;
    }

    // 获取目标元素
    const target = e.target as HTMLDivElement;

    // 如果启用文本区域模式，不处理定位逻辑
    if (props.textAreaProps?.enable) {
      return false;
    }

    // 检查是否点击在编辑器内容区域
    if (target.dataset.slateEditor) {
      // 获取最后一个元素的顶部位置
      const top = (target.lastElementChild as HTMLElement)?.offsetTop;

      // 判断点击位置是否在编辑器内容底部区域
      // 当点击位置距离顶部的距离大于最后一个元素的顶部位置时，认为点击在底部区域
      if (
        markdownContainerRef.current &&
        markdownContainerRef.current.scrollTop + e.clientY - 60 > top
      ) {
        // 尝试将光标设置到编辑器内容末尾
        if (EditorUtils.checkEnd(markdownEditorRef.current)) {
          e.preventDefault();
        }
      }
    }
  });

  const handleClipboardCopy = useRefFunction(
    (
      event: React.ClipboardEvent<HTMLDivElement>,
      operationType: 'copy' | 'cut',
    ): boolean => {
      try {
        // 1. 如果事件已被处理，则直接返回
        if (isEventHandled(event)) {
          return false;
        }

        // 2. 检查目标元素是否可编辑，如果不可编辑，则从DOM选区中获取编辑器选区
        if (
          operationType === 'copy' &&
          !hasEditableTarget(markdownEditorRef.current, event.target)
        ) {
          const domSelection = window.getSelection();
          if (domSelection) {
            markdownEditorRef.current.selection = getSelectionFromDomSelection(
              markdownEditorRef.current,
              domSelection,
            );
          }
        } else if (operationType === 'cut') {
          const domSelection = window.getSelection();
          if (domSelection) {
            markdownEditorRef.current.selection = getSelectionFromDomSelection(
              markdownEditorRef.current,
              domSelection,
            );
          }
        }

        // 如果无法获取选区，则直接返回
        if (!markdownEditorRef.current.selection) {
          return false;
        }

        // 3. 处理复制/剪切选中内容
        if (markdownEditorRef.current?.selection) {
          event.clipboardData?.clearData();
          const editor = markdownEditorRef.current;
          const sel = editor.selection as Range;

          if (
            !Editor.hasPath(editor, sel.anchor.path) ||
            !Editor.hasPath(editor, sel.focus.path)
          ) {
            return false;
          }

          try {
            // ReactEditor.setFragmentData 内部会写 application/x-slate-fragment、
            // text/html、text/plain（slate-dom）。我们让它先写默认值再追加自定义键，
            // 避免重复 cloneContents / 多次 markdown 序列化。
            ReactEditor.setFragmentData(
              markdownEditorRef.current,
              event.clipboardData,
              operationType,
            );

            const fragment = editor?.getFragment() || [];
            const markdown = parserSlateNodeToMarkdown(fragment);

            // 自定义 key 不会被 Slate 默认实现覆盖
            event.clipboardData.setData(
              'application/x-slate-md-fragment',
              JSON.stringify(fragment),
            );
            // text/markdown 是非标准 MIME，但同源粘回时会优先使用，且保留 markdown 原文
            event.clipboardData.setData('text/markdown', markdown);

            // 5. 如果是剪切操作，删除选中内容
            if (operationType === 'cut') {
              Transforms.delete(markdownEditorRef.current, {
                at: markdownEditorRef.current.selection!,
              });
            }

            // 阻止默认行为和事件冒泡
            event.preventDefault();

            return true;
          } catch (innerError) {
            console.error('Error during clipboard operation:', innerError);
            return false;
          }
        }

        return false;
      } catch (error) {
        console.error('Clipboard copy/cut operation failed:', error);
        return false;
      }
    },
  );

  const handleKeyDown = useRefFunction(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (
        props.tagInputProps?.enable &&
        [prefixCls].flat(2)?.includes(event?.key)
      ) {
        event.preventDefault();
        event.stopPropagation();
        Transforms.insertNodes(markdownEditorRef.current, [
          {
            code: true,
            tag: true,
            autoOpen: true,
            text: event?.key + ' ',
            triggerText: event?.key,
          },
        ]);
        return;
      }
      onKeyDown(event);
    },
  );

  /**
   * 初始化编辑器
   */
  const initialNote = async () => {
    if (props.instance) {
      nodeRef.current = props.instance;
      first.current = true;
      const tableConfig = props.tableConfig;
      const schemaForReset = props.initSchemaValue?.length
        ? copy(props.initSchemaValue)
        : undefined;
      if (schemaForReset && tableConfig) {
        applyTableMinSizeToSchema(schemaForReset, {
          minColumn: tableConfig.minColumn,
          minRows: tableConfig.minRows,
        });
      }
      try {
        EditorUtils.reset(
          markdownEditorRef.current,
          schemaForReset?.length ? schemaForReset : undefined,
        );
      } catch (e) {
        EditorUtils.deleteAll(markdownEditorRef.current);
      }
    } else {
      nodeRef.current = undefined;
    }
  };

  useEffect(() => {
    if (nodeRef.current !== props.instance) {
      initialNote();
    }
  }, [props.instance]);

  useEffect(() => {
    first.current = true;
  }, [props.slateRemountKey]);

  /**
   * 实际的粘贴处理逻辑
   */
  const handlePasteEvent = async (
    event: React.ClipboardEvent<HTMLDivElement>,
  ) => {
    event.stopPropagation();
    event.preventDefault();

    const pasteConfig = props.pasteConfig;
    if (pasteConfig?.enabled === false) {
      return;
    }

    // 入口同步缓存全部需要的 clipboard 字段。React 合成事件 + await 之后在
    // Safari 下 clipboardData 可能被清空，必须先读后 await。
    const clipboardData = event.clipboardData;
    const types = Array.from(clipboardData?.types || ['text/plain']);
    const cachedHtml = types.includes('text/html')
      ? clipboardData?.getData('text/html') || ''
      : '';
    const cachedRtf = types.includes('text/rtf')
      ? clipboardData?.getData('text/rtf') || ''
      : '';
    const cachedSlateMd = types.includes('application/x-slate-md-fragment')
      ? clipboardData?.getData('application/x-slate-md-fragment') || ''
      : '';
    const cachedMarkdown = types.includes('text/markdown')
      ? clipboardData?.getData('text/markdown') || ''
      : '';
    const cachedPlain = types.includes('text/plain')
      ? clipboardData?.getData('text/plain') || ''
      : '';
    const cachedFiles = clipboardData?.files
      ? Array.from(clipboardData.files)
      : [];

    const currentTextSelection = markdownEditorRef.current.selection;
    if (
      currentTextSelection &&
      currentTextSelection.anchor &&
      Editor.hasPath(
        markdownEditorRef.current,
        currentTextSelection.anchor.path,
      )
    ) {
      if (!Range.isCollapsed(currentTextSelection)) {
        Transforms.delete(markdownEditorRef.current, {
          at: currentTextSelection!,
          reverse: true,
        });
      }
    }

    if (currentTextSelection) {
      const nodeList = Editor?.node(
        markdownEditorRef.current,
        currentTextSelection.focus.path!,
      );
      const curNode = nodeList?.at(0);
      if (
        handleTagNodePaste(
          markdownEditorRef.current,
          currentTextSelection,
          clipboardData,
          curNode,
        )
      ) {
        return;
      }
    }

    const result = props.onPaste?.(event);
    if (result === false) {
      return;
    }

    const allowedTypes = pasteConfig?.allowedTypes || defaultAllowedTypes;

    // 1. slate-md-fragment（同源复制粘贴）
    if (
      cachedSlateMd &&
      allowedTypes.includes('application/x-slate-md-fragment')
    ) {
      // handleSlateMarkdownFragment 仍读 clipboardData（同步），保留兼容；
      // 同时把字符串塞回 DataTransfer 风格的最小适配器，避免 Safari 跨 await 失效。
      const synthetic = {
        getData: (k: string) =>
          k === 'application/x-slate-md-fragment' ? cachedSlateMd : '',
      } as unknown as DataTransfer;
      if (
        handleSlateMarkdownFragment(
          markdownEditorRef.current,
          synthetic,
          currentTextSelection,
        )
      ) {
        return;
      }
    }

    // 2. text/html —— 大文档守门，超阈值降级到 text/plain
    const htmlMaxBytes = pasteConfig?.htmlMaxBytes ?? 1_048_576;
    const htmlOversize = htmlMaxBytes > 0 && cachedHtml.length > htmlMaxBytes;
    if (
      cachedHtml &&
      !htmlOversize &&
      allowedTypes.includes('text/html')
    ) {
      // 2a. Word/Office HTML：先 cleanWordHtml + htmlToMarkdown 转 markdown，
      // 再走 markdown 解析流水线，比 docxDeserializer 直接 HTML→Slate 更稳。
      const wordToMd = pasteConfig?.convertWordToMarkdown !== false;
      if (wordToMd && isWordHtml(cachedHtml)) {
        try {
          const cleaned = cleanWordHtml(cachedHtml);
          const md = htmlToMarkdown(cleaned).trim();
          if (md) {
            parseMarkdownToNodesAndInsert(
              markdownEditorRef.current,
              md,
              plugins,
            );
            return;
          }
        } catch (err) {
          console.error(
            '[handlePaste] Word HTML→markdown 转换失败，回退到默认 HTML 解析:',
            err,
          );
          // 失败时让下面的 handleHtmlPaste 接管
        }
      }

      const syntheticForHtml = {
        getData: (k: string) => {
          if (k === 'text/html') return cachedHtml;
          if (k === 'text/rtf') return cachedRtf;
          return '';
        },
      } as unknown as DataTransfer;
      const ok = await handleHtmlPaste(
        markdownEditorRef.current,
        syntheticForHtml,
        props,
      );
      if (ok) return;
    }

    // 3. Files
    if (cachedFiles.length && allowedTypes.includes('Files')) {
      const syntheticForFiles = {
        files: cachedFiles as unknown as FileList,
      } as unknown as DataTransfer;
      if (
        await handleFilesPaste(
          markdownEditorRef.current,
          syntheticForFiles,
          props,
        )
      ) {
        return;
      }
    }

    // 4. text/markdown
    if (cachedMarkdown && allowedTypes.includes('text/markdown')) {
      const text = cachedMarkdown.trim();
      if (text) {
        const selection = markdownEditorRef.current.selection;
        // 与 text/plain 保持一致：在代码块/表格单元格内不解析为 markdown 节点
        if (shouldInsertTextDirectly(markdownEditorRef.current, selection)) {
          Transforms.insertText(markdownEditorRef.current, text);
        } else {
          Transforms.insertFragment(
            markdownEditorRef.current,
            parserMdToSchema(text, plugins).schema,
          );
        }
      }
      return;
    }
    // 5. text/plain（含从 oversize HTML 降级过来的情形）
    if (
      (cachedPlain || htmlOversize) &&
      allowedTypes.includes('text/plain')
    ) {
      const text = (cachedPlain || '').trim();
      if (!text) return;

      const selection = markdownEditorRef.current.selection;

      if (pasteConfig?.plainTextOnly) {
        if (selection) {
          Transforms.insertText(markdownEditorRef.current, text, {
            at: selection,
          });
        } else {
          Transforms.insertNodes(markdownEditorRef.current, [
            { type: 'paragraph', children: [{ text }] },
          ]);
        }
        return;
      }

      if (shouldInsertTextDirectly(markdownEditorRef.current, selection)) {
        Transforms.insertText(markdownEditorRef.current, text);
        return;
      }

      try {
        if (
          handleSpecialTextPaste(markdownEditorRef.current, text, selection)
        ) {
          return;
        }
        if (
          handleHttpLinkPaste(markdownEditorRef.current, text, selection, store)
        ) {
          return;
        }
        if (
          await handlePlainTextPaste(
            markdownEditorRef.current,
            text,
            selection,
            plugins,
            allowedTypes,
            {
              parseMarkdownInPlainText:
                pasteConfig?.parseMarkdownInPlainText,
            },
          )
        ) {
          return;
        }
      } catch (e) {
        console.error('[handlePaste] 处理纯文本粘贴失败:', e);
      }
    }

    // 6. 全部失败 → 走 Slate 默认插入逻辑
    if (hasEditableTarget(markdownEditorRef.current, event.target)) {
      ReactEditor.insertData(markdownEditorRef.current, clipboardData);
    }
  };

  /**
   * 处理粘贴事件，会把粘贴的内容转换为对应的节点
   * @description paste event
   * @param {React.ClipboardEvent<HTMLDivElement>} e
   */
  const onPaste = useRefFunction(handlePasteEvent);

  const syncEditableRootCompositionAttr = useRefFunction((active: boolean) => {
    try {
      const root = ReactEditor.toDOMNode(
        markdownEditorRef.current,
        markdownEditorRef.current,
      ) as HTMLElement;
      if (active) {
        root.setAttribute('data-composition', '');
      } else {
        root.removeAttribute('data-composition');
      }
    } catch {
      // editor not mounted
    }
  });

  const syncTagPopupCompositionAttr = useRefFunction((active: boolean) => {
    const focusPath = markdownEditorRef.current.selection?.focus.path || [];
    if (focusPath.length === 0) return;
    try {
      const node = Node.get(markdownEditorRef.current, focusPath);
      const dom = ReactEditor.toDOMNode(markdownEditorRef.current, node);
      const tagInput = dom?.querySelector('[data-tag-popup-input]');
      if (!tagInput) return;
      if (active) {
        tagInput.setAttribute('data-composition', '');
      } else {
        tagInput.removeAttribute('data-composition');
      }
    } catch {
      // node may not be mounted yet; ignore
    }
  });

  /** 进入 IME 组合态（勿 preventDefault，见 #401） */
  const activateInputComposition = useRefFunction(() => {
    cancelClearInputCompositionRef.current?.();
    cancelClearInputCompositionRef.current = null;

    markdownContainerRef.current?.setAttribute('data-composition', '');
    syncEditableRootCompositionAttr(true);
    setSuppressPlaceholderForIme(true);
    store.inputComposition = true;
    props.onCompositionActiveChange?.(true);
    syncTagPopupCompositionAttr(true);
  });

  /**
   * 处理输入法开始事件
   */
  const onCompositionStart = () => {
    lastCompositionDataRef.current = '';
    activateInputComposition();
  };

  /**
   * 部分 Android WebView（如微信）可能跳过 compositionstart 直接触发
   * compositionupdate；微信下每次 update 都刷新组合态，避免 inputComposition 卡住。
   */
  const onCompositionUpdate = (event: React.CompositionEvent) => {
    if (event.data) {
      lastCompositionDataRef.current = event.data;
    }

    if (isWeChat()) {
      activateInputComposition();
      return;
    }
    if (
      markdownContainerRef.current &&
      !markdownContainerRef.current.hasAttribute('data-composition')
    ) {
      activateInputComposition();
    }
  };

  /**
   * 处理输入法结束事件
   */
  const onCompositionEnd = useRefFunction((event?: React.CompositionEvent) => {
    markImeEnterCommitGuard();

    const composedText = event?.data || lastCompositionDataRef.current;
    lastCompositionDataRef.current = '';
    if (composedText) {
      commitImeCompositionTextIfMissing(
        markdownEditorRef.current,
        composedText,
        getEditorTextSnapshot,
      );
    }

    cancelClearInputCompositionRef.current?.();
    cancelClearInputCompositionRef.current = scheduleClearInputComposition(
      () => {
        clearImeEnterCommitGuard();
        store.inputComposition = false;
        props.onCompositionActiveChange?.(false);
        cancelClearInputCompositionRef.current = null;
      },
    );

    syncTagPopupCompositionAttr(false);

    // 延迟到下一帧移除 data-composition，确保 Slate 完成模型更新、
    // React 完成重渲染（isEmpty 变为 false、empty class 移除）后
    // 再解除占位符隐藏，避免竞态导致占位符短暂闪现。
    requestAnimationFrame(() => {
      markdownContainerRef.current?.removeAttribute('data-composition');
      syncEditableRootCompositionAttr(false);
      setSuppressPlaceholderForIme(false);
    });
  });

  // 微信 X5 / WKWebView：偶发不上报 compositionend，用原生 input 收尾组合态
  useEffect(() => {
    if (!isWeChat() || readonly) return;
    const container = markdownContainerRef.current;
    if (!container) return;

    const handleNativeInput = (event: Event) => {
      const inputEvent = event as InputEvent;
      if (inputEvent.isComposing) {
        activateInputComposition();
        return;
      }
      if (store.inputComposition) {
        onCompositionEnd();
      }
    };

    container.addEventListener('input', handleNativeInput, true);
    return () => {
      container.removeEventListener('input', handleNativeInput, true);
    };
  }, [
    readonly,
    markdownContainerRef,
    store,
    activateInputComposition,
    onCompositionEnd,
  ]);

  const elementRenderElement = useRefFunction(
    (eleProps: RenderElementProps) => {
      // 在每个渲染周期的第一次调用时重置索引
      if (!hasResetIndexRef.current) {
        lazyElementIndexRef.current = 0;
        hasResetIndexRef.current = true;
        // 使用 Promise 在下一个事件循环重置标记
        Promise.resolve().then(() => {
          hasResetIndexRef.current = false;
        });
      }

      const defaultDom = (
        <ErrorBoundary
          fallbackRender={() => {
            return null;
          }}
        >
          <MElement
            {...eleProps}
            children={eleProps.children}
            readonly={readonly}
            deps={props.deps}
          />
        </ErrorBoundary>
      );

      let renderedDom = defaultDom;

      // First check for plugin components
      for (const plugin of plugins) {
        const Component = plugin.elements?.[eleProps.element.type];
        if (Component) {
          renderedDom = <Component {...eleProps} />;
          break;
        }
      }

      // Then allow eleItemRender to process the result
      if (props.eleItemRender) {
        if (
          eleProps.element.type !== 'table-cell' &&
          eleProps.element.type !== 'table-row'
        ) {
          renderedDom = props.eleItemRender(
            eleProps,
            renderedDom,
          ) as React.ReactElement;
        }
      }

      // Finally, wrap with LazyElement if lazy mode is enabled
      if (props.lazy?.enable) {
        // 不对表格单元格和表格行进行懒加载，避免破坏表格结构
        if (
          eleProps.element.type === 'table-cell' ||
          eleProps.element.type === 'table-row'
        ) {
          return renderedDom;
        }

        // 获取当前索引并递增
        const currentIndex = lazyElementIndexRef.current;
        lazyElementIndexRef.current += 1;

        // 计算总元素数
        const totalElements = countLazyElements(value.current);
        return (
          <LazyElement
            placeholderHeight={props.lazy?.placeholderHeight}
            rootMargin={props.lazy?.rootMargin}
            renderPlaceholder={props.lazy?.renderPlaceholder}
            elementInfo={{
              type: eleProps.element.type,
              index: currentIndex,
              total: totalElements,
            }}
          >
            {renderedDom}
          </LazyElement>
        );
      }

      return renderedDom;
    },
  );

  const renderMarkdownLeaf = useRefFunction(
    (leafComponentProps: RenderLeafProps) => {
      const defaultDom = (
        <MLeaf
          {...leafComponentProps}
          fncProps={props.fncProps}
          comment={props?.comment as any}
          children={leafComponentProps.children}
          tagInputProps={props.tagInputProps}
          linkConfig={props.linkConfig}
          readonly={readonly}
        />
      );

      if (!props.leafRender) return defaultDom;

      return props.leafRender(
        {
          ...leafComponentProps,
          fncProps: props.fncProps,
          comment: props?.comment as any,
          hashId: hashId,
          tagInputProps: props.tagInputProps,
        },
        defaultDom,
      ) as React.ReactElement;
    },
  );

  const decorateFn = (e: any) => {
    // 始终运行 useHighlight，以支持 fnc（脚注）、链接等基础展示
    const decorateList: any[] | undefined = high(e) || [];
    if (!props?.comment) return decorateList;
    if (props?.comment?.enable === false) return decorateList;
    if (commentMap.size === 0) return decorateList;

    try {
      const ranges: BaseRange[] = [];
      const [, path] = e;
      const itemMap = commentMap.get(path.join(','));
      if (!itemMap) return decorateList;
      itemMap.forEach((itemList) => {
        itemList?.forEach((item) => {
          const { anchor, focus } = item.selection || {};

          let newSelection: BaseSelection | undefined = undefined;
          let fragment = undefined;
          if (
            anchor &&
            focus &&
            isPath(anchor.path) &&
            focus.path &&
            isPath(focus.path) &&
            Editor.hasPath(markdownEditorRef.current, anchor.path) &&
            Editor.hasPath(markdownEditorRef.current, focus.path)
          ) {
            newSelection = {
              anchor: {
                path: findLeafPath(markdownEditorRef.current, anchor.path),
                offset: anchor.offset,
              },
              focus: {
                path: findLeafPath(markdownEditorRef.current, focus.path),
                offset: focus.offset,
              },
            } as BaseSelection;
            fragment = Editor.fragment(
              markdownEditorRef.current,
              newSelection!,
            );
          } else if (item.refContent) {
            const findDom = findByPathAndText(
              markdownEditorRef.current,
              item.path,
              item.refContent,
            ).at(0);

            if (findDom) {
              newSelection = {
                anchor: {
                  ...anchor,
                  path: findLeafPath(markdownEditorRef.current, findDom.path),
                  offset: findDom.offset.start,
                },
                focus: {
                  ...focus,
                  path: findLeafPath(markdownEditorRef.current, findDom.path),
                  offset: findDom.offset.end,
                },
              };
              fragment = Editor.fragment(
                markdownEditorRef.current,
                newSelection,
              );
            } else {
              // 检查 focus.path 是否存在且有效
              if (
                focus &&
                focus.path &&
                isPath(focus.path) &&
                Editor.hasPath(markdownEditorRef.current, focus.path)
              ) {
                try {
                  // 获取 focus.path 对应的节点
                  const [node] = Editor.node(
                    markdownEditorRef.current,
                    item.path,
                  );

                  // 检查该节点是否是 table 类型
                  if (
                    (node as any)?.type === 'table' ||
                    (node as any)?.type === 'card'
                  ) {
                    // 获取 table 节点的开始和结尾位置
                    const startPoint = Editor.start(
                      markdownEditorRef.current,
                      item.path,
                    );
                    const endPoint = Editor.end(
                      markdownEditorRef.current,
                      item.path,
                    );

                    newSelection = {
                      anchor: startPoint,
                      focus: endPoint,
                    } as BaseSelection;

                    fragment = Editor.fragment(
                      markdownEditorRef.current,
                      newSelection!,
                    );
                  }
                } catch (error) {
                  console.error('Error selecting table node:', error);
                }
              }
            }
          }

          // 尝试调整路径，处理可能的节点变化

          if (fragment && newSelection) {
            const newAnchorPath = newSelection.anchor.path;
            const newFocusPath = newSelection.focus.path;
            if (
              isPath(newFocusPath) &&
              isPath(newAnchorPath) &&
              Editor.hasPath(markdownEditorRef.current, newAnchorPath) &&
              Editor.hasPath(markdownEditorRef.current, newFocusPath)
            ) {
              ranges.push({
                anchor: {
                  path: newAnchorPath,
                  offset: newSelection.anchor.offset,
                },
                focus: {
                  path: newFocusPath,
                  offset: newSelection.focus.offset,
                },
                data: itemList,
                comment: true,
                id: item.id,
                selection: newSelection,
                updateTime: itemList
                  .map((i) => i.updateTime)
                  .sort()
                  .join(','),
              } as Range);
            }
          }
        });
      });
      return decorateList.concat(ranges as any[]);
    } catch (error) {
      console.error('[highlight] 高亮计算失败:', error);
      return decorateList;
    }
  };

  // 在 SSR 环境下，如果有 initSchemaValue，直接使用它作为初始值
  // 因为 useEffect 在 SSR 环境下不会执行，initialNote 不会被调用
  const initialValue = useMemo(() => {
    if (props.initSchemaValue?.length) {
      return copy(props.initSchemaValue);
    }
    return copy([EditorUtils.p]);
  }, [props.initSchemaValue]);

  return (
    <>
      <Slate
        editor={markdownEditorRef.current}
        initialValue={initialValue}
        onChange={onSlateChange}
      >
        <EditorEditable
          decorate={decorateFn}
          suppressPlaceholder={suppressPlaceholderForIme}
          onDragOver={(e) => e.preventDefault()}
          readOnly={readonly}
          spellCheck={false}
          autoCorrect="off"
          autoCapitalize="none"
          onCompositionStart={onCompositionStart}
          onCompositionUpdate={onCompositionUpdate}
          onCompositionEnd={onCompositionEnd}
          className={classNames(
            props.className,
            baseClassName,
            {
              [`${baseClassName}-${readonlyCls}`]: readonlyCls,
              [`${baseClassName}-report`]: props.reportMode,
              [`${baseClassName}-edit`]: !readonly,
              [`${baseClassName}-compact`]: props.compact,
            },
            hashId,
          )}
          style={props.style}
          onSelect={(e) => {
            handleSelectionChange.run(e);
          }}
          onCut={(event: React.ClipboardEvent<HTMLDivElement>) => {
            // 内部成功时已 preventDefault；失败时让浏览器原生 cut 兜底，
            // 避免在 handler 早返时把剪贴板写空。
            handleClipboardCopy(event, 'cut');
          }}
          onFocus={(e) => {
            props.onFocus?.(
              parserSlateNodeToMarkdown(markdownEditorRef.current.children),
              markdownEditorRef.current.children,
              e,
            );
          }}
          onBlur={() => {
            // 失去焦点时清除工具栏
            setDomRect?.(null);
          }}
          onMouseDown={checkEnd}
          onPaste={(event: React.ClipboardEvent<HTMLDivElement>) => {
            event.preventDefault();
            event.stopPropagation();
            onPaste(event);
          }}
          onCopy={(event: React.ClipboardEvent<HTMLDivElement>) => {
            // 同 onCut：handler 失败时让原生 copy 兜底
            handleClipboardCopy(event, 'copy');
          }}
          renderElement={elementRenderElement}
          renderLeaf={renderMarkdownLeaf}
          onKeyDown={handleKeyDown}
        />
      </Slate>
    </>
  );
});
