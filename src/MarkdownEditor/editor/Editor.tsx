/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable react/no-children-prop */
import { useDebounceFn } from '@ant-design/pro-components';
import classNames from 'classnames';
import React, { useContext, useEffect, useMemo, useRef } from 'react';
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
  Editable,
  ReactEditor,
  RenderElementProps,
  RenderLeafProps,
  Slate,
} from 'slate-react';
import { useRefFunction } from '../../Hooks/useRefFunction';
import { parserMdToSchema } from '../BaseMarkdownEditor';
import { Elements } from '../el';
import { PluginContext } from '../plugin';
import {
  CommentDataType,
  MarkdownEditorInstance,
  MarkdownEditorProps,
} from '../types';
import { LazyElement } from './components/LazyElement';
import { MElement, MLeaf } from './elements';
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
import { useHighlight } from './plugins/useHighlight';
import { useKeyboard } from './plugins/useKeyboard';
import { useOnchange } from './plugins/useOnchange';
import { useEditorStore } from './store';
import { useStyle } from './style';
import { MARKDOWN_EDITOR_EVENTS, parserSlateNodeToMarkdown } from './utils';
import {
  EditorUtils,
  findByPathAndText,
  findLeafPath,
  getSelectionFromDomSelection,
  hasEditableTarget,
  isEventHandled,
  isPath,
} from './utils/editorUtils';

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
} & MarkdownEditorProps;

/**
 * 生成表格最小尺寸配置
 *
 * 该函数用于设置表格的最小列数和行数，确保表格的基本结构。
 * 通过递归遍历编辑器元素，找到表格元素并应用最小尺寸约束。
 *
 * @param elements - 编辑器元素数组
 * @param config - 配置对象
 * @param config.minColumn - 最小列数
 * @param config.minRows - 最小行数
 */
const genTableMinSize = (
  elements: Elements[],
  config?: {
    minColumn?: number;
    minRows?: number;
  },
) => {
  if (!config) return elements;

  elements.forEach((element) => {
    if ((element as any).children) {
      genTableMinSize((element as any).children, config);
    }
  });
};

