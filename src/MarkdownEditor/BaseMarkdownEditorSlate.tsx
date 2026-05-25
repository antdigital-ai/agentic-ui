import { ConfigProvider } from 'antd';
import classNames from 'clsx';
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
import { resolveContainerContentStyle } from '../Constants/contentPaddingVars';
import { useRefFunction } from '../Hooks/useRefFunction';
import { CommentList } from './editor/components/CommentList';
import { SlateMarkdownEditor } from './editor/Editor';
import { parserMdToSchema } from './editor/parser/parserMdToSchema';
import { parserSlateNodeToMarkdown } from './editor/parser/parserSlateNodeToMarkdown';
import { withMarkdown } from './editor/plugins';
import { withErrorReporting } from './editor/plugins/catchError';
import { EditorStore, EditorStoreContext } from './editor/store';
import { InsertAutocomplete } from './editor/tools/InsertAutocomplete';
import { InsertLink } from './editor/tools/InsertLink';
import { JinjaTemplatePanel } from './editor/tools/JinjaTemplatePanel';
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
import I18nBoundary from './I18nBoundary';
import { MarkdownEditorPlugin, PluginContext } from './plugin';
import { useStyle } from './style';
import {
  CommentDataType,
  MarkdownEditorInstance,
  MarkdownEditorProps,
} from './types';
import { exportHtml } from './utils/exportHtml';
import { sanitizeEditorChromeStyle } from './utils/sanitizeChromeStyle';

// 组合器函数
const composeEditors = (editor: Editor, plugins: MarkdownEditorPlugin[]) => {
  if (plugins.length > 1) {
    return plugins.reduce((acc, plugin) => {
      return plugin.withEditor ? plugin.withEditor(acc) : acc;
    }, editor);
  }
  return editor;
};

