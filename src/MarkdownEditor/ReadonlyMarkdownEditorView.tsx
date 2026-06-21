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
import { useFormulaConfig } from '../Config';
import { resolveContainerContentStyle } from '../Constants/contentPaddingVars';
import { MarkdownRenderer } from '../MarkdownRenderer';
import type { MarkdownRendererRef } from '../MarkdownRenderer/types';
import { CommentList } from './editor/components/CommentList';
import { EditorStore, EditorStoreContext } from './editor/store';
import I18nBoundary from './I18nBoundary';
import { PluginContext } from './plugin';
import {
  applyReadonlyCommentHighlights,
  bindReadonlyCommentClick,
  clearReadonlyCommentHighlights,
} from './readonly/applyReadonlyCommentHighlights';
import { createReadonlyMarkdownEditorInstance } from './readonly/ReadonlyMarkdownEditorStore';
import { useStyle } from './style';
import type { CommentDataType, MarkdownEditorProps } from './types';
import { sanitizeEditorChromeStyle } from './utils/sanitizeChromeStyle';

/**
 * 只读 + renderMode=markdown 专用外壳：不挂载 Slate / EditorStore，不执行 parserMdToSchema 等编辑侧逻辑。
 * 与 BaseMarkdownEditorSlate 二选一，由 BaseMarkdownEditor 根入口按 props 分流。
 */
const ReadonlyMarkdownEditorView: React.FC<MarkdownEditorProps> = (props) => {
  const {
    id,
    initValue = '',
    width,
    className,
    reportMode,
    slideMode,
    contentStyle: rawContentStyle = { height: '100%' },
    style: rawStyle,
    height,
    children,
    editorRef,
    comment,
    toc = false,
  } = props;

  const contentStyle = resolveContainerContentStyle(
    sanitizeEditorChromeStyle(rawContentStyle),
  );
  const rootStyle = sanitizeEditorChromeStyle(rawStyle);
  const markdownContainerRef = useRef<HTMLDivElement | null>(null);
  const markdownRendererRef = useRef<MarkdownRendererRef>(null);
  const displayedContentRef = useRef(initValue);

  const isStreaming = props.streaming ?? props.typewriter ?? false;
  const formulaConfig = useFormulaConfig(props.formula);
  const commentEnabled = comment?.enable !== false && !!comment;

  const [showCommentList, setShowCommentList] = useState<CommentDataType[]>([]);

  const context = useContext(ConfigProvider.ConfigContext);
  const baseClassName = context?.getPrefixCls('agentic-md-editor');
  const { hashId } = useStyle(baseClassName);
  const contentPrefixCls = context?.getPrefixCls('agentic-md-editor-content');

  const editorInstance = useMemo(
    () =>
      createReadonlyMarkdownEditorInstance({
        markdownContainerRef,
        getDisplayedContent: () =>
          markdownRendererRef.current?.getDisplayedContent() ??
          displayedContentRef.current,
      }),
    [],
  );

  useImperativeHandle(
    editorRef,
    () =>
      ({
        ...editorInstance,
        store: editorInstance.store as unknown as EditorStore,
      }) as import('./types').MarkdownEditorInstance,
    [editorInstance],
  );

  const commentList = comment?.commentList ?? [];

  useEffect(() => {
    if (!commentEnabled) {
      return;
    }

    let observer: MutationObserver | null = null;
    let retryTimer: ReturnType<typeof setTimeout> | undefined;
    let rafId: number | undefined;

    const getRoot = () => editorInstance.store.getContentContainer();

    const applyHighlights = () => {
      const root = getRoot();
      if (!root) {
        return;
      }
      observer?.disconnect();
      clearReadonlyCommentHighlights(root);
      if (commentList.length) {
        applyReadonlyCommentHighlights(root, commentList, contentPrefixCls);
      }
      observer?.observe(root, {
        childList: true,
        subtree: true,
        characterData: true,
      });
    };

    const scheduleApply = () => {
      if (rafId !== undefined) {
        return;
      }
      rafId = requestAnimationFrame(() => {
        rafId = undefined;
        applyHighlights();
      });
    };

    const mount = () => {
      const root = getRoot();
      if (!root) {
        retryTimer = setTimeout(mount, 16);
        return;
      }
      applyHighlights();
      observer = new MutationObserver(scheduleApply);
      observer.observe(root, {
        childList: true,
        subtree: true,
        characterData: true,
      });
    };

    if (commentList.length) {
      mount();
    } else {
      clearReadonlyCommentHighlights(getRoot());
    }

    const unbindClick = bindReadonlyCommentClick(
      getRoot(),
      setShowCommentList,
      commentList,
    );

    return () => {
      if (retryTimer) {
        clearTimeout(retryTimer);
      }
      if (rafId !== undefined) {
        cancelAnimationFrame(rafId);
      }
      observer?.disconnect();
      clearReadonlyCommentHighlights(getRoot());
      unbindClick();
    };
  }, [
    commentEnabled,
    contentPrefixCls,
    commentList,
    editorInstance.store,
    initValue,
    isStreaming,
    props.isFinished,
  ]);

  useEffect(() => {
    displayedContentRef.current =
      markdownRendererRef.current?.getDisplayedContent() ?? initValue;
  });

  const editorStoreContextValue = useMemo(
    () =>
      ({
        store: editorInstance.store,
        readonly: true,
        typewriter: false,
        setShowComment: setShowCommentList,
        markdownEditorRef: editorInstance.markdownEditorRef,
        editorProps: props,
      }) as any,
    [editorInstance, props],
  );

  return (
    <I18nBoundary>
      <PluginContext.Provider value={props.plugins || []}>
        <EditorStoreContext.Provider value={editorStoreContextValue}>
          <div
            id={id ? String(id) || undefined : undefined}
            className={classNames(
              baseClassName,
              'markdown-editor',
              hashId,
              className,
              {
                [`${baseClassName}-readonly`]: true,
                [`${baseClassName}-report`]: reportMode,
                [`${baseClassName}-slide`]: slideMode,
              },
            )}
            data-testid="markdown-editor"
            style={{
              width: width || '100%',
              height: height || 'auto',
              ...rootStyle,
            }}
            ref={markdownContainerRef}
          >
            <MarkdownRenderer
              ref={markdownRendererRef}
              content={initValue}
              streaming={isStreaming}
              isFinished={props.isFinished ?? !isStreaming}
              throttleOptions={props.throttleOptions}
              plugins={props.plugins}
              remarkPlugins={props.markdownToHtmlOptions}
              formula={formulaConfig}
              codeProps={props.codeProps}
              apaasify={props.apaasify}
              style={{
                height: '100%',
                ...contentStyle,
              }}
              prefixCls={baseClassName}
              fncProps={props.fncProps}
              linkConfig={props.linkConfig}
              eleRender={props.eleRender}
              fileMapConfig={props.fileMapConfig}
            />
            {showCommentList.length ? (
              <CommentList
                pure={toc === false}
                commentList={showCommentList}
                comment={comment}
              />
            ) : null}
            {children}
          </div>
        </EditorStoreContext.Provider>
      </PluginContext.Provider>
    </I18nBoundary>
  );
};

export default ReadonlyMarkdownEditorView;
