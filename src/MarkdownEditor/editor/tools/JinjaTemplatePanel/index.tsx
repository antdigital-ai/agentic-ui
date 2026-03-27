import { CloseOutlined } from '@ant-design/icons';
import { Info } from '@sofa-design/icons';
import { ConfigProvider } from 'antd';
import classNames from 'clsx';
import isHotkey from 'is-hotkey';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import ReactDOM from 'react-dom';
import { Editor, Transforms } from 'slate';
import { ReactEditor } from 'slate-react';
import { useLocale } from '../../../../I18n';
import type { JinjaTemplateItem } from '../../../types';
import { useEditorStore } from '../../store';
import { EditorUtils } from '../../utils/editorUtils';
import { JINJA_PANEL_PREFIX_CLS, useJinjaTemplatePanelStyle } from './style';
import { getJinjaTemplateData, JINJA_DOC_LINK } from './templates';

const PANEL_MAX_HEIGHT = 320;
const PANEL_MIN_WIDTH = 240;

function getPosition(nodeEl: HTMLElement): {
  left: number;
  top?: number;
  bottom?: number;
  position: 'fixed';
} {
  const rect = nodeEl.getBoundingClientRect();
  const viewportWidth = document.documentElement.clientWidth;
  const viewportHeight = document.documentElement.clientHeight;
  const spaceBelow = viewportHeight - rect.bottom;
  const spaceAbove = rect.top;

  let left = rect.left;
  left = Math.max(0, Math.min(left, viewportWidth - PANEL_MIN_WIDTH));

  if (spaceBelow < PANEL_MAX_HEIGHT && spaceAbove > PANEL_MAX_HEIGHT) {
    return {
      left,
      bottom: Math.min(
        viewportHeight - rect.top,
        viewportHeight - PANEL_MAX_HEIGHT,
      ),
      position: 'fixed',
    };
  }
  const top = Math.min(rect.bottom, viewportHeight - PANEL_MAX_HEIGHT);
  return { left, top, position: 'fixed' };
}

export const JinjaTemplatePanel: React.FC = () => {
  const {
    markdownEditorRef,
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

  const locale = useLocale();
  const defaultItems = useMemo(() => getJinjaTemplateData(locale), [locale]);
  const [items, setItems] = useState<JinjaTemplateItem[]>(defaultItems);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [position, setPosition] = useState<{
    left: number;
    top?: number;
    bottom?: number;
    position: 'fixed';
  }>({ left: 0, position: 'fixed' });
  const domRef = useRef<HTMLDivElement>(null);
  const openTimeRef = useRef<number>(0);

  const context = React.useContext(ConfigProvider.ConfigContext);
  const prefixCls =
    context?.getPrefixCls?.('agentic-md-editor-jinja-panel') ??
    JINJA_PANEL_PREFIX_CLS;
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
        // 忽略弹窗打开后短时间内的点击，避免「点击聚焦编辑器后快速输入 {}」
        // 触发的陈旧 click 事件立即关闭弹窗
        const elapsed = Date.now() - openTimeRef.current;
        if (elapsed < 150) return;
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
          setItems(Array.isArray(list) ? list : defaultItems);
        })
        .catch((err) => {
          setItems(defaultItems);
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
      setItems(defaultItems);
    }
  }, [openJinjaTemplate, itemsConfig, markdownEditorRef, defaultItems]);

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
      setPosition({ left: 0, position: 'fixed' });
    }
  }, [openJinjaTemplate, jinjaAnchorPath, markdownEditorRef]);

  useEffect(() => {
    if (!openJinjaTemplate) return;
    if (typeof window === 'undefined') return;
    openTimeRef.current = Date.now();
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
    if (!openJinjaTemplate) return;
    const handleKeydown = (e: KeyboardEvent) => keydown(e);
    document.addEventListener('keydown', handleKeydown);
    return () => document.removeEventListener('keydown', handleKeydown);
  }, [openJinjaTemplate, keydown]);

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
        position: position.position,
        zIndex: 9999,
        left: position.left,
        top: position.top,
        bottom: position.bottom,
      }}
      onMouseDown={(e) => e.preventDefault()}
    >
      <div className={`${prefixCls}-content`}>
        <div className={`${prefixCls}-header`}>
          <div className={`${prefixCls}-title`}>
            {locale['jinja.panel.title']}
          </div>
          <div className={`${prefixCls}-header-actions`}>
            {docLink ? (
              <div
                className={`${prefixCls}-doc-link`}
                onClick={(e) => {
                  e.preventDefault();
                  window.open(docLink, '_blank');
                }}
              >
                <Info />
                {locale['jinja.panel.docLink']}
              </div>
            ) : null}
            <button
              type="button"
              className={`${prefixCls}-close`}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                close();
              }}
              aria-label={locale['jinja.panel.close']}
              title={locale['jinja.panel.close']}
            >
              <CloseOutlined />
            </button>
          </div>
        </div>

        <div className={`${prefixCls}-list-box`}>
          {loading ? (
            <div
              style={{
                padding: 12,
                color: 'var(--color-text-secondary, var(--color-gray-text-secondary, rgba(0,0,0,0.45)))',
              }}
            >
              {locale.loading}
            </div>
          ) : items.length === 0 ? (
            (notFoundContent ?? (
              <div
                style={{
                  padding: 12,
                  color: 'var(--color-text-secondary, var(--color-gray-text-secondary, rgba(0,0,0,0.45)))',
                }}
              >
                {locale['jinja.panel.noTemplates']}
              </div>
            ))
          ) : (
            items.map((item, i) => (
              <div
                key={i}
                role="option"
                aria-selected={i === activeIndex}
                className={classNames(`${prefixCls}-item`, {
                  [`${prefixCls}-item-active`]: i === activeIndex,
                })}
                onMouseDown={(e) => {
                  e.preventDefault();
                  insertTemplate(item);
                }}
                onMouseEnter={() => setActiveIndex(i)}
              >
                <span className={`${prefixCls}-item-title`}>{item.title}</span>
                {item.description ? (
                  <span className={`${prefixCls}-item-desc`}>
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
