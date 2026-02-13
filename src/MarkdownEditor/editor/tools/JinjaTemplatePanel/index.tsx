import { ConfigProvider, Typography } from 'antd';
import classNames from 'clsx';
import isHotkey from 'is-hotkey';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import { Editor, Transforms } from 'slate';
import { ReactEditor } from 'slate-react';
import type { JinjaTemplateItem } from '../../../types';
import { useEditorStore } from '../../store';
import { getOffsetLeft } from '../../utils/dom';
import { EditorUtils } from '../../utils/editorUtils';
import { JINJA_PANEL_PREFIX_CLS, useJinjaTemplatePanelStyle } from './style';
import { JINJA_DOC_LINK, JINJA_TEMPLATE_DATA } from './templates';

const PANEL_MAX_HEIGHT = 320;

function getPosition(nodeEl: HTMLElement): {
  left: number;
  top?: number;
  bottom?: number;
} {
  const rect = nodeEl.getBoundingClientRect();
  const left = getOffsetLeft(nodeEl, document.body) + 0;
  const top = rect.bottom + window.scrollY;
  const viewportHeight = document.documentElement.clientHeight;
  const spaceBelow = viewportHeight - rect.bottom;
  if (spaceBelow < PANEL_MAX_HEIGHT && rect.top > PANEL_MAX_HEIGHT) {
    return { left, bottom: viewportHeight - rect.top };
  }
  return { left, top };
}

