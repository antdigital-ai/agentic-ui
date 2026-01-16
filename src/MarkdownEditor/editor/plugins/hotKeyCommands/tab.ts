/* eslint-disable no-case-declarations */
import React from 'react';
import {
  Editor,
  Element,
  Node,
  NodeEntry,
  Path,
  Point,
  Range,
  Text,
  Transforms,
} from 'slate';
import { NodeTypes, ParagraphNode, TableCellNode } from '../../../el';
import { isListType, getListType } from '../withListsPlugin';

/**
 * TabKey 类用于处理编辑器中的 Tab 键事件。
 */
export class TabKey {
  constructor(private readonly editor: Editor) {}

  run(e: React.KeyboardEvent) {
    const sel = this.editor.selection;
    if (!sel) return;
    e.preventDefault();
    if (Range.isCollapsed(sel)) {
      const [node] = Editor.nodes<any>(this.editor, {
        match: (n) =>
          Element.isElement(n) && ['table-cell', 'paragraph'].includes(n.type),
        mode: 'lowest',
      });
      if (sel && Editor.hasPath(this.editor, sel.anchor.path)) {
        if (node) {
          const [el, path] = node;
          switch (node?.[0]?.type as NodeTypes) {
            case 'table-cell':
              if (this.tableCell(el, path, e.shiftKey)) return;
              break;
            case 'paragraph':
              const parent = Editor.parent(this.editor, node[1]);
              if (parent && parent[0].type === 'list-item') {
                if (this.listItem(node, e)) return;
              }
              break;
          }
        }
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
    } else {
      const [start, end] = Range.edges(sel);
      const [code] = Editor.nodes(this.editor, {
        match: (n) => n?.type === 'code',
      });
      if (code) {
        if (
          Point.compare(Editor.start(this.editor, code[1]), start) !== 1 &&
          Point.compare(Editor.end(this.editor, code[1]), end) !== -1
        ) {
          return;
        }
      } else if (e.shiftKey) {
        const [node] = Editor.nodes<any>(this.editor, {
          match: (n) => isListType(n),
        });
        if (node) {
          const [start, end] = Range.edges(sel);
          const anchor = start.path.join(',').startsWith(node[1].join(','))
            ? start
            : Editor.start(this.editor, node[1]);
          const focus = end.path.join(',').startsWith(node[1].join(','))
            ? end
            : Editor.end(this.editor, node[1]);
          Transforms.liftNodes(this.editor, { at: { anchor, focus } });
          Transforms.liftNodes(this.editor);
        } else {
          Transforms.liftNodes(this.editor);
        }
        return;
      }
      Transforms.select(this.editor, {
        path: end.path,
        offset: end.offset,
      });
    }
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
    } else {
      if (text.length === sel!.anchor.offset) {
        if (Editor.hasPath(this.editor, Path.next(nodePath))) {
          Transforms.select(
            this.editor,
            Editor.end(this.editor, Path.next(nodePath)),
          );
        } else if (
          Editor.hasPath(this.editor, Path.next(Path.parent(nodePath)))
        ) {
          Transforms.select(
            this.editor,
            Editor.end(this.editor, [...Path.next(Path.parent(nodePath)), 0]),
          );
        }
        return true;
      }
    }
    return false;
  }

  /**
   * 处理列表项的 Tab/Shift+Tab 键
   * 
   * Tab: 增加缩进（将当前 list-item 移动到前一个 list-item 的子列表中）
   * Shift+Tab: 减少缩进（将当前 list-item 提升一级）
   */
  private listItem(node: NodeEntry<ParagraphNode>, e: React.KeyboardEvent) {
    const listItemPath = Path.parent(node[1]);
    const listItem = Node.get(this.editor, listItemPath);
    
    if (!Element.isElement(listItem) || listItem.type !== 'list-item') {
      return false;
    }

    const listPath = Path.parent(listItemPath);
    const list = Node.get(this.editor, listPath);
    
    if (!isListType(list)) {
      return false;
    }

    if (e.shiftKey) {
      // Shift+Tab: 减少缩进
      return this.outdentListItem(listItemPath, listPath);
    } else {
      // Tab: 增加缩进
      return this.indentListItem(listItemPath, listPath);
    }
  }

  /**
   * 增加缩进：将当前 list-item 移动到前一个 list-item 的子列表中
   */
  private indentListItem(listItemPath: Path, listPath: Path): boolean {
    // 检查是否是第一个 list-item（第一行按 Tab 应该无效）
    if (!Path.hasPrevious(listItemPath)) {
      return false;
    }

    const previousListItemPath = Path.previous(listItemPath);
    const previousListItem = Node.get(this.editor, previousListItemPath);
    
    if (!Element.isElement(previousListItem) || previousListItem.type !== 'list-item') {
      return false;
    }

    // 检查前一个 list-item 的最后一个子节点是否为列表
    const lastChildIndex = previousListItem.children.length - 1;
    const lastChild = previousListItem.children[lastChildIndex];
    
    if (isListType(lastChild)) {
      // 如果最后一个子节点是列表，直接将当前项移动到该列表中
      const targetListPath = [...previousListItemPath, lastChildIndex];
      const targetList = Node.get(this.editor, targetListPath);
      
      if (isListType(targetList)) {
        const targetIndex = targetList.children.length;
        Transforms.moveNodes(this.editor, {
          at: listItemPath,
          to: [...targetListPath, targetIndex],
        });
        return true;
      }
    } else {
      // 如果最后一个子节点不是列表，需要创建一个新的列表
      const listType = getListType();
      const currentListItem = Node.get(this.editor, listItemPath);
      
      // 先创建新的列表，包含当前 list-item
      const newList = {
        type: listType,
        children: [currentListItem],
      };
      
      // 将当前项移动到新列表中
      Transforms.removeNodes(this.editor, { at: listItemPath });
      Transforms.insertNodes(this.editor, newList, {
        at: [...previousListItemPath, previousListItem.children.length],
      });
      
      // 更新路径，因为节点已移动
      const newListPath = [...previousListItemPath, previousListItem.children.length];
      const newListItemPath = [...newListPath, 0];
      
      // 选中新位置
      Transforms.select(this.editor, Editor.start(this.editor, newListItemPath));
      return true;
    }

    return false;
  }

  /**
   * 减少缩进：将当前 list-item 提升一级
   */
  private outdentListItem(listItemPath: Path, listPath: Path): boolean {
    // 检查当前 list 的父节点
    const listParent = Editor.parent(this.editor, listPath);
    
    // 如果父节点是 list-item，说明在嵌套列表中，可以提升
    if (Element.isElement(listParent[0]) && listParent[0].type === 'list-item') {
      const parentListItemPath = listParent[1];
      const parentListPath = Path.parent(parentListItemPath);
      const parentList = Node.get(this.editor, parentListPath);
      
      // 检查是否是父列表的第一个 list-item
      const isFirstInParentList = !Path.hasPrevious(listPath);
      
      if (isFirstInParentList && !Path.hasPrevious(parentListItemPath)) {
        // 如果是最顶层的第一个项，不能提升
        return false;
      }
      
      // 使用 liftNodes 提升当前 list-item
      Transforms.liftNodes(this.editor, { at: listItemPath });
      
      // 如果提升后，原列表为空，需要删除空列表
      const updatedList = Node.get(this.editor, listPath);
      if (isListType(updatedList) && updatedList.children.length === 0) {
        Transforms.removeNodes(this.editor, { at: listPath });
      }
      
      return true;
    } else {
      // 已经是最顶层，不能提升
      return false;
    }
  }
}
