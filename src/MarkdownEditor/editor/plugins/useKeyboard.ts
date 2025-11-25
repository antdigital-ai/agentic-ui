import isHotkey from 'is-hotkey';
import React, { useMemo } from 'react';
import {
  BaseEditor,
  Editor,
  Element,
  Node,
  Path,
  Range,
  Transforms,
} from 'slate';
import { HistoryEditor } from 'slate-history';
import { ReactEditor } from 'slate-react';
import { MarkdownEditorProps } from '../../BaseMarkdownEditor';
import { EditorStore } from '../store';
import { EditorUtils } from '../utils/editorUtils';
import { BackspaceKey } from './hotKeyCommands/backspace';
import { EnterKey } from './hotKeyCommands/enter';
import { MatchKey } from './hotKeyCommands/match';
import { TabKey } from './hotKeyCommands/tab';

import { NativeTableKeyboard } from '../../utils/native-table';
import { useEditorStore } from '../store';

/**
 * 键盘事件处理 Hook - 管理 Markdown 编辑器的所有键盘交互
 *
 * 该 Hook 负责拦截和处理各种键盘快捷键和特殊按键操作，提供丰富的编辑体验：
 *
 * 支持的快捷键操作：
 * - Tab/Shift+Tab：代码块缩进控制、列表层级调整
 * - Backspace：智能删除、格式清理、列表处理
 * - Enter：段落分割、列表项创建、代码块换行
 * - 方向键：光标移动、选择范围调整
 * - Ctrl/Cmd 组合键：文本格式化（粗体、斜体等）
 *
 * 特殊功能：
 * - 自动补全面板的键盘导航
 * - 表格单元格间的 Tab 导航
 * - 代码块的语法高亮触发
 * - Markdown 语法的智能识别和转换
 *
 * @param store - 编辑器的全局状态管理对象
 * @param markdownEditorRef - 指向 Slate.js 编辑器实例的引用
 * @param props - 编辑器的属性配置对象
 * @returns 返回键盘事件处理函数，用于绑定到 Slate.js 的 onKeyDown 属性
 *
 * @example
 * ```typescript
 * const onKeyDown = useKeyboard(store, editorRef, editorProps);
 *
 * return (
 *   <Slate editor={editor} initialValue={value}>
 *     <Editable onKeyDown={onKeyDown} />
 *   </Slate>
 * );
 * ```
 *
 * @remarks
 * - 所有按键处理都经过 isHotkey 库进行精确匹配
 * - 支持跨平台快捷键（Windows/Mac）
 * - 与编辑器状态深度集成，实现上下文相关的行为
 * - 提供良好的用户体验和 Markdown 编辑效率
 */