export const JinjaTemplatePanel: React.FC = () => {
  const {
    markdownEditorRef,
    markdownContainerRef,
    openJinjaTemplate,
    setOpenJinjaTemplate,
    jinjaAnchorPath,
    setJinjaAnchorPath,
    editorProps,
  } = useEditorStore();

  const jinjaConfig = editorProps?.jinja;
  const templatePanelConfig =
    jinjaConfig?.templatePanel && typeof jinjaConfig.templatePanel === 'object'
      ? jinjaConfig.templatePanel
      : undefined;
  const trigger = templatePanelConfig?.trigger ?? '{}';
  const docLink = jinjaConfig?.docLink ?? JINJA_DOC_LINK;
  const notFoundContent = templatePanelConfig?.notFoundContent ?? null;
  const itemsConfig = templatePanelConfig?.items;

  const [items, setItems] = useState<JinjaTemplateItem[]>(JINJA_TEMPLATE_DATA);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [position, setPosition] = useState<{
    left: number;
    top?: number;
    bottom?: number;
  }>({ left: 0 });
  const domRef = useRef<HTMLDivElement>(null);

  const context = React.useContext(ConfigProvider.ConfigContext);
  const prefixCls =
    context?.getPrefixCls?.('md-editor-jinja-panel') ?? JINJA_PANEL_PREFIX_CLS;
  const { wrapSSR, hashId } = useJinjaTemplatePanelStyle(prefixCls);

  const close = useCallback(() => {
    setOpenJinjaTemplate?.(false);
    setJinjaAnchorPath?.(null);
    setActiveIndex(0);
  }, [setOpenJinjaTemplate, setJinjaAnchorPath]);

  const handleClickOutside = useCallback(
    (e: Event) => {
      const target = e.target as HTMLElement;
      if (domRef.current && !domRef.current.contains(target)) {
        close();
      }
    },
    [close],
  );

  useEffect(() => {
    if (!openJinjaTemplate) return;
    if (typeof itemsConfig === 'function') {
      setLoading(true);
      const editor = markdownEditorRef?.current;
      itemsConfig({ editor })
        .then((list) => {
          setItems(Array.isArray(list) ? list : JINJA_TEMPLATE_DATA);
        })
        .catch((err) => {
          setItems(JINJA_TEMPLATE_DATA);
          if (process.env.NODE_ENV !== 'production') {
            console.error(
              '[JinjaTemplatePanel] Failed to load template items:',
              err,
            );
          }
        })
        .finally(() => setLoading(false));
    } else if (Array.isArray(itemsConfig)) {
      setItems(itemsConfig);
    } else {
      setItems(JINJA_TEMPLATE_DATA);
    }
  }, [openJinjaTemplate, itemsConfig, markdownEditorRef]);

  useEffect(() => {
    if (!openJinjaTemplate || !jinjaAnchorPath || !markdownEditorRef?.current)
      return;
    const editor = markdownEditorRef.current;
    try {
      const [node] = Editor.node(editor, jinjaAnchorPath);
      if (node) {
        const el = ReactEditor.toDOMNode(editor, node);
        if (el) {
          const pos = getPosition(el);
          setPosition(pos);
        }
      }
    } catch {
      setPosition({ left: 0 });
    }
  }, [openJinjaTemplate, jinjaAnchorPath, markdownEditorRef]);

  useEffect(() => {
    if (!openJinjaTemplate) return;
    if (typeof window === 'undefined') return;
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, [openJinjaTemplate, handleClickOutside]);

  const insertTemplate = useCallback(
    (item: JinjaTemplateItem) => {
      const editor = markdownEditorRef?.current;
      if (!editor || !jinjaAnchorPath || !setOpenJinjaTemplate) return;
      try {
        const end = Editor.end(editor, jinjaAnchorPath);
        const start =
          Editor.before(editor, end, { distance: trigger.length }) ?? end;
        Transforms.delete(editor, { at: { anchor: start, focus: end } });
        Transforms.insertText(editor, item.template, { at: start });
        EditorUtils.focus(editor);
      } finally {
        close();
      }
    },
    [
      markdownEditorRef,
      jinjaAnchorPath,
      trigger.length,
      setOpenJinjaTemplate,
      close,
    ],
  );

  const keydown = useCallback(
    (e: KeyboardEvent) => {
      if (!openJinjaTemplate) return;
      if (isHotkey('esc', e)) {
        e.preventDefault();
        close();
        EditorUtils.focus(markdownEditorRef?.current);
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex((i) => (i > 0 ? i - 1 : items.length - 1));
        return;
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIndex((i) => (i < items.length - 1 ? i + 1 : 0));
        return;
      }
      if (e.key === 'Enter' && items[activeIndex]) {
        e.preventDefault();
        e.stopPropagation();
        insertTemplate(items[activeIndex]);
      }
    },
    [
      openJinjaTemplate,
      close,
      markdownEditorRef,
      items,
      activeIndex,
      insertTemplate,
    ],
  );

  useEffect(() => {
    const container = markdownContainerRef?.current;
    if (!container) return;
    container.addEventListener('keydown', keydown);
    return () => container.removeEventListener('keydown', keydown);
  }, [markdownContainerRef, keydown]);

  useEffect(() => {
    setActiveIndex(0);
  }, [items]);

  if (!openJinjaTemplate) return null;

  const panel = wrapSSR(
    <div
      ref={domRef}
      role="listbox"
      aria-label="Jinja template list"
      className={classNames(prefixCls, hashId)}
      style={{
        position: 'absolute',
        zIndex: 9999,
        left: position.left,
        top: position.top,
        bottom: position.bottom,
      }}
      onMouseDown={(e) => e.preventDefault()}
    >
      <div className={`${prefixCls}__content`}>
        {docLink ? (
          <div className={`${prefixCls}__doc-link`}>
            <Typography.Link
              href={docLink}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="打开 Jinja 使用说明（新窗口）"
            >
              使用说明
            </Typography.Link>
          </div>
        ) : null}
        <div className={`${prefixCls}__list-box`}>
          {loading ? (
            <div style={{ padding: 12, color: 'var(--color-text-secondary)' }}>
              加载中...
            </div>
          ) : items.length === 0 ? (
            (notFoundContent ?? (
              <div
                style={{ padding: 12, color: 'var(--color-text-secondary)' }}
              >
                暂无模板
              </div>
            ))
          ) : (
            items.map((item, i) => (
              <div
                key={i}
                role="option"
                aria-selected={i === activeIndex}
                className={classNames(`${prefixCls}__item`, {
                  [`${prefixCls}__item--active`]: i === activeIndex,
                })}
                onMouseDown={(e) => {
                  e.preventDefault();
                  insertTemplate(item);
                }}
                onMouseEnter={() => setActiveIndex(i)}
              >
                <span className={`${prefixCls}__item-title`}>{item.title}</span>
                {item.description ? (
                  <span className={`${prefixCls}__item-desc`}>
                    {item.description}
                  </span>
                ) : null}
              </div>
            ))
          )}
        </div>
      </div>
    </div>,
  );

  return ReactDOM.createPortal(panel, document.body);
};