/**
 * SlateMarkdownEditor 组件 - Slate Markdown编辑器组件
 *
 * 基于Slate.js的Markdown编辑器，支持丰富的编辑功能，包括文本编辑、表格、代码块、媒体插入、链接等。
 * 通过MobX进行状态管理，支持多种编辑器事件和操作。
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
export const SlateMarkdownEditor = (props: MEditorProps) => {
  // 所有hooks必须在组件顶部按固定顺序调用
  const {
    store,
    markdownEditorRef,
    markdownContainerRef,
    readonly,
    setDomRect,
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

  const plugins = useContext(PluginContext);

  const onKeyDown = useKeyboard(store, markdownEditorRef, props);
  const onChange = useOnchange(markdownEditorRef.current, props.onChange);
  const high = useHighlight(store);

  const childrenIsEmpty = useMemo(() => {
    if (!markdownEditorRef.current?.children) return false;
    if (!Array.isArray(markdownEditorRef.current.children)) return false;
    if (markdownEditorRef.current.children.length === 0) return false;
    return (
      value.current.filter(
        (v) => v.type === 'paragraph' && v.children?.at?.(0)?.text === '',
      ).length < 1
    );
  }, [markdownEditorRef.current?.children]);

  const readonlyCls = useMemo(() => {
    if (readonly) return 'readonly';
    return !childrenIsEmpty ? 'focus' : '';
  }, [readonly, !childrenIsEmpty]);

  const { wrapSSR, hashId } = useStyle(`${props.prefixCls}-content`, {
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
    async (e: React.ReactEventHandler<HTMLDivElement>) => {
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

          // 只有在有实际选中文本时才显示工具栏
          if (!Range.isCollapsed(selection)) {
            const range = ReactEditor.toDOMRange(
              markdownEditorRef.current,
              selection,
            );
            const rect = range?.getBoundingClientRect();
            if (rect) {
              setDomRect?.(rect);
            } else {
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

    const handleMouseUp = (e: MouseEvent) => {
      e.preventDefault();
      handleSelectionChange.run();
    };
    container.addEventListener('mouseup', handleMouseUp);

    return () => {
      container.removeEventListener('mouseup', handleMouseUp);
      handleSelectionChange.cancel();
    };
  }, [readonly, markdownContainerRef?.current]);

  useEffect(() => {
    if (nodeRef.current !== props.instance) {
      initialNote();
    }
  }, [props.instance, markdownEditorRef.current]);

  useEffect(() => {
    const footnoteDefinitionList = markdownEditorRef.current.children
      .filter((item) => item.type === 'footnoteDefinition')
      .map((item, index) => {
        return {
          id: item.id || index,
          placeholder: item.identifier,
          origin_text: item.value,
          url: item.url,
          origin_url: item.url,
        };
      });
    props?.fncProps?.onFootnoteDefinitionChange?.(footnoteDefinitionList);
  }, [markdownEditorRef.current?.children]);

  // 非hook变量声明
  const { prefixCls = '$' } = props.tagInputProps || {};
  const baseClassName = `${props.prefixCls}-content`;

  const onSlateChange = useRefFunction((v: any[]) => {
    // 忽略初始化时的第一次变化
    if (first.current) {
      setTimeout(() => {
        first.current = false;
      }, 100);
      return;
    }

    // 更新当前值引用
    value.current = v;
    // 触发onChange回调
    onChange(v, markdownEditorRef.current.operations);
    // 检查是否存在非选区变化操作，如有则标记内容已变更
    const hasContentChanges = markdownEditorRef.current.operations?.some(
      (op) => op.type !== 'set_selection',
    );
    if (hasContentChanges && !changedMark.current) {
      changedMark.current = true;
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
          markdownEditorRef.current.selection = getSelectionFromDomSelection(
            markdownEditorRef.current,
            domSelection!,
          );
        } else if (operationType === 'cut') {
          const domSelection = window.getSelection();
          markdownEditorRef.current.selection = getSelectionFromDomSelection(
            markdownEditorRef.current,
            domSelection!,
          );
        }

        // 如果无法获取选区，则直接返回
        if (!markdownEditorRef.current.selection) {
          return false;
        }

        // 3. 处理复制/剪切选中内容
        if (markdownEditorRef.current?.selection) {
          event.clipboardData?.clearData();
          const editor = markdownEditorRef.current;

          try {
            // 复制HTML内容
            const tempDiv = document.createElement('div');
            const domRange = ReactEditor.toDOMRange(
              editor,
              editor.selection as Range,
            );
            const selectedHtml = domRange.cloneContents();
            tempDiv.appendChild(selectedHtml);
            event.clipboardData.setData('text/html', tempDiv.innerHTML);
            tempDiv?.remove();

            // 设置Slate编辑器特定的片段数据，用于保留格式信息
            event.clipboardData.setData(
              'application/x-slate-md-fragment',
              JSON.stringify(editor?.getFragment() || []),
            );
            event.clipboardData.setData(
              'text/plain',
              parserSlateNodeToMarkdown(editor?.getFragment()),
            );
            event.clipboardData.setData(
              'text/markdown',
              parserSlateNodeToMarkdown(editor?.getFragment()),
            );

            // 4. 设置剪贴板的片段数据
            ReactEditor.setFragmentData(
              markdownEditorRef.current,
              event.clipboardData,
              operationType,
            );

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
      genTableMinSize(props.initSchemaValue || [], {
        minColumn: tableConfig?.minColumn,
        minRows: tableConfig?.minRows,
      });
      try {
        EditorUtils.reset(
          markdownEditorRef.current,
          props.initSchemaValue?.length ? props.initSchemaValue : undefined,
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
  }, [props.instance, markdownEditorRef.current]);

  /**
   * 处理粘贴事件，会把粘贴的内容转换为对应的节点
   * @description paste event
   * @param {React.ClipboardEvent<HTMLDivElement>} e
   */
  const onPaste = async (event: React.ClipboardEvent<HTMLDivElement>) => {
    await handlePasteEvent(event);
  };

  /**
   * 实际的粘贴处理逻辑
   */
  const handlePasteEvent = async (
    event: React.ClipboardEvent<HTMLDivElement>,
  ) => {
    // 检查粘贴配置
    const pasteConfig = props.pasteConfig;
    if (pasteConfig?.enabled === false) {
      return; // 如果禁用粘贴功能，直接返回
    }

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
          event.clipboardData,
          curNode,
        )
      ) {
        return;
      }
    }

    props.onPaste?.(event);

    const types = event.clipboardData?.types || ['text/plain'];

    // 获取允许的类型
    const allowedTypes = pasteConfig?.allowedTypes || defaultAllowedTypes;

    // 1. 首先尝试处理 slate-md-fragment
    if (
      types.includes('application/x-slate-md-fragment') &&
      allowedTypes.includes('application/x-slate-md-fragment')
    ) {
      if (
        handleSlateMarkdownFragment(
          markdownEditorRef.current,
          event.clipboardData,
          currentTextSelection,
        )
      ) {
        return;
      }
    }

    // 2. 然后尝试处理 HTML
    if (types.includes('text/html') && allowedTypes.includes('text/html')) {
      if (
        await handleHtmlPaste(
          markdownEditorRef.current,
          event.clipboardData,
          props,
        )
      ) {
        return;
      }
    }

    // 3. 处理文件
    if (types.includes('Files') && allowedTypes.includes('Files')) {
      if (
        await handleFilesPaste(
          markdownEditorRef.current,
          event.clipboardData,
          props,
        )
      ) {
        return;
      }
    }

    if (
      types.includes('text/markdown') &&
      allowedTypes.includes('text/markdown')
    ) {
      const text =
        event.clipboardData?.getData?.('text/markdown')?.trim() || '';
      if (text) {
        Transforms.insertFragment(
          markdownEditorRef.current,
          parserMdToSchema(text, plugins).schema,
        );
      }

      return;
    }
    // 4. 处理纯文本
    if (types.includes('text/plain') && allowedTypes.includes('text/plain')) {
      const text = event.clipboardData?.getData?.('text/plain')?.trim() || '';
      if (!text) return;

      const selection = markdownEditorRef.current.selection;

      // 如果是表格或者代码块，直接插入文本
      if (shouldInsertTextDirectly(markdownEditorRef.current, selection)) {
        Transforms.insertText(markdownEditorRef.current, text);
        return;
      }

      try {
        // 处理特殊文本格式（media:// 和 attach:// 链接）
        if (
          handleSpecialTextPaste(markdownEditorRef.current, text, selection)
        ) {
          return;
        }

        // 处理 HTTP 链接
        if (
          handleHttpLinkPaste(markdownEditorRef.current, text, selection, store)
        ) {
          return;
        }

        // 处理普通文本
        if (
          await handlePlainTextPaste(
            markdownEditorRef.current,
            text,
            selection,
            plugins,
          )
        ) {
          return;
        }
      } catch (e) {
        console.log('insert error', e);
      }
    }

    // 5. 如果前面的处理都失败了，才使用默认的插入行为
    if (hasEditableTarget(markdownEditorRef.current, event.target)) {
      ReactEditor.insertData(markdownEditorRef.current, event.clipboardData);
    }
  };

  /**
   * 处理输入法开始事件
   */
  const onCompositionStart = (e: React.CompositionEvent) => {
    if (markdownContainerRef.current) {
      markdownContainerRef.current.setAttribute('data-composition', '');
    }
    store.inputComposition = true;

    const focusPath = markdownEditorRef.current.selection?.focus.path || [];
    if (focusPath.length > 0) {
      const node = Node.get(
        markdownEditorRef.current,
        markdownEditorRef.current.selection?.focus.path || [],
      );
      if (node) {
        const dom = ReactEditor.toDOMNode(markdownEditorRef.current, node);
        if (dom) {
          const tagInput = dom.querySelector('[data-tag-popup-input]');
          if (tagInput) {
            tagInput.setAttribute('data-composition', '');
          }
        }
      }
    }

    if (
      markdownEditorRef.current.selection &&
      Range.isCollapsed(markdownEditorRef.current.selection)
    ) {
      e.preventDefault();
    }
  };

  /**
   * 处理输入法结束事件
   */
  const onCompositionEnd = () => {
    store.inputComposition = false;
    if (markdownContainerRef.current) {
      markdownContainerRef.current.removeAttribute('data-composition');
    }

    const focusPath = markdownEditorRef.current.selection?.focus.path || [];
    if (focusPath.length > 0) {
      const node = Node.get(
        markdownEditorRef.current,
        markdownEditorRef.current.selection?.focus.path || [],
      );
      if (node) {
        const dom = ReactEditor.toDOMNode(markdownEditorRef.current, node);
        if (dom) {
          const tagInput = dom.querySelector('[data-tag-popup-input]');
          if (tagInput) {
            tagInput.removeAttribute('data-composition');
          }
        }
      }
    }
  };

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
          comment={props?.comment}
          children={leafComponentProps.children}
          tagInputProps={props.tagInputProps}
          linkConfig={props.linkConfig}
        />
      );

      if (!props.leafRender) return defaultDom;

      return props.leafRender(
        {
          ...leafComponentProps,
          fncProps: props.fncProps,
          comment: props?.comment,
          hashId: hashId,
          tagInputProps: props.tagInputProps,
        },
        defaultDom,
      ) as React.ReactElement;
    },
  );

  const decorateFn = (e: any) => {
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
      console.log('error', error);
      return decorateList;
    }
  };

  // 在 SSR 环境下，如果有 initSchemaValue，直接使用它作为初始值
  // 因为 useEffect 在 SSR 环境下不会执行，initialNote 不会被调用
  const initialValue = useMemo(() => {
    if (props.initSchemaValue?.length) {
      return props.initSchemaValue;
    }
    return [EditorUtils.p];
  }, [props.initSchemaValue]);

  return wrapSSR(
    <>
      <Slate
        editor={markdownEditorRef.current}
        initialValue={initialValue}
        onChange={onSlateChange}
      >
        <Editable
          decorate={decorateFn}
          onDragOver={(e) => e.preventDefault()}
          readOnly={readonly}
          spellCheck={false}
          autoCorrect="off"
          autoCapitalize="none"
          onCompositionStart={onCompositionStart}
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
          onSelect={handleSelectionChange.run}
          onCut={(event: React.ClipboardEvent<HTMLDivElement>) => {
            const handled = handleClipboardCopy(event, 'cut');
            if (!handled) {
              event.preventDefault();
            }
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
            const handled = handleClipboardCopy(event, 'copy');
            if (!handled) {
              event.preventDefault();
            }
          }}
          renderElement={elementRenderElement}
          renderLeaf={renderMarkdownLeaf}
          onKeyDown={handleKeyDown}
        />
      </Slate>
    </>,
  );
};
