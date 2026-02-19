import React from 'react';
import { Editor, Element, Node, NodeEntry, Range } from 'slate';
import { TextMatchNodes } from '../elements';

export class MatchKey {
  constructor(
    private readonly editorRef: React.MutableRefObject<Editor | null>,
  ) {}

  private createParams(
    editor: Editor,
    node: NodeEntry,
    match: RegExpMatchArray,
  ) {
    return {
      el: node[0],
      path: node[1],
      editor,
      sel: editor.selection!,
      match,
      startText: match[0],
    };
  }

  run(e: React.KeyboardEvent): boolean {
    const editor = this.editorRef.current;
    if (!editor) return false;

    const [node] = Editor.nodes<Element>(editor, {
      match: (n) => Element.isElement(n),
      mode: 'lowest',
    });
    if (!node || ['code'].includes(node?.[0]?.type)) return false;
    const sel = editor.selection;
    if (!sel || !Range.isCollapsed(sel)) return false;
    for (let n of TextMatchNodes) {
      if (
        typeof n.matchKey === 'object'
          ? n.matchKey.test(e.key)
          : n.matchKey === e.key
      ) {
        if (n.checkAllow && !n.checkAllow({ editor, node, sel })) continue;
        const [leafNode] = Editor.leaf(editor, sel.anchor);
        const str =
          Node.string(leafNode).slice(0, sel.anchor.offset) + e.key;
        const m = str.match(n.reg);
        if (m) {
          if (n.run(this.createParams(editor, node, m))) {
            e.preventDefault();
            return true;
          }
        }
      }
    }
    return false;
  }
}
