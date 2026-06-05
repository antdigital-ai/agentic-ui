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
import { Selection } from 'slate';
import { resolveContainerContentStyle } from '../Constants/contentPaddingVars';
import { useFormulaConfig } from '../Config';
import { useDebounceFn } from '../Hooks/useDebounceFn';
import { useRefFunction } from '../Hooks/useRefFunction';
import { CommentList } from './editor/components/CommentList';
import { SlateMarkdownEditor } from './editor/Editor';
import { parserMdToSchema } from './editor/parser/parserMdToSchema';
import { parserSlateNodeToMarkdown } from './editor/parser/parserSlateNodeToMarkdown';
import { EditorStore, EditorStoreContext } from './editor/store';
import { InsertAutocomplete } from './editor/tools/InsertAutocomplete';
import { InsertLink } from './editor/tools/InsertLink';
import { JinjaTemplatePanel } from './editor/tools/JinjaTemplatePanel';
import { TocHeading } from './editor/tools/Leading';
import { FloatBar } from './editor/tools/ToolBar/FloatBar';
import ToolBar from './editor/tools/ToolBar/ToolBar';
import { copy } from './editor/utils';
import {
  createMarkdownSlateEditor,
  getPluginsEditorCompositionKey,
} from './editor/utils/createMarkdownSlateEditor';
import { createEditorSelChangeSubject } from './editor/utils/editorSelChange';
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

  const pluginsCompositionKey = useMemo(
    () => getPluginsEditorCompositionKey(props.plugins || []),
    [props.plugins],
  );

  const markdownEditorRef = useRef(
    createMarkdownSlateEditor(props.plugins || []),
  );
  const pluginsCompositionKeyRef = useRef(pluginsCompositionKey);
  const [slateRemountKey, setSlateRemountKey] = useState(0);
  const [pluginRemountInitSchema, setPluginRemountInitSchema] = useState<
    Elements[] | undefined
  >(undefined);

  const markdownContainerRef = useRef<HTMLDivElement | null>(null);
  const pluginsForInitParseRef = useRef(props.plugins);
  pluginsForInitParseRef.current = props.plugins;

  useEffect(() => {
    if (pluginsCompositionKeyRef.current === pluginsCompositionKey) {
      return;
    }
    pluginsCompositionKeyRef.current = pluginsCompositionKey;

    const previousEditor = markdownEditorRef.current;
    let preservedSchema: Elements[] | undefined;
    try {
      preservedSchema = copy(previousEditor.children as Elements[]);
    } catch {
      preservedSchema = undefined;
    }

    setPluginRemountInitSchema(
      preservedSchema?.length ? preservedSchema : undefined,
    );

    const nextEditor = createMarkdownSlateEditor(props.plugins || []);
    markdownEditorRef.current = nextEditor;

    if (preservedSchema?.length) {
      try {
        EditorUtils.reset(nextEditor, preservedSchema);
      } catch {
        EditorUtils.deleteAll(nextEditor);
      }
    }

    setSlateRemountKey((key) => key + 1);
  }, [pluginsCompositionKey, props.plugins]);

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

  const formulaConfig = useFormulaConfig(props.formula);
  const parserConfig = useMemo(
    () => ({ formula: formulaConfig }),
    [formulaConfig.enable, formulaConfig.singleDollarTextMath],
  );

  const storeRef = useRef<EditorStore | null>(null);
  if (!storeRef.current) {
    storeRef.current = new EditorStore(
      markdownEditorRef,
      props.plugins,
      props.markdownToHtmlOptions,
      parserConfig,
    );
  }
  const store = storeRef.current;

  useEffect(() => {
    store.setRuntimeConfig({
      plugins: props.plugins,
      markdownToHtmlOptions: props.markdownToHtmlOptions,
      parserConfig,
    });
  }, [store, props.plugins, props.markdownToHtmlOptions, parserConfig]);

  const initSchemaValue = useMemo(() => {
    const parseResult = parserMdToSchema(
      initValue || '',
      pluginsForInitParseRef.current || [],
      parserConfig,
    );
    let list = parseResult?.schema || [];

    if (!props.readonly && list.length === 0) {
      list = [...list, EditorUtils.p];
    }

    const schema =
      props.initSchemaValue ||
      (initValue ? list : copy([EditorUtils.p]));

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

  useEffect(() => {
    setPluginRemountInitSchema(undefined);
  }, [initValue, props.initSchemaValue]);

  const slateInitSchemaValue = pluginRemountInitSchema ?? initSchemaValue;

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
  }, [store]);

  useSystemKeyboard(keyTask$, store, props, markdownContainerRef);

  useImperativeHandle(editorRef, () => {
    return {
      store,
      markdownContainerRef,
      markdownEditorRef,
      exportHtml: instance.exportHtml,
    };
  }, [instance, store, editorMountStatus]);

  const context = useContext(ConfigProvider.ConfigContext);
  const baseClassName = context?.getPrefixCls(`agentic-md-editor`);
  const { hashId } = useStyle(baseClassName);

  const [showCommentList, setShowComment] = useState<CommentDataType[]>([]);

  const [schema, setSchema] = useState<Elements[]>(initSchemaValue);

  useEffect(() => {
    setSchema(initSchemaValue);
  }, [initSchemaValue]);

  // toc 关闭时无人消费 schema，无需 setState 触发整树 re-render；
  // toc 开启时延迟到稳定后再更新，TOC 跟随节奏可接受地放慢。
  const tocEnabled = toc !== false;
  const setSchemaDebounce = useDebounceFn((next: Elements[]) => {
    setSchema(next);
  }, 200);
  const handleChildChange = useRefFunction(
    (value: string, s: Elements[]) => {
      if (tocEnabled) {
        setSchemaDebounce.run(s);
      }
      rest?.onChange?.(value, s);
    },
  );

  const [openInsertCompletion, setOpenInsertCompletion] = useState(false);
  const [floatBarRevision, setFloatBarRevision] = useState(0);
  const bumpFloatBarRevision = useRefFunction(() => {
    setFloatBarRevision((revision) => revision + 1);
  });

  const insertCompletionText$ = useMemo(() => new Subject<string>(), []);
  const openInsertLink$ = useMemo(() => new Subject<Selection>(), []);
  const selChange$ = useMemo(() => createEditorSelChangeSubject(), []);

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

  const containerMountedRef = useRef(false);

  const isStreaming = props.streaming ?? props.typewriter ?? false;

  return (
    <I18nBoundary>
      <PluginContext.Provider value={props.plugins || []}>
        <EditorStoreContext.Provider
          value={{
            keyTask$,
            insertCompletionText$,
            openInsertLink$,
            selChange$,
            openInsertCompletion,
            setOpenInsertCompletion,
            bumpFloatBarRevision,
            floatBarRevision,
            refreshFloatBar: floatBarRevision,
            rootContainer: props.rootContainer,
            setShowComment,
            store,
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
            ) : null}
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
                if (dom && !containerMountedRef.current) {
                  containerMountedRef.current = true;
                  setMountedStatus(true);
                }
              }}
              tabIndex={-1}
            >
              <SlateMarkdownEditor
                key={slateRemountKey}
                slateRemountKey={slateRemountKey}
                prefixCls={baseClassName}
                {...rest}
                lazy={lazy}
                onChange={handleChildChange}
                initSchemaValue={slateInitSchemaValue}
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