export const useKeyboard = (
  store: EditorStore,
  markdownEditorRef: React.MutableRefObject<
    BaseEditor & ReactEditor & HistoryEditor
  >,
  props: MarkdownEditorProps,
) => {
  const {
    openInsertCompletion,
    insertCompletionText$,
    setOpenInsertCompletion,
  } = useEditorStore();
  return useMemo(() => {
    const tab = new TabKey(markdownEditorRef.current);
    const backspace = new BackspaceKey(markdownEditorRef.current);
    const enter = new EnterKey(store, backspace);
    const match = new MatchKey(markdownEditorRef.current);
    return (e: React.KeyboardEvent) => {
      // 处理表格键盘事件
      if (NativeTableKeyboard.shouldHandle(markdownEditorRef.current)) {
        if (
          NativeTableKeyboard.handleKeyDown(
            markdownEditorRef.current,
            e.nativeEvent,
          )
        ) {
          return;
        }
      }

      if (openInsertCompletion && (isHotkey('up', e) || isHotkey('down', e))) {
        e.preventDefault();
        return;
      }
      if (isHotkey('mod+ArrowDown', e)) {
        e.preventDefault();
        Transforms.select(
          markdownEditorRef.current,
          Editor.end(markdownEditorRef.current, []),
        );
      }
      if (isHotkey('mod+ArrowUp', e)) {
        e.preventDefault();
        Transforms.select(
          markdownEditorRef.current,
          Editor.start(markdownEditorRef.current, []),
        );
      }
      if (isHotkey('backspace', e) && markdownEditorRef.current.selection) {
        if (Range.isCollapsed(markdownEditorRef.current.selection)) {
          if (backspace.run()) {
            e.stopPropagation();
            e.preventDefault();
            return;
          }
        }
        if (backspace.range()) {
          e.stopPropagation();
          e.preventDefault();
          return;
        }
      }
      if (isHotkey('mod+shift+v', e)) {
        e.preventDefault();
      }
      if (isHotkey('mod+alt+v', e) || isHotkey('mod+opt+v', e)) {
        e.preventDefault();
      }
      if (isHotkey('mod+shift+s', e)) {
        e.preventDefault();
      }

      if (props?.markdown?.matchInputToNode) {
        match.run(e);
        return;
      }

      if (e.key.toLowerCase().startsWith('arrow')) {
        if (['ArrowUp', 'ArrowDown'].includes(e.key)) return;
        // 处理 tag 前的空格插入
        if (e.key === 'ArrowLeft') {
          const selection = markdownEditorRef.current.selection;
          if (selection && Range.isCollapsed(selection)) {
            const [node] = Editor.nodes(markdownEditorRef.current, {
              at: selection.focus.path,
              match: (n) => n.tag === true,
            });

            if (node) {
              const [, tagPath] = node;
              const offset = selection.focus.offset;
              // 当光标在 tag 开始位置时，检查前面是否需要插入空格
              if (offset === 0) {
                const [prevNode] =
                  Editor.previous(markdownEditorRef.current, { at: tagPath }) ||
                  [];
                if (!prevNode || !(prevNode as any).text?.endsWith('\uFEFF')) {
                  e.preventDefault();
                  Transforms.insertNodes(
                    markdownEditorRef.current,
                    [{ text: '\uFEFF' }],
                    {
                      at: tagPath,
                      select: true,
                    },
                  );
                  return;
                }
              }
            }
          }
        }
        return;
      }

      if (e.key === 'Tab') tab.run(e);

      // Enter 发送，Shift+Enter 换行
      if (e.key === 'Enter' && e.shiftKey && !(e.ctrlKey || e.metaKey)) {
        e.stopPropagation();
        e.preventDefault();
        enter.run(e);
        return;
      }
      // Enter 键（无 Shift）由 MarkdownInputField 处理发送，这里不处理
      if (e.key === 'Enter' && !(e.ctrlKey || e.metaKey) && !e.shiftKey) {
        return;
      }

      const [node] = Editor.nodes<any>(markdownEditorRef.current, {
        match: (n) => Element.isElement(n),
        mode: 'lowest',
      });
      if (!node) return;
      if (node?.[0]?.type === 'paragraph') {
        const [node] = Editor.nodes<any>(markdownEditorRef.current, {
          match: (n) => Element.isElement(n) && n.type === 'paragraph',
          mode: 'lowest',
        });
        if (
          node &&
          node[0].children.length === 1 &&
          !EditorUtils.isDirtLeaf(node[0].children[0]) &&
          (e.key === 'Backspace' || /^[^\n]$/.test(e.key))
        ) {
          let str = Node.string(node[0]) || '';
          const codeMatch = str.match(/^```([\w+\-#]+)$/i);
          if (codeMatch) {
          } else {
            const insertMatch = str.match(/^\/([^\n]+)?$/i);
            if (
              insertMatch &&
              !(
                !Path.hasPrevious(node[1]) &&
                Node.parent(markdownEditorRef.current, node[1]).type ===
                  'list-item'
              )
            ) {
              setOpenInsertCompletion?.(true);
              setTimeout(() => {
                insertCompletionText$.next(insertMatch[1]);
              });
            }
          }
        }
      }
    };
  }, [markdownEditorRef.current]);
};
