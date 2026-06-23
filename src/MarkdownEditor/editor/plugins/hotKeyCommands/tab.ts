import React from 'react';
import {
  Editor,
  Element,
  Node,
  Path,
  Point,
  Range,
  Text,
  Transforms,
} from 'slate';
import { TableCellNode } from '../../../el';
import { ListsEditor } from '../lists';

/** 表格 Tab 导航；其余 Tab 由 lists keyboardBridge 处理 */
export class TabKey {
  constructor(private readonly editor: Editor) {}

  run(e: React.KeyboardEvent) {
    const sel = this.editor.selection;
    if (!sel) return;
    e.preventDefault();

    if (Range.isCollapsed(sel)) {
      const [node] = Editor.nodes<TableCellNode>(this.editor, {
        match: (n) => Element.isElement(n) && n.type === 'table-cell',
        mode: 'lowest',
      });
      if (node && this.tableCell(node[0], node[1], e.shiftKey)) {
        return;
      }
      if (e.shiftKey) {
        const [leaf] = Editor.nodes(this.editor, {
          match: (n) => Text.isText(n),
        });
        if (leaf) {
          const str = Node.string(leaf[0]);
          if (str && /^\t/.test(str)) {
            Transforms.insertText(this.editor, '', {
              at: {
                anchor: { path: leaf[1], offset: 0 },
                focus: { path: leaf[1], offset: 1 },
              },
            });
            Transforms.select(this.editor, {
              path: sel.anchor.path,
              offset: sel.anchor.offset - 1,
            });
          }
        }
      } else {
        this.editor.insertText('\t');
      }
      return;
    }

    const [start, end] = Range.edges(sel);
    const [code] = Editor.nodes(this.editor, {
      match: (n) => n?.type === 'code',
    });
    if (
      code &&
      Point.compare(Editor.start(this.editor, code[1]), start) !== 1 &&
      Point.compare(Editor.end(this.editor, code[1]), end) !== -1
    ) {
      return;
    }

    if (e.shiftKey) {
      if (ListsEditor.isListsEnabled(this.editor)) {
        ListsEditor.decreaseDepth(this.editor, sel);
        return;
      }
      Transforms.liftNodes(this.editor);
      return;
    }

    Transforms.select(this.editor, {
      path: end.path,
      offset: end.offset,
    });
  }

  private tableCell(node: TableCellNode, nodePath: Path, shift = false) {
    const sel = this.editor.selection!;
    const text = Node.string(node);
    if (shift) {
      if (Path.hasPrevious(nodePath)) {
        Transforms.select(
          this.editor,
          Editor.end(this.editor, Path.previous(nodePath)),
        );
      } else if (Path.hasPrevious(Path.parent(nodePath))) {
        Transforms.select(
          this.editor,
          Editor.end(this.editor, Path.previous(Path.parent(nodePath))),
        );
      }
      return true;
    }
    if (text.length === sel.anchor.offset) {
      if (Editor.hasPath(this.editor, Path.next(nodePath))) {
        Transforms.select(
          this.editor,
          Editor.end(this.editor, Path.next(nodePath)),
        );
      } else if (Editor.hasPath(this.editor, Path.next(Path.parent(nodePath)))) {
        Transforms.select(
          this.editor,
          Editor.end(this.editor, [...Path.next(Path.parent(nodePath)), 0]),
        );
      }
      return true;
    }
    return false;
  }
}