/** Slate 编辑路径：可编辑、或只读但 renderMode=slate（Slate 文档） */
const BaseMarkdownEditorSlate: React.FC<MarkdownEditorProps> = (props) => {
  const {
    initValue,
    width,
    toolBar = {},
    editorRef,
    toc = false,
    readonly,
    lazy,
    style: rawStyle,
    contentStyle: rawContentStyle = {
      height: '100%',
    },
    editorStyle,
    height,
    children,
    renderMode: _renderMode,
    renderType: _renderType,
    ...rest
  } = props;

  const contentStyle = resolveContainerContentStyle(
    sanitizeEditorChromeStyle(rawContentStyle),
  );
  const rootStyle = sanitizeEditorChromeStyle(rawStyle);

  const [editorMountStatus, setMountedStatus] = useState(false);
  const isEditorFocusedRef = useRef(false);
  const setEditorFocused = useRefFunction((focused: boolean) => {
    isEditorFocusedRef.current = focused;
  });
  const keyTask$ = useMemo(
    () =>
      new Subject<{
        key: Methods<KeyboardTask>;
        args?: any[];
      }>(),
    [],
  );

  const markdownEditorRef = useRef(
    composeEditors(
      withMarkdown(withReact(withHistory(createEditor()))),
      props.plugins || [],
    ),
  );

  const markdownContainerRef = useRef<HTMLDivElement | null>(null);
  const pluginsForInitParseRef = useRef(props.plugins);
  pluginsForInitParseRef.current = props.plugins;

  useEffect(() => {
    withErrorReporting(markdownEditorRef.current);
  }, []);

  useEffect(() => {
    if (!rest?.onBlur) return;
    if (readonly) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        isEditorFocusedRef.current &&
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
        setEditorFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [readonly, rest?.onBlur, props.plugins, setEditorFocused]);

  useEffect(() => {
    const handleEditorFocus = () => {
      if (
        markdownContainerRef.current?.contains(document.activeElement) ||
        markdownContainerRef.current === document.activeElement
      ) {
        setEditorFocused(true);
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

  const initSchemaValue = useMemo(() => {
    const parseResult = parserMdToSchema(
      initValue || '',
      pluginsForInitParseRef.current || [],
    );
    let list = parseResult?.schema || [];

    if (!props.readonly && list.length === 0) {
      list = [...list, EditorUtils.p];
    }

    const schema =
      props.initSchemaValue ||
      (initValue ? list : JSON.parse(JSON.stringify([EditorUtils.p])));

    const filtered =
      schema?.filter((item: any) => {
        if (item.type === 'paragraph' && item.children.length === 0) {
          return false;
        }
        if (
          (item.type === 'list' ||
            item.type === 'bulleted-list' ||
            item.type === 'numbered-list') &&
          item.children.length === 0
        ) {
          return false;
        }
        if (item.type === 'listItem' && item.children.length === 0) {
          return false;
        }
        if (item.type === 'heading' && item.children.length === 0) {
          return false;
        }
        return true;
      }) || [];

    return EditorUtils.coalesceRootAllEmptyParagraphs(filtered) as Elements[];
  }, [initValue, props.readonly, props.initSchemaValue]);

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

  useSystemKeyboard(keyTask$, instance.store, props, markdownContainerRef);

  useImperativeHandle(editorRef, () => {
    return {
      store: instance.store,
      markdownContainerRef,
      markdownEditorRef,
      exportHtml: instance.exportHtml,
    };
  }, [instance, editorMountStatus]);

  const context = useContext(ConfigProvider.ConfigContext);
  const baseClassName = context?.getPrefixCls(`agentic-md-editor`);
  const { hashId } = useStyle(baseClassName);

  const [showCommentList, setShowComment] = useState<CommentDataType[]>([]);

  const [schema, setSchema] = useState<Elements[]>(initSchemaValue);

  useEffect(() => {
    setSchema(initSchemaValue);
  }, [initSchemaValue]);

  const [openInsertCompletion, setOpenInsertCompletion] = useState(false);
  const [refreshFloatBar, setRefreshFloatBar] = useState(false);

  const insertCompletionText$ = useMemo(() => new Subject<string>(), []);
  const openInsertLink$ = useMemo(() => new Subject<Selection>(), []);

  const [domRect, setDomRect] = useState<DOMRect | null>(null);

  const jinjaEnabled =
    props.jinja?.enable === true ||
    (Array.isArray(props.plugins) &&
      props.plugins.some(
        (p) => (p as MarkdownEditorPlugin & { jinja?: boolean }).jinja === true,
      ));
  const pluginWithJinja = Array.isArray(props.plugins)
    ? (props.plugins.find(
        (p) => (p as MarkdownEditorPlugin & { jinja?: boolean }).jinja === true,
      ) as
        | (MarkdownEditorPlugin & { jinja?: boolean; jinjaConfig?: any })
        | undefined)
    : undefined;
  const effectiveJinja = props.jinja
    ? props.jinja
    : pluginWithJinja?.jinjaConfig
      ? pluginWithJinja.jinjaConfig
      : pluginWithJinja
        ? { enable: true as const }
        : undefined;
  const jinjaTemplatePanelEnabled =
    jinjaEnabled &&
    effectiveJinja !== undefined &&
    effectiveJinja !== null &&
    effectiveJinja.templatePanel !== false &&
    (typeof effectiveJinja.templatePanel !== 'object' ||
      effectiveJinja.templatePanel?.enable !== false);

  const [openJinjaTemplate, setOpenJinjaTemplate] = useState(false);
  const [jinjaAnchorPath, setJinjaAnchorPath] = useState<number[] | null>(null);

  const isStreaming = props.streaming ?? props.typewriter ?? false;

  return (
    <I18nBoundary>
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
            typewriter: isStreaming,
            readonly: props.readonly ?? false,
            editorProps:
              effectiveJinja !== undefined
                ? { ...props, jinja: effectiveJinja }
                : props || {},
            markdownEditorRef,
            markdownContainerRef,
            openJinjaTemplate,
            setOpenJinjaTemplate,
            jinjaAnchorPath,
            setJinjaAnchorPath,
            jinjaEnabled,
            jinjaTemplatePanelEnabled,
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
            data-testid="markdown-editor"
            style={{
              width: width || '100%',
              height: height || 'auto',
              ...rootStyle,
            }}
          >
            {!readonly && toolBar?.enable === true ? (
              <div
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
                height:
                  !readonly && toolBar?.enable ? `calc(100% - 56px)` : '100%',
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
                onChange={(value, s) => {
                  setSchema(s);
                  rest?.onChange?.(value, s);
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
              <div className={classNames(`${baseClassName}-focus`)} />
            )}
            {readonly ? (
              <></>
            ) : (
              <>
                <InsertLink />
                <InsertAutocomplete
                  {...(props?.insertAutocompleteProps || {})}
                />
                {jinjaTemplatePanelEnabled ? <JinjaTemplatePanel /> : null}
              </>
            )}
            {children}
          </div>
        </EditorStoreContext.Provider>
      </PluginContext.Provider>
    </I18nBoundary>
  );
};

export default BaseMarkdownEditorSlate;
