import { Editor, Element, Node, Path, Point, Range, Transforms } from 'slate';
import type { CodeNode, Elements } from '../../../el';
import { setCodeBlockNodes } from '../../utils/codeBlockBehavior';
import { getCodeBlockPlainText } from '../../utils/codeBlockPlainText';
import { EditorUtils } from '../../utils/editorUtils';
export class BackspaceKey {
  constructor(private readonly editor: Editor) {}

  range() {
    const sel = this.editor.selection;
    if (!sel) return;
    // 折叠选区下 start/end 与文档起止可能重合（如空段落），不能当作「全选」
    if (!Range.isExpanded(sel)) return false;
    let [start, end] = Range.edges(sel);
    if (
      Point.equals(start, Editor.start(this.editor, [])) &&
      Point.equals(end, Editor.end(this.editor, []))
    ) {
      EditorUtils.deleteAll(this.editor);
      Transforms.select(this.editor, Editor.end(this.editor, []));
      return true;
    }
    return false;
  }

  private clearStyle(sel: Range) {
    const start = Range.start(sel);
    const [leaf] = Editor.leaf(this.editor, start);
    if (leaf?.text?.length === 1 && EditorUtils.isDirtLeaf(leaf)) {
      EditorUtils.clearMarks(this.editor);
    }
  }

  run() {
    const sel = this.editor.selection;
    if (!sel) return;
    const nodes = Array.from<any>(
      Editor.nodes<Elements>(this.editor, {
        mode: 'lowest',
        match: (n) => Element.isElement(n),
      }),
    );
    const [node] = nodes;
    const [el, path] = node;
    const parent = Editor.parent(this.editor, path);
    if (el.type !== 'paragraph' && parent?.[0]?.type !== 'list-item') {
      this.clearStyle(sel);
    }
    if (el.type === 'head') {
      const str = Node.string(el);
      if (!str) {
        Transforms.setNodes(
          this.editor,
          {
            type: 'paragraph',
          },
          { at: path },
        );
        return true;
      }
    }
    if (el.type === 'media' || el.type === 'attach') {
      Editor.withoutNormalizing(this.editor, () => {
        Transforms.removeNodes(this.editor, { at: path });
        Transforms.insertNodes(this.editor, EditorUtils.p, {
          at: node[1],
          select: true,
        });
      });
      return true;
    }

    /**
     * 处理表格单元格在起始位置的情况
     */
    if (el.type === 'table-cell' && sel.anchor.offset === 0) {
      // 当光标在表格单元格的起始位置时，阻止继续退格
      const start = Range.start(sel);
      if (!Path.hasPrevious(start.path)) {
        return true;
      }
    }

    /**
     * 防止删除paragraph与空table-cell混合
     */
    if (sel.anchor.offset === 0) {
      const preInline = Editor.previous<any>(this.editor, {
        at: sel.focus.path,
      });
      if (preInline && preInline[0].type === 'break') {
        Transforms.delete(this.editor, { at: preInline[1] });
        return true;
      }
      if (el.type === 'paragraph') {
        const pre = Editor.previous<any>(this.editor, { at: path });
        if (pre) {
          if (['table', 'code'].includes(pre[0].type)) {
            const end = Editor.end(this.editor, pre[1]);
            if (!Node.string(Node.get(this.editor, end.path))) {
              Editor.withoutNormalizing(this.editor, () => {
                Transforms.delete(this.editor, { at: path });
                const text = Node.string(el);
                if (text) {
                  if (pre[0].type === 'code') {
                    setCodeBlockNodes(this.editor, pre[1], {
                      value:
                        getCodeBlockPlainText(pre[0] as CodeNode) + text,
                    });
                  } else {
                    Transforms.insertNodes(this.editor, el.children, {
                      at: end,
                    });
                  }
                }
                Transforms.select(this.editor, end);
              });
              return true;
            }
          }
          if (pre[0].type === 'media' || pre[0].type === 'attach') {
            if (!Node.string(el)) {
              Transforms.delete(this.editor, { at: path });
            }
            Transforms.select(this.editor, pre[1]);
            return true;
          }
        }
        if (
          !pre &&
          !Editor.previous<any>(this.editor, { at: sel.anchor.path })
        ) {
          const parent = Editor.parent(this.editor, path);
          if (parent[0].type === 'blockquote') {
            Editor.withoutNormalizing(this.editor, () => {
              if (Editor.hasPath(this.editor, Path.next(path))) {
                Transforms.delete(this.editor, { at: path });
              } else {
                Transforms.delete(this.editor, { at: parent[1] });
              }
              Transforms.insertNodes(
                this.editor,
                { type: 'paragraph', children: el.children },
                { at: parent[1] },
              );
              Transforms.select(
                this.editor,
                Editor.start(this.editor, parent[1]),
              );
            });
            return true;
          }

          const nextPath = Path.next(path);
          if (
            Editor.isEditor(parent[0]) &&
            Editor.hasPath(this.editor, nextPath)
          ) {
            const [nextNode] = Editor.node(this.editor, nextPath);
            if ((nextNode as Record<string, unknown>)?.type !== 'hr') {
              Transforms.delete(this.editor, { at: path });
              return true;
            }
          }
        }
        return false;
      }
    }

    return false;
  }
}
