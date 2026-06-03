/* eslint-disable no-case-declarations */
import React from 'react';
import {
  BaseSelection,
  Editor,
  Element,
  Node,
  NodeEntry,
  Path,
  Point,
  Range,
  Transforms,
} from 'slate';
import { HeadNode, ParagraphNode, TableNode } from '../../../el';
import { EditorStore } from '../../store';
import { isMod } from '../../utils';
import { EditorUtils } from '../../utils/editorUtils';
import { isImeComposing } from '../../utils/isImeComposing';
import { BlockMathNodes } from '../elements';
import { BackspaceKey } from './backspace';
export class EnterKey {
  bracketsMap = new Map([
    ['[', ']'],
    ['{', '}'],
  ]);
  constructor(
    private readonly store: EditorStore,
    private readonly backspace: BackspaceKey,
  ) {}
  get editor() {
    return this.store?.editor;
  }
  run(e: React.KeyboardEvent) {
    let sel = this.editor.selection;
    if (!sel || isImeComposing(e, this.store.inputComposition)) return;
    if (!Range.isCollapsed(sel)) {
      e.preventDefault();
      this.backspace.range();
      return;
    }
    const [node] = Editor.nodes<Element>(this.editor, {
      match: (n) => Element.isElement(n),
      mode: 'lowest',
    });
    if (node) {
      let [el, path] = node;

      if (el.type === 'card-before') {
        // 在 card 之前插入空段落：path 是 [card, 0]，Path.parent(path) 即 card 自身路径。
        // insertNodes(at: cardPath) 会把新节点放在该 index 位置，把 card 顺势后移，
        // 等价于"在 card 之前插入"。
        const cardPath = Path.parent(path);
        Transforms.insertNodes(this.editor, EditorUtils.p, {
          at: cardPath,
          select: true,
        });
        e.preventDefault();
        return;
      }

      if (el.type === 'card-after') {
        // 在 card 之后插入空段落：path 是 [card, N-1]，Path.next(Path.parent(path))
        // 是 card 的下一个兄弟位置；若 card 是末位，越界时 Slate insertNodes 自动 append。
        const afterCardPath = Path.next(Path.parent(path));
        Transforms.insertNodes(this.editor, EditorUtils.p, {
          at: afterCardPath,
          select: true,
        });
        e.preventDefault();
        return;
      }
      if (el.type === 'head') {
        if (this.head(el as HeadNode, path, sel)) {
          e.preventDefault();
          return;
        }
      }
      if (el.type === 'paragraph') {
        if (this.paragraph(e, node as NodeEntry<ParagraphNode>, sel)) {
          e.preventDefault();
          return;
        }
      }
      if (el.type === 'table-cell') {
        const row = Editor.parent(this.editor, path);
        if (row[0].type === 'table-row') {
          // 必须传入 table-cell 的 NodeEntry：列索引用 cell path 末位，下一行用 Path.next(rowPath)
          this.table(node as NodeEntry<TableNode>, sel, e);
          e.preventDefault();
          return;
        }
      }
      if (el.type === 'blockquote') {
        this.empty(e, path);
        return;
      }

      if (el.type === 'break') {
        Transforms.insertNodes(this.editor, {
          type: 'paragraph',
          children: [{ text: '' }],
        });
        e.preventDefault();
      }
    }
    this.editor?.insertBreak();
  }

  empty(e: React.KeyboardEvent, path: Path) {
    const [parent, parentPath] = Editor.parent(this.editor, path);
    if (parent.type === 'blockquote') {
      if (!Path.hasPrevious(path)) {
        const hashNext = Editor.hasPath(this.editor, Path.next(path));
        if (!hashNext) {
          Editor.withoutNormalizing(this.editor, () => {
            Transforms.delete(this.editor, { at: parentPath });
            Transforms.insertNodes(
              this.editor,
              { type: 'paragraph', children: [{ text: '' }] },
              { at: parentPath, select: true },
            );
          });
          e.preventDefault();
        }
      }
      if (!Editor.hasPath(this.editor, Path.next(path))) {
        Editor.withoutNormalizing(this.editor, () => {
          Transforms.delete(this.editor, { at: path });
          Transforms.insertNodes(
            this.editor,
            { type: 'paragraph', children: [{ text: '' }] },
            { at: Path.next(parentPath), select: true },
          );
        });
        e.preventDefault();
      }
    }

  }

