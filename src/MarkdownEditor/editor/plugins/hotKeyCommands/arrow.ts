import isHotkey from 'is-hotkey';
import React from 'react';
import { Editor, Element, Node, Path, Range, Transforms } from 'slate';
import { EditorStore } from '../../store';
import { isMod } from '../../utils';
import { EditorUtils } from '../../utils/editorUtils';

/**
 * 处理编辑器中的箭头键相关操作
 *
 * @param store - 编辑器存储对象
 * @param e - 键盘事件对象
 *
 * 功能包括:
 * - Mod+左箭头: 在代码行中移动到行首或前一个非空白字符
 * - 左箭头:
 *   - 处理media/attach元素前的光标移动
 *   - 处理空白节点前的光标移动
 *   - 处理void节点前的光标移动
 * - 右箭头:
 *   - 处理media/attach元素后的光标移动
 *   - 处理空白节点后的光标移动
 *   - 处理void节点后的光标移动
 * - 上箭头:
 *   - 处理表格、代码块等特殊块的上方导航
 *   - 在表格首行和代码块首行上方插入段落
 *   - 处理media/attach元素的向上移动
 * - 下箭头:
 *   - 处理表格、代码块等特殊块的下方导航
 *   - 在表格末行和代码块末行下方插入段落
 *   - 处理media/attach元素的向下移动
 *   - 处理空段落的导航
 */
export const keyArrow = (
  store: EditorStore,
  e: React.KeyboardEvent | KeyboardEvent,
) => {
  const editor = store?.editor;
  const sel = editor.selection;
  if (sel && Range.isCollapsed(sel)) {
    if (isHotkey('mod+left', e)) {
      return;
    }
    // 暂时没用了。先注释掉吧
    if (isHotkey('left', e)) {
      e.preventDefault();
      e.stopPropagation();
      const [leaf] = Editor.leaf(editor, sel.focus);
      const dirt = EditorUtils.isDirtLeaf(leaf);
      const pre = Editor.previous<any>(editor, { at: sel.focus.path });
      if (
        sel.focus.offset === 0 &&
        pre &&
        (pre[0].type === 'media' || pre[0].type === 'attach')
      ) {
        Transforms.select(editor, pre[1]);
      } else if (sel.focus.offset === 0 && dirt) {
        EditorUtils.moveBeforeSpace(editor, sel.focus.path);
      } else {
        if (
          sel.focus.offset === 0 &&
          Path.hasPrevious(sel.focus.path) &&
          Editor.isVoid(editor, Node.get(editor, Path.previous(sel.focus.path)))
        ) {
          if (Path.hasPrevious(Path.previous(sel.focus.path))) {
            Transforms.select(
              editor,
              Editor.end(editor, Path.previous(Path.previous(sel.focus.path))),
            );
          }
        } else {
          Transforms.move(editor, { unit: 'offset', reverse: true });
        }
      }
      return;
    }
    if (isHotkey('right', e)) {
      e.preventDefault();
      e.stopPropagation();
      if (!isMod(e)) {
        const [leaf] = Editor.leaf(editor, sel.focus);
        const dirt = EditorUtils.isDirtLeaf(leaf);
        const next = Editor.next<any>(editor, { at: sel.focus.path });
        const [node] = Editor.nodes<any>(editor, {
          match: (n) => n.type === 'media' || n.type === 'attach',
        });
        if (node) {
          if (node?.[0]?.type === 'media' || node?.[0]?.type === 'attach') {
            Transforms.select(editor, Editor.start(editor, Path.next(node[1])));
          } else {
            EditorUtils.moveAfterSpace(editor, node[1]);
          }
        } else if (
          sel.focus.offset === leaf.text?.length &&
          next &&
          next[0].type === 'media'
        ) {
          Transforms.select(editor, next[1]);
        } else if (
          sel.focus.offset === leaf.text?.length &&
          dirt &&
          !Editor.next(editor, { at: sel.focus.path })
        ) {
          EditorUtils.moveAfterSpace(editor, sel.focus.path);
        } else {
          const [leaf] = Editor.leaf(editor, sel.focus);
          if (
            sel.focus.offset === leaf.text?.length &&
            Editor.hasPath(editor, Path.next(sel.focus.path)) &&
            Editor.isVoid(editor, Node.get(editor, Path.next(sel.focus.path)))
          ) {
            if (Editor.hasPath(editor, Path.next(Path.next(sel.focus.path)))) {
              Transforms.select(
                editor,
                Editor.start(editor, Path.next(Path.next(sel.focus.path))),
              );
            }
          } else {
            Transforms.move(editor, { unit: 'offset' });
          }
        }
      } else {
        Transforms.select(
          editor,
          Editor.end(editor, Path.parent(sel.focus.path)),
        );
      }
      return;
    }
    if (isHotkey('up', e)) {
      const [node] = Editor.nodes<any>(editor, {
        match: (n) => Element.isElement(n),
        mode: 'lowest',
      });
      const [el, path] = node;
      const pre = Editor?.node(editor, EditorUtils.findPrev(editor, path));
      if (pre?.[0].type === 'media' || pre?.[0].type === 'attach') {
        e.preventDefault();
        e.stopPropagation();
        Transforms.select(editor, pre[1]);
        return;
      }
      if (el.type === 'media' || el.type === 'attach') {
        e.preventDefault();
        const pre = EditorUtils.findPrev(editor, path);
        Transforms.select(editor, Editor.end(editor, pre));
      }
    }
    if (isHotkey('down', e)) {
      const [node] = Editor.nodes<any>(editor, {
        match: (n) => Element.isElement(n),
        mode: 'lowest',
      });
      const [el, path] = node;
      if (!EditorUtils.findNext(editor, path)) return;
      const next = Editor?.node(editor, EditorUtils.findNext(editor, path)!);
      if (next?.[0].type === 'media' || next?.[0].type === 'attach') {
        e.preventDefault();
        e.stopPropagation();
        Transforms.select(editor, next[1]);
        return;
      }

      if (el.type === 'media' || el.type === 'attach') {
        const next = EditorUtils.findNext(editor, path);
        e.preventDefault();
        if (next) {
          Transforms.select(editor, Editor.start(editor, next));
        }
      }
      if (el.type === 'paragraph') {
        if (
          path[0] === 0 &&
          !Node.string(el) &&
          Editor.isEditor(Node.get(editor, Path.parent(path))) &&
          Editor.hasPath(editor, Path.next(path))
        ) {
          const next = Editor?.node(editor, Path.next(path));
          if (['table', 'code', 'blockquote'].includes(next[0].type)) {
            e.preventDefault();
            Transforms.select(editor, Editor.start(editor, Path.next(path)));
            Transforms.delete(editor, { at: path });
          }
        }
        if (
          (Node.string(el) ||
            el.children.length > 1 ||
            el.children[0].type === 'media') &&
          EditorUtils.checkSelEnd(editor, path)
        ) {
          Transforms.insertNodes(editor, EditorUtils.p, {
            at: [editor.children.length],
            select: true,
          });
        }
      }
    }
  }
};
