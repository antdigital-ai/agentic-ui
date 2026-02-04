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
    if (!sel || this.store.inputComposition) return;
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
        Transforms.insertNodes(this.editor, EditorUtils.p, {
          at: Path.parent(path),
          select: true,
        });
        e.preventDefault();
        return;
      }

      if (el.type === 'card-after') {
        Transforms.insertNodes(this.editor, EditorUtils.p, {
          at: Path.next(Path.parent(path)),
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
        const table = Editor.parent(this.editor, path);
        if (table[0].type === 'table-row') {
          this.table(table as NodeEntry<TableNode>, sel, e);
          e.preventDefault();
          return;
        }
      }
      if (el.type === 'blockquote' || el.type === 'list-item') {
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
          Transforms.delete(this.editor, {
            at: parentPath,
          });
          Transforms.insertNodes(
            this.editor,
            {
              type: 'paragraph',
              children: [{ text: '' }],
            },
            { at: parentPath, select: true },
          );
          e.preventDefault();
        }
      }
      if (!Editor.hasPath(this.editor, Path.next(path))) {
        Transforms.delete(this.editor, {
          at: path,
        });
        Transforms.insertNodes(
          this.editor,
          {
            type: 'paragraph',
            children: [{ text: '' }],
          },
          { at: Path.next(parentPath), select: true },
        );
        e.preventDefault();
      }
    }

    if (parent.type === 'list-item') {
      const [ul, ulPath] = Editor.parent(this.editor, parentPath);
      const realEmpty = parent.children.length === 1;
      if (ul.children.length === 1 && realEmpty) {
        e.preventDefault();
        Transforms.delete(this.editor, { at: ulPath });
        Transforms.insertNodes(this.editor, EditorUtils.p, {
          at: ulPath,
          select: true,
        });
        return;
      }
      if (realEmpty) {
        e.preventDefault();
        if (!Path.hasPrevious(parentPath)) {
          Transforms.delete(this.editor, { at: parentPath });
          Transforms.insertNodes(this.editor, EditorUtils.p, {
            at: ulPath,
            select: true,
          });
        } else if (!Editor.hasPath(this.editor, Path.next(parentPath))) {
          Transforms.delete(this.editor, { at: parentPath });
          Transforms.insertNodes(this.editor, EditorUtils.p, {
            at: Path.next(ulPath),
            select: true,
          });
        } else {
          Transforms.liftNodes(this.editor, {
            at: parentPath,
          });
          Transforms.delete(this.editor, { at: Path.next(ulPath) });
          Transforms.insertNodes(this.editor, EditorUtils.p, {
            at: Path.next(ulPath),
            select: true,
          });
        }
      } else {
        if (!Editor.hasPath(this.editor, Path.next(path))) {
          e.preventDefault();
          Transforms.delete(this.editor, { at: path });
          Transforms.insertNodes(
            this.editor,
            {
              type: 'list-item',
              checked: typeof parent.checked === 'boolean' ? false : undefined,
              children: [EditorUtils.p],
            },
            { at: Path.next(parentPath), select: true },
          );
        } else if (!Path.hasPrevious(path)) {
          e.preventDefault();
          // 在列表项开头按回车时，只创建新的空列表项，不移动任何节点
          // 这样可以避免将嵌套列表或其他节点移动到新列表项内部，导致缩进
          Transforms.insertNodes(
            this.editor,
            {
              type: 'list-item',
              checked: typeof parent.checked === 'boolean' ? false : undefined,
              children: [EditorUtils.p],
            },
            { at: Path.next(parentPath), select: true },
          );
        }
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
      }
    }
    return true;
  }

  private paragraph(
    e: React.KeyboardEvent,
    node: NodeEntry<ParagraphNode>,
    sel: Range,
  ) {
    const parent = Editor.parent(this.editor, node[1]);
    const end = Editor.end(this.editor, node[1]);
    if (Point.equals(end, sel.focus)) {
      if (parent[0].type !== 'list-item' || Path.hasPrevious(node[1])) {
        const str = Node.string(node[0]);
        if (!str) return;
        for (let n of BlockMathNodes) {
          if (n.checkAllow && !n.checkAllow({ editor: this.editor, node, sel }))
            continue;
          const m = str?.match(n.reg);
          if (m) {
            n.run({
              editor: this.editor,
              path: node[1],
              match: m,
              el: node[0],
              sel,
              startText: m[0],
            });
            e.preventDefault();
            return true;
          }
        }
      }
    }
    if (parent[0].type === 'list-item') {
      if (isMod(e) || Path.hasPrevious(node[1])) {
        const text = Point.equals(end, sel.focus)
          ? [{ text: '' }]
          : EditorUtils.cutText(this.editor, sel.focus);
        Transforms.insertNodes(
          this.editor,
          {
            type: 'paragraph',
            children: text || ' ',
          },
          { at: Path.next(node[1]) },
        );
        if (!Point.equals(end, sel.focus)) {
          Transforms.delete(this.editor, {
            at: {
              anchor: sel.focus,
              focus: end,
            },
          });
        }
        if (Editor.hasPath(this.editor, Path.next(node[1]))) {
          Transforms.select(
            this.editor,
            Editor.start(this.editor, Path.next(node[1])),
          );
        } else {
          Transforms.select(
            this.editor,
            Editor.start(this.editor, Path.next(node[1])),
          );
        }
        e.preventDefault();
        return true;
      } else {
        e.preventDefault();
        let checked: boolean | undefined = undefined;
        if (typeof parent[0].checked === 'boolean') {
          if (
            sel.anchor.offset === 0 &&
            !Path.hasPrevious(sel.anchor.path) &&
            !Path.hasPrevious(node[1])
          ) {
            checked = parent[0].checked;
            Transforms.insertNodes(
              this.editor,
              {
                type: 'list-item',
                children: [EditorUtils.p],
                checked: typeof checked === 'boolean' ? false : undefined,
              },
              { at: parent[1] },
            );
            Transforms.select(
              this.editor,
              Editor.start(this.editor, Path.next(parent[1])),
            );
            return;
          } else {
            checked = false;
          }
        }
        const text = Point.equals(Editor.end(this.editor, node[1]), sel.focus)
          ? [{ text: '' }]
          : EditorUtils.cutText(this.editor, sel.focus);

        Transforms.insertNodes(
          this.editor,
          {
            type: 'list-item',
            children: [
              {
                type: 'paragraph',
                children: text || [{ text: '' }],
              },
            ],
            checked,
          },
          { at: Path.next(parent[1]) },
        );

        if (!Point.equals(sel.anchor, Editor.end(this.editor, node[1]))) {
          Transforms.delete(this.editor, {
            at: {
              anchor: sel.anchor,
              focus: Editor.end(this.editor, node[1]),
            },
          });
        }

        if (
          Point.equals(sel.anchor, Editor.start(this.editor, node[1])) &&
          Node.string(Node.get(this.editor, node[1])) !== ''
        ) {
          EditorUtils.clearMarks(this.editor);
        }

        if (Editor.start(this.editor, Path.next(parent[1]))) {
          Transforms.select(
            this.editor,
            Editor.start(this.editor, Path.next(parent[1])),
          );
        }

        // 不再移动任何节点到新列表项内部，避免导致新列表项被缩进
        // 嵌套列表应该保留在原列表项中
        return true;
      }
    }
  }
}
