import { ConfigProvider } from 'antd';
import classNames from 'classnames';
import React, { useContext, useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import { BaseRange, Editor, Range, Transforms } from 'slate';
import { useRefFunction } from '../../../../Hooks/useRefFunction';
import { IEditor, MARKDOWN_EDITOR_EVENTS } from '../../../BaseMarkdownEditor';
import { useEditorStore } from '../../store';
import { getSelRect } from '../../utils/dom';
import { BaseToolBar } from './BaseBar';
import { useStyle } from './floatBarStyle';
import { ReadonlyBaseBar } from './ReadonlyBaseBar';
const fileMap = new Map<string, IEditor>();

/**
 * 浮动工具栏,用于设置文本样式
 */
export const FloatBar = (props: { readonly: boolean }) => {
  const floatBarRef = useRef<HTMLDivElement>(null);
  const { domRect, setDomRect, markdownContainerRef, markdownEditorRef } =
    useEditorStore();
  const [isOpen, setIsOpen] = useState(false);

  const sel = React.useRef<BaseRange>();

  const resize = useRefFunction((force = false) => {
    if (domRect && floatBarRef.current) {
      let left = domRect.x;
      left = left - ((props.readonly ? 65 : 178) - domRect.width) / 2;

      const container = markdownContainerRef.current!;
      if (left < 4) left = 4;
      const barWidth = props.readonly ? 65 : 232;

      if (left > container.clientWidth - barWidth)
        left = container.clientWidth - barWidth / 2;

      let top =
        isOpen && !force
          ? parseFloat(floatBarRef.current.style.top || '0')
          : domRect.top - 32;

      const finalLeft = Math.max(left, 4);
      const finalTop = Math.max(top, 4);

      floatBarRef.current.style.left = finalLeft + 'px';
      floatBarRef.current.style.top = finalTop + 'px';

      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  });

  useEffect(() => {
    if (domRect && markdownEditorRef.current) {
      resize(true);
      sel.current = markdownEditorRef.current.selection!;
    } else {
      setIsOpen(false);
      fileMap.clear();
    }
  }, [domRect]);

  useEffect(() => {
    const resizeFn = (e: MouseEvent) => {
      if (markdownEditorRef.current && floatBarRef.current) {
        floatBarRef.current.style.top = e.clientY + 20 + 'px';
        floatBarRef.current.style.left = e.clientX + 'px';
        resize(true);
      }
    };
    if (markdownContainerRef.current) {
      markdownContainerRef.current?.addEventListener(
        MARKDOWN_EDITOR_EVENTS.SELECTIONCHANGE,
        resizeFn as EventListener,
      );
    }
    return () => {
      if (markdownContainerRef.current) {
        markdownContainerRef.current?.removeEventListener(
          MARKDOWN_EDITOR_EVENTS.SELECTIONCHANGE,
          resizeFn as EventListener,
        );
      }
    };
  }, [isOpen]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const close = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        setIsOpen(false);
        fileMap.clear();
        if (!sel.current) return;
        //@ts-ignore
        const end = Range.end(sel.current!).path;
        if (Editor.hasPath(markdownEditorRef.current, end)) {
          Transforms.select(
            markdownEditorRef.current,
            Editor.end(markdownEditorRef.current, end),
          );
        }
      }
    };
    markdownContainerRef?.current?.addEventListener('keydown', close);
    return () => {
      markdownContainerRef?.current?.removeEventListener('keydown', close);
    };
  }, [isOpen]);

  useEffect(() => {
    const change = () => {
      if (isOpen) {
        const rect = getSelRect();
        if (rect) {
          setDomRect?.(rect);
        }
        resize(true);
      }
    };
    window.addEventListener('resize', change);
    return () => window.removeEventListener('resize', change);
  }, []);

  const context = useContext(ConfigProvider.ConfigContext);
  const baseClassName = context?.getPrefixCls(`md-editor-float-bar`);

  const { wrapSSR, hashId } = useStyle(baseClassName);

  if (!markdownContainerRef.current) return null;

  return ReactDOM.createPortal(
    wrapSSR(
      <div
        style={{
          position: 'fixed',
          opacity: isOpen ? 1 : 0,
          transition: 'all 0.3s ease-out',
          userSelect: 'none',
        }}
        ref={floatBarRef}
        onMouseDown={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        className={classNames(baseClassName, hashId)}
      >
        {props.readonly ? (
          <ReadonlyBaseBar prefix={baseClassName} />
        ) : (
          <BaseToolBar prefix={baseClassName} hashId={hashId} />
        )}
      </div>,
    ),
    document.body,
  );
};
