import { ConfigProvider } from 'antd';
import classNames from 'classnames';
import React, {
  useContext,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Subject } from 'rxjs';
import { createEditor, Editor, Selection } from 'slate';
import { withHistory } from 'slate-history';
import { withReact } from 'slate-react';
import { I18nProvide } from '../I18n';
import { CommentList } from './editor/components/CommentList';
import { SlateMarkdownEditor } from './editor/Editor';
import { parserMdToSchema } from './editor/parser/parserMdToSchema';
import { parserSlateNodeToMarkdown } from './editor/parser/parserSlateNodeToMarkdown';
import { withMarkdown } from './editor/plugins';
import { withErrorReporting } from './editor/plugins/catchError';
import { EditorStore, EditorStoreContext } from './editor/store';
import { InsertAutocomplete } from './editor/tools/InsertAutocomplete';
import { InsertLink } from './editor/tools/InsertLink';
import { TocHeading } from './editor/tools/Leading';
import { FloatBar } from './editor/tools/ToolBar/FloatBar';
import ToolBar from './editor/tools/ToolBar/ToolBar';
import { EditorUtils } from './editor/utils/editorUtils';
import {
  KeyboardTask,
  Methods,
  useSystemKeyboard,
} from './editor/utils/keyboard';
import { Elements } from './el';
import { MarkdownEditorPlugin, PluginContext } from './plugin';
import { useStyle } from './style';
import {
  CommentDataType,
  MarkdownEditorInstance,
  MarkdownEditorProps,
} from './types';
import { exportHtml } from './utils/exportHtml';
// 原生表格功能已集成到编辑器中
export { EditorUtils, parserMdToSchema };

export * from './editor/elements';
export * from './editor/utils';
export * from './el';
export * from './types';

// 组合器函数
const composeEditors = (editor: Editor, plugins: MarkdownEditorPlugin[]) => {
  if (plugins.length > 1) {
    return plugins.reduce((acc, plugin) => {
      return plugin.withEditor ? plugin.withEditor(acc) : acc;
    }, editor);
  }
  return editor;
};

/**
 * BaseMarkdownEditor 组件 - 基础Markdown编辑器组件
 *
 * 该组件是Markdown编辑器的核心实现，基于Slate.js构建，提供完整的Markdown编辑功能。
 * 支持插件系统、工具栏、目录、只读模式等功能，是MarkdownEditor的基础组件。
 *
 * @component
 * @description 基础Markdown编辑器组件，提供核心的Markdown编辑功能
 * @param {MarkdownEditorProps} props - 组件属性
 * @param {string} [props.initValue] - 初始值
 * @param {(value: string) => void} [props.onChange] - 内容变化回调
 * @param {React.RefObject} [props.editorRef] - 编辑器引用
 * @param {boolean} [props.readonly] - 是否只读模式
 * @param {Plugin[]} [props.plugins] - 插件列表
 * @param {ToolBarConfig} [props.toolBar] - 工具栏配置
 * @param {boolean} [props.toc] - 是否显示目录
 * @param {string|number} [props.width] - 编辑器宽度
 * @param {string|number} [props.height] - 编辑器高度
 * @param {React.CSSProperties} [props.style] - 容器样式
 * @param {React.CSSProperties} [props.contentStyle] - 内容区域样式
 * @param {React.CSSProperties} [props.editorStyle] - 编辑器样式
 * @param {MarkdownRenderConfig} [props.markdownRenderConfig] - Markdown渲染配置
 * @param {Function} [props.onBlur] - 失焦回调
 * @param {Function} [props.onFocus] - 聚焦回调
 *
 * @example
 * ```tsx
 * <BaseMarkdownEditor
 *   initValue="# Hello World"
 *   onChange={(value) => console.log('内容变化:', value)}
 *   editorRef={editorRef}
 *   readonly={false}
 *   toc={true}
 *   toolBar={{ show: true }}
 * />
 * ```
 *
 * @returns {React.ReactElement} 渲染的基础Markdown编辑器组件
 *
 * @remarks
 * - 基于Slate.js构建
 * - 支持插件系统扩展
 * - 提供完整的工具栏功能
 * - 支持目录生成
 * - 支持只读模式
 * - 提供焦点管理
 * - 支持错误捕获
 * - 支持键盘事件处理
 * - 提供Markdown解析和渲染
 */
