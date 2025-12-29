/* eslint-disable @typescript-eslint/no-use-before-define */
import { DeleteOutlined } from '@ant-design/icons';
import { Input, InputRef, Modal, Tooltip } from 'antd';
import React, { useCallback, useContext, useRef } from 'react';
import { Selection, Text, Transforms } from 'slate';
import { useRefFunction } from '../../../hooks/useRefFunction';
import { I18nContext } from '../../../I18n';
import { IEditor } from '../../BaseMarkdownEditor';
import { useSubject } from '../../hooks/subscribe';
import { useEditorStore } from '../store';
import { useGetSetState } from '../utils';
import { EditorUtils } from '../utils/editorUtils';
import { isLink, parsePath } from '../utils/path';

/**
 * 文档项接口，扩展了编辑器基础接口
 */
type DocItem = IEditor & {
  /** 文档路径 */
  path: string;
  /** 父级路径 */
  parentPath?: string;
};

/**
 * 插入链接组件
 *
 * 该组件提供在 Markdown 编辑器中插入和编辑链接的功能。
 * 支持多种链接插入方式：
 * - 手动输入链接URL
 * - 从文档列表中选择内部链接
 * - 自动检测和转换选中文本为链接
 * - 支持锚点链接和相对路径
 *
 * 功能特性：
 * - 模态框界面，用户体验友好
 * - 实时链接验证和预览
 * - 支持删除现有链接
 * - 智能文本选择和替换
 * - 国际化支持
 * - 键盘快捷键支持
 *
 * @returns 插入链接的模态框组件，如果未打开则返回null
 *
 * @example
 * ```tsx
 * // 组件会自动监听编辑器的 openInsertLink$ 事件
 * <InsertLink />
 * ```
 *
 * @remarks
 * - 组件通过 `useSubject` 监听 `store.openInsertLink$` 事件
 * - 使用 `useGetSetState` 管理模态框状态
 * - 支持通过 EditorUtils 操作 Slate.js 编辑器
 * - 提供链接有效性检查和用户反馈
 */
export const InsertLink = () => {
  const { markdownContainerRef, openInsertLink$, domRect, markdownEditorRef } =
    useEditorStore();
  const { locale } = useContext(I18nContext);
  const selRef = useRef<Selection>();
  const inputRef = useRef<InputRef>(null);

  const [state, setState] = useGetSetState({
    open: false,
    inputKeyword: '',
    oldUrl: '',
    index: 0,
    docs: [] as DocItem[],
    filterDocs: [] as DocItem[],
    anchors: [] as { item: DocItem; value: string }[],
    filterAnchors: [] as { item: DocItem; value: string }[],
  });

  const prevent = useCallback((e: WheelEvent) => {
    e.preventDefault();
  }, []);

  const setPath = useCallback((path: string) => {
    if (isLink(path)) {
      close(path);
    } else {
      const parse = parsePath(path);
      if (!parse.path && parse.hash) {
        return close('#' + parse.hash);
      }
      const realPath = parse.path;
      const relativePath = realPath;
      close(`${relativePath}${parse.hash ? `#${parse.hash}` : ''}`);
    }
  }, []);

  const openInsertLink = useRefFunction((sel: Selection) => {
    if (domRect) {
      selRef.current = sel;
      markdownContainerRef.current!.parentElement?.addEventListener(
        'wheel',
        prevent,
        {
          passive: false,
        },
      );

      const url = EditorUtils.getUrl(markdownEditorRef.current);
      let path = url;
      if (url && !url.startsWith('#') && !isLink(url)) {
        path = url;
      }
      const parse = parsePath(path);
      setState({
        oldUrl: url || '',
        open: true,
        filterDocs: [],
        docs: [],
        inputKeyword: path,
      });
      if (parse.hash) {
      } else {
        setState({
          filterAnchors: [],
          anchors: [],
        });
      }
      setTimeout(() => {
        inputRef.current?.focus();
      }, 16);
    }
  });

  useSubject(openInsertLink$, openInsertLink);

  const close = useCallback((url?: string) => {
    markdownContainerRef.current!.parentElement?.removeEventListener(
      'wheel',
      prevent,
    );
    setState({ open: false });
    EditorUtils.focus(markdownEditorRef.current);
    Transforms.setNodes(
      markdownEditorRef.current,
      { url },
      { match: Text.isText, split: true },
    );
    if (typeof window === 'undefined') return;
    if (typeof window.matchMedia === 'undefined') return;
  }, []);

  if (!state().open) return null;

  return (
    <Modal
      afterClose={() => {
        close(state().oldUrl);
      }}
      open={state().open}
      onOk={(e) => {
        e.preventDefault();
        if (isLink(state().inputKeyword)) {
          close(state().inputKeyword);
        } else {
          if (state().anchors.length) {
            const target = state().filterAnchors[state().index];
            if (target) {
              setPath(target.item.path + target.value);
            }
          } else {
            const target = state().filterDocs[state().index];
            if (target) {
              setPath(target.path);
            } else {
              close(state().inputKeyword);
            }
          }
        }
      }}
      onCancel={() => {
        close(state().oldUrl);
      }}
      style={{
        pointerEvents: 'auto',
        width: 370,
      }}
      title=" "
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '0 6px',
          width: '100%',
          gap: 8,
        }}
      >
        <Input.TextArea
          ref={inputRef}
          value={state().inputKeyword}
          spellCheck={false}
          onKeyDown={(e) => {
            if (
              e.key.toLowerCase() === 'backspace' &&
              state().anchors.length &&
              (e.metaKey ||
                e.altKey ||
                state().inputKeyword.endsWith('#') ||
                !state().inputKeyword.includes('#'))
            ) {
              setState({
                anchors: [],
                filterAnchors: [],
              });
            }
          }}
          onChange={(e) => {
            const key = e.target.value.toLowerCase();
            if (state().anchors.length) {
              const parse = parsePath(key);
              const filterAnchors = state().anchors.filter((d) => {
                return (
                  !parse.hash || d.value.toLowerCase().includes(parse.hash)
                );
              });
              setState({
                filterAnchors,
              });
            } else {
              const filterDocs = state().docs.filter((d) => {
                return d.path.toLowerCase().includes(key);
              });
              setState({
                filterDocs,
              });
            }
            setState({
              inputKeyword: e.target.value,
              index: 0,
            });
          }}
          style={{
            flex: 1,
          }}
        />
        <Tooltip title={locale?.removeLink || '移除链接'}>
          <div
            style={{
              cursor: 'pointer',
              fontSize: '1.1em',
              color: 'rgba(0,0,0,0.5)',
            }}
            onClick={() => {
              close();
            }}
          >
            <DeleteOutlined />
          </div>
        </Tooltip>
      </div>
    </Modal>
  );
};