  private table(
    node: NodeEntry<TableNode>,
    sel: BaseSelection,
    e: React.KeyboardEvent,
  ) {
    if (isMod(e)) {
      if (e.shiftKey) {
        Transforms.insertNodes(
          this.editor,
          [{ type: 'break', children: [{ text: '' }] }, { text: '' }],
          { select: true },
        );
        e.preventDefault();
      } else {
        const row = Editor.parent(this.editor, node[1]);
        const insertRow = {
          type: 'table-row',
          children: row[0].children.map(() => {
            return {
              type: 'table-cell',
              children: [
                {
                  type: 'paragraph',
                  children: [{ text: '' }],
                },
              ],
            };
          }),
        };
        Transforms.insertNodes(this.editor, insertRow, {
          at: Path.next(row[1]),
        });
        Transforms.select(
          this.editor,
          Editor.start(this.editor, Path.next(row[1])),
        );
      }
    } else {
      const index = node[1][node[1].length - 1];
      const nextRow = Path.next(Path.parent(node[1]));
      if (Editor.hasPath(this.editor, nextRow)) {
        Transforms.select(
          this.editor,
          Editor.end(this.editor, [...nextRow, index]),
        );
      } else {
        const tableNext = Path.next(Path.parent(Path.parent(node[1])));
        if (Editor.hasPath(this.editor, tableNext)) {
          Transforms.select(this.editor, Editor.start(this.editor, tableNext));
        } else {
          Transforms.insertNodes(this.editor, EditorUtils.p, {
            at: tableNext,
            select: true,
          });
        }
      }
    }
  }

  private head(el: HeadNode, path: Path, sel: Range) {
    const start = Range.start(sel);
    const elStart = Editor.start(this.editor, path);
    if (Point.equals(start, elStart)) {
      Transforms.insertNodes(
        this.editor,
        {
          type: 'paragraph',
          children: [{ text: '' }],
        },
        { at: path },
      );
    } else {
      const end = Range.end(sel);
      const elEnd = Editor.end(this.editor, path);
      if (Point.equals(end, elEnd)) {
        Transforms.insertNodes(
          this.editor,
          {
            type: 'paragraph',
            children: [{ text: '' }],
          },
          { at: Path.next(path), select: true },
        );
      } else {
        const fragment = Node.fragment(this.editor, {
          anchor: end,
          focus: elEnd,
        });
        Editor.withoutNormalizing(this.editor, () => {
          Transforms.delete(this.editor, {
            at: {
              anchor: start,
              focus: elEnd,
            },
          });
          Transforms.insertNodes(
            this.editor,
            {
              type: 'paragraph',
              children: fragment[0]?.children || [{ text: '' }],
            },
            { at: Path.next(path) },
          );
          Transforms.select(
            this.editor,
            Editor.start(this.editor, Path.next(path)),
          );
        });
      }
    }
    return true;
  }

  private paragraph(
    e: React.KeyboardEvent,
    node: NodeEntry<ParagraphNode>,
    sel: Range,
  ) {
    if (isImeComposing(e, this.store.inputComposition)) {
      return false;
    }
    const end = Editor.end(this.editor, node[1]);
    if (Point.equals(end, sel.focus)) {
      const str = Node.string(node[0]);
      if (!str) return;
      for (let n of BlockMathNodes) {
        if (n.checkAllow && !n.checkAllow({ editor: this.editor, node, sel }))
          continue;
        const m = str?.match(n.reg);
        if (m) {
          const handled = n.run({
            editor: this.editor,
            path: node[1],
            match: m,
            el: node[0],
            sel,
            startText: m[0],
          });
          if (handled === false) continue;
          e.preventDefault();
          return true;
        }
      }
    }
  }
}