export const BaseMarkdownEditor: React.FC<MarkdownEditorProps> = (props) => {
  const {
    initValue,
    width,
    toolBar = {},
    editorRef,
    toc = false,
    readonly,
    lazy,
    style,
    contentStyle = {
      height: '100%',
    },
    editorStyle,
    height,
    ...rest
  } = props;
  // 是否挂载
  const [editorMountStatus, setMountedStatus] = useState(false);
  const [isEditorFocused, setIsEditorFocused] = useState(false);
  // 键盘事件
  const keyTask$ = useMemo(
    () =>
      new Subject<{
        key: Methods<KeyboardTask>;
        args?: any[];
      }>(),
    [],
  );

  // markdown 编辑器实例
  const markdownEditorRef = useRef(
    composeEditors(
      withMarkdown(withReact(withHistory(createEditor()))),
      props.plugins || [],
    ),
  );

  const markdownContainerRef = useRef<HTMLDivElement | null>(null);

  // 错误捕获
  useEffect(() => {
    withErrorReporting(markdownEditorRef.current);
  }, []);

  // 处理点击外部区域
  useEffect(() => {
    if (!rest?.onBlur) return;
    if (readonly) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        isEditorFocused &&
        markdownContainerRef.current &&
        !markdownContainerRef.current.contains(event.target as Node)
      ) {
        EditorUtils.blur(markdownEditorRef.current);
        rest?.onBlur?.(
          parserSlateNodeToMarkdown(
            markdownEditorRef.current?.children || [],
            '',
            [],
            props.plugins,
          ),
          markdownEditorRef.current?.children,
          event as any,
        );
        setIsEditorFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [readonly, rest?.onBlur, props.plugins, isEditorFocused]);

  // 监听编辑器焦点
  useEffect(() => {
    const handleEditorFocus = () => {
      if (
        markdownContainerRef.current?.contains(document.activeElement) ||
        markdownContainerRef.current === document.activeElement
      ) {
        setIsEditorFocused(true);
      }
    };

    markdownContainerRef.current?.addEventListener(
      'focusin',
      handleEditorFocus,
    );
    return () => {
      markdownContainerRef.current?.removeEventListener(
        'focusin',
        handleEditorFocus,
      );
    };
  }, []);

  const store = useMemo(
    () =>
      new EditorStore(
        markdownEditorRef,
        props.plugins,
        props.markdownToHtmlOptions,
      ),
    [props.plugins, props.markdownToHtmlOptions],
  );

  /**
   * 初始化 schema
   */
  const initSchemaValue = useMemo(() => {
    let list = parserMdToSchema(initValue!, props.plugins)?.schema;
    if (!props.readonly) {
      list.push(EditorUtils.p);
    }
    const schema =
      props.initSchemaValue ||
      (initValue ? list : JSON.parse(JSON.stringify([EditorUtils.p])));

    return schema?.filter((item: any) => {
      if (item.type === 'p' && item.children.length === 0) {
        return false;
      }
      if (item.type === 'list' && item.children.length === 0) {
        return false;
      }
      if (item.type === 'listItem' && item.children.length === 0) {
        return false;
      }
      if (item.type === 'heading' && item.children.length === 0) {
        return false;
      }
      return true;
    });
  }, []);

  // 初始化实例
  const instance = useMemo(() => {
    return {
      store,
      markdownContainerRef,
      markdownEditorRef,
      exportHtml: (filename?: string) => {
        const htmlContent = store.getHtmlContent();
        exportHtml(htmlContent, filename);
      },
    } as MarkdownEditorInstance;
  }, []);

  // 初始化键盘事件
  useSystemKeyboard(keyTask$, instance.store, props, markdownContainerRef);

  // 导入外部 hooks
  useImperativeHandle(editorRef, () => {
    return {
      store: instance.store,
      markdownContainerRef,
      markdownEditorRef,
      exportHtml: instance.exportHtml,
    };
  }, [instance, editorMountStatus]);

  const context = useContext(ConfigProvider.ConfigContext);
  // ---- css style ----
  const baseClassName = context?.getPrefixCls(`agentic-md-editor`);
  const { wrapSSR, hashId } = useStyle(baseClassName);
  // --- css style end ---

  // 评论列表
  const [showCommentList, setShowComment] = useState<CommentDataType[]>([]);

  // schema 数据
  const [schema, setSchema] = useState<Elements[]>(initSchemaValue);
  const [openInsertCompletion, setOpenInsertCompletion] = useState(false);
  const [refreshFloatBar, setRefreshFloatBar] = useState(false);

  const insertCompletionText$ = useMemo(() => new Subject<string>(), []);
  const openInsertLink$ = useMemo(() => new Subject<Selection>(), []);

  const [domRect, setDomRect] = useState<DOMRect | null>(null);

  return wrapSSR(
    <I18nProvide>
      <PluginContext.Provider value={props.plugins || []}>
        <EditorStoreContext.Provider
          value={{
            keyTask$,
            insertCompletionText$,
            openInsertLink$,
            openInsertCompletion,
            setOpenInsertCompletion,
            setRefreshFloatBar,
            refreshFloatBar,
            rootContainer: props.rootContainer,
            setShowComment,
            store: instance.store,
            domRect,
            setDomRect,
            typewriter: props.typewriter ?? false,
            readonly: props.readonly ?? false,
            editorProps: props || {},
            markdownEditorRef,
            markdownContainerRef,
          }}
        >
          <div
            id={props.id ? String(props.id) || undefined : undefined}
            className={classNames(
              baseClassName,
              'markdown-editor',
              hashId,
              props.className,
              {
                [`${baseClassName}-readonly`]: readonly,
                [`${baseClassName}-edit`]: !readonly,
                [`${baseClassName}-report`]: props.reportMode,
                [`${baseClassName}-slide`]: props.slideMode,
              },
            )}
            style={{
              width: width || '100%',
              height: height || 'auto',
              display: 'flex',
              flexDirection: 'column',
              maxHeight: '100%',
              font: 'var(--font-text-paragraph-lg)',
              letterSpacing: 'var(--letter-spacing-paragraph-lg, normal)',
              color: 'var(--color-gray-text-default)',
              ...style,
            }}
          >
            {!readonly && toolBar?.enable === true ? (
              <div
                style={{
                  width: '100%',
                  maxWidth: '100%',
                  position: 'sticky',
                  zIndex: 99,
                  top: 0,
                }}
                className={classNames(`${baseClassName}-toolbar-container`, {
                  [`${baseClassName}-min-toolbar`]: toolBar.min,
                })}
              >
                <ToolBar
                  hideTools={toolBar.hideTools}
                  extra={toolBar.extra}
                  min={toolBar.min}
                />
              </div>
            ) : readonly ? null : null}
            <div
              className={classNames(
                `${baseClassName}-container`,
                props.containerClassName,
                hashId,
              )}
              style={{
                overflow: 'auto',
                display: 'flex',
                height:
                  !readonly && toolBar?.enable ? `calc(100% - 56px)` : '100%',
                position: 'relative',
                gap: 24,
                outline: 'none',
                // 如果 contentStyle 中设置了 padding，设置 CSS 变量和内联样式
                ...(contentStyle?.padding !== undefined
                  ? {
                      '--content-padding': `${
                        typeof contentStyle.padding === 'number'
                          ? `${contentStyle.padding}px`
                          : contentStyle.padding
                      }`,
                      padding: contentStyle.padding,
                    }
                  : {}),
                // contentStyle 放在最后，确保能够覆盖默认样式（包括 padding）
                ...contentStyle,
              }}
              ref={(dom) => {
                markdownContainerRef.current = dom;
                setMountedStatus(true);
              }}
              tabIndex={-1}
            >
              <SlateMarkdownEditor
                prefixCls={baseClassName}
                {...rest}
                lazy={lazy}
                onChange={(value, schema) => {
                  setSchema(schema);
                  rest?.onChange?.(value, schema);
                }}
                initSchemaValue={initSchemaValue}
                style={editorStyle}
                instance={instance}
              />
              {readonly ? (
                props.reportMode ? (
                  props.floatBar?.enable === false ? null : (
                    <FloatBar readonly />
                  )
                ) : null
              ) : props.floatBar?.enable !== true ? null : (
                <FloatBar readonly={false} />
              )}
              {editorMountStatus &&
              toc !== false &&
              markdownContainerRef.current ? (
                showCommentList?.length ? (
                  <CommentList
                    commentList={showCommentList}
                    comment={props.comment}
                  />
                ) : (
                  <TocHeading
                    schema={schema}
                    anchorProps={props.anchorProps}
                    useCustomContainer={true}
                  />
                )
              ) : showCommentList?.length ? (
                <CommentList
                  pure
                  commentList={showCommentList}
                  comment={props.comment}
                />
              ) : null}
            </div>
            {readonly ||
            props?.textAreaProps?.enable ||
            props?.reportMode ? null : (
              <div
                className={classNames(`${baseClassName}-focus`)}
                style={{
                  height: 64,
                }}
              />
            )}
            {readonly ? (
              <></>
            ) : (
              <>
                <InsertLink />
                <InsertAutocomplete
                  {...(props?.insertAutocompleteProps || {})}
                />
              </>
            )}
          </div>
        </EditorStoreContext.Provider>
      </PluginContext.Provider>
    </I18nProvide>,
  );
};
