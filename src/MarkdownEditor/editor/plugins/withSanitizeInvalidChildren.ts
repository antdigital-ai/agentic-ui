import { Editor, Element, Node, NodeEntry, Text, Transforms } from 'slate';
import { HistoryEditor } from 'slate-history';

import { EditorUtils } from '../utils/editorUtils';

const isValidChild = (child: unknown): child is Node =>
  child !== undefined && child !== null && Node.isNode(child);

/**
 * `Array.prototype.some` skips sparse holes; Slate still sees missing indices and
 * can pass `undefined` as `leaf` into `renderLeaf`, which then throws in `Text.isText`.
 */
const childArrayHasInvalidEntries = (rawChildren: unknown[]): boolean => {
  for (let i = 0; i < rawChildren.length; i += 1) {
    if (!(i in rawChildren) || !isValidChild(rawChildren[i])) {
      return true;
    }
  }
  return false;
};

const getChildList = (node: Node): unknown[] => {
  if (!('children' in node)) {
    return [];
  }
  const { children } = node as { children?: unknown };
  return Array.isArray(children) ? children : [];
};

const createDefaultBlock = () => ({
  type: 'paragraph' as const,
  children: [{ text: '' }],
});

/**
 * Slate 要求 editor 根下只能是块级节点；若出现裸 Text 或根级 inline，
 * 会导致 DOM 异常（如文本与块并列）、重复显示与 Backspace 失效。
 * 将连续的「非块」根子节点合并为一个段落包裹。
 */
const isSingletonTextParagraph = (node: Node): node is Element & { children: [Text] } => {
  if (!Element.isElement(node) || (node as { type?: string }).type !== 'paragraph') {
    return false;
  }
  const ch = (node as { children?: unknown }).children;
  if (!Array.isArray(ch) || ch.length !== 1 || !Text.isText(ch[0])) {
    return false;
  }
  return true;
};

/**
 * 裸 Text 与紧随其后的「同文单段」常来自非法根结构的双份展示；保留块节点、丢弃缓冲重复。
 */
const bufferMatchesFollowingSingletonParagraph = (
  buffer: Node[],
  block: Node,
): boolean => {
  if (buffer.length !== 1 || !Text.isText(buffer[0])) return false;
  if (!isSingletonTextParagraph(block)) return false;
  return buffer[0].text === Node.string(block);
};

const ensureRootOnlyBlockChildren = (editor: Editor, nodes: Node[]): Node[] => {
  const out: Node[] = [];
  let nonBlockBuffer: Node[] = [];

  const flushNonBlocks = () => {
    if (nonBlockBuffer.length === 0) return;
    out.push({
      type: 'paragraph',
      children: nonBlockBuffer,
    } as Node);
    nonBlockBuffer = [];
  };

  for (const child of nodes) {
    if (!isValidChild(child)) continue;
    if (Text.isText(child)) {
      nonBlockBuffer.push(child);
      continue;
    }
    if (Element.isElement(child) && Editor.isBlock(editor, child)) {
      if (bufferMatchesFollowingSingletonParagraph(nonBlockBuffer, child)) {
        nonBlockBuffer = [];
        out.push(child);
        continue;
      }
      flushNonBlocks();
      out.push(child);
      continue;
    }
    nonBlockBuffer.push(child);
  }
  flushNonBlocks();
  return out.length > 0 ? out : [createDefaultBlock()];
};

const rootHasNonBlockChild = (editor: Editor, childList: unknown[]): boolean => {
  for (let i = 0; i < childList.length; i += 1) {
    if (!(i in childList)) continue;
    const c = childList[i];
    if (!isValidChild(c)) continue;
    if (Text.isText(c as Node)) return true;
    if (Element.isElement(c as Node) && !Editor.isBlock(editor, c as Node)) {
      return true;
    }
  }
  return false;
};

const rebuildElement = (node: Node): Node => {
  let children = getChildList(node).filter(isValidChild) as Node[];
  if (
    children.length === 0 &&
    'type' in node &&
    (node as { type?: string }).type
  ) {
    children = [{ text: '' }];
  }
  const { children: _drop, ...rest } = node as Node & { children?: unknown };
  return { ...rest, children } as Node;
};

const runWithoutHistory = (editor: Editor, fn: () => void) => {
  if (HistoryEditor.isHistoryEditor(editor)) {
    HistoryEditor.withoutSaving(editor, fn);
  } else {
    fn();
  }
};

/**
 * Slate 的 `Node.nodes` / `Editor.normalize` 在遍历时假定非文本节点必有数组型 `children`。
 * 若仅有 `type` 而缺少 `children`，会在进入自定义 `normalizeNode` 之前就抛错，必须先修树。
 */
const rebuildOrDefaultBlock = (raw: unknown): Node => {
  if (
    raw &&
    typeof raw === 'object' &&
    !Text.isText(raw as Node) &&
    typeof (raw as { type?: unknown }).type === 'string'
  ) {
    return rebuildElement(raw as Node);
  }
  return createDefaultBlock();
};

/** 压缩根级子节点：去掉空洞与 null/undefined；残缺元素对象则 rebuild，不凭空多插空段落。 */
const compactEditorRootChildren = (raw: unknown[]): Node[] => {
  const out: Node[] = [];
  for (let i = 0; i < raw.length; i += 1) {
    if (!(i in raw)) {
      continue;
    }
    const c = raw[i];
    if (isValidChild(c)) {
      out.push(c);
      continue;
    }
    if (c === undefined || c === null) {
      continue;
    }
    out.push(rebuildOrDefaultBlock(c));
  }
  return out;
};

const repairBrokenChildArrays = (editor: Editor): boolean => {
  if (!Array.isArray(editor.children)) {
    /* eslint-disable no-param-reassign */
    editor.children = [createDefaultBlock()];
    /* eslint-enable no-param-reassign */
    return true;
  }

  if (editor.children.length === 0) {
    EditorUtils.replaceEditorContent(editor, [createDefaultBlock()]);
    return true;
  }

  if (childArrayHasInvalidEntries(editor.children)) {
    const fixedRoot = compactEditorRootChildren(editor.children);
    if (fixedRoot.length === 0) {
      EditorUtils.replaceEditorContent(editor, [createDefaultBlock()]);
    } else {
      /* eslint-disable no-param-reassign */
      editor.children = fixedRoot;
      /* eslint-enable no-param-reassign */
    }
    return true;
  }

  const fixBranch = (node: unknown): boolean => {
    if (!node || typeof node !== 'object') {
      return false;
    }
    if (Text.isText(node as Node)) {
      if ('children' in (node as object)) {
        delete (node as { children?: unknown }).children;
        return true;
      }
      return false;
    }
    const rawChildren = (node as { children?: unknown }).children;
    if (!Array.isArray(rawChildren)) {
      Object.assign(node as object, rebuildElement(node as Node));
      return true;
    }
    if (childArrayHasInvalidEntries(rawChildren)) {
      const fixedChildren = rawChildren.filter(isValidChild) as Node[];
      (node as { children: Node[] }).children =
        fixedChildren.length === 0 ? [{ text: '' }] : fixedChildren;
      return true;
    }
    for (let i = 0; i < rawChildren.length; i++) {
      if (fixBranch(rawChildren[i])) {
        return true;
      }
    }
    return false;
  };

  for (let i = 0; i < editor.children.length; i++) {
    if (fixBranch(editor.children[i])) {
      return true;
    }
  }
  return false;
};

/**
 * 外部或合并后的 value 可能在 `children` 中混入 `undefined` / `null`；
 * Slate 的 `Node.string` 会对每个子节点调用 `Text.isText`，遇 `undefined` 即抛错。
 * 在 normalize 最外层剔除非法子节点，避免编辑器与 toMarkdown 崩溃。
 */
export const withSanitizeInvalidChildren = (editor: Editor) => {
  const { normalizeNode, normalize } = editor;

  editor.normalize = (options?: Parameters<Editor['normalize']>[0]) => {
    // 与 Slate 默认 `normalize` 一致：在 `withoutNormalizing` 嵌套批次末尾仍会调用
    // `Editor.normalize`，此时 `isNormalizing` 为 false，文档可能短暂为空（合法中间态）。
    // 若在此处 `repairBrokenChildArrays` 强行插入默认块，会与后续 `insertNodes` 叠成双段落。
    if (Editor.isNormalizing(editor)) {
      let guard = 0;
      while (guard < 100 && repairBrokenChildArrays(editor)) {
        guard += 1;
      }
    }
    return normalize.call(editor, options);
  };

  editor.normalizeNode = (entry: NodeEntry) => {
    const [node, path] = entry;

    // Text leaves have no `children`; also strip invalid `children` on text (Slate may treat as element).
    if (Text.isText(node)) {
      if ('children' in (node as object)) {
        delete (node as { children?: unknown }).children;
      }
      normalizeNode(entry);
      return;
    }

    if (Editor.isEditor(node) && path.length === 0) {
      const childList = getChildList(node);
      const hasInvalid = childArrayHasInvalidEntries(childList);
      if (hasInvalid || childList.length === 0) {
        const fixedTop = compactEditorRootChildren(childList);
        const nextNodes =
          fixedTop.length === 0 ? [createDefaultBlock()] : fixedTop;
        const wrapped = ensureRootOnlyBlockChildren(editor, nextNodes);
        EditorUtils.replaceEditorContent(editor, wrapped);
        normalizeNode(entry);
        return;
      }
      if (rootHasNonBlockChild(editor, childList)) {
        const wrapped = ensureRootOnlyBlockChildren(
          editor,
          childList.filter(isValidChild) as Node[],
        );
        EditorUtils.replaceEditorContent(editor, wrapped);
        normalizeNode(entry);
        return;
      }
      normalizeNode(entry);
      return;
    }

    if (!Editor.isEditor(node) && !Text.isText(node)) {
      const rawChildren = (node as { children?: unknown }).children;
      if (!Array.isArray(rawChildren)) {
        Object.assign(node as object, rebuildElement(node as Node));
        normalizeNode(entry);
        return;
      }
    }

    if (Element.isElement(node)) {
      const childList = getChildList(node);
      const hasInvalid = childArrayHasInvalidEntries(childList);
      if (hasInvalid) {
        const applyRebuild = () => {
          Editor.withoutNormalizing(editor, () => {
            const rebuilt = rebuildElement(node);
            Transforms.removeNodes(editor, { at: path, voids: true });
            Transforms.insertNodes(editor, rebuilt, { at: path, voids: true });
          });
        };
        runWithoutHistory(editor, applyRebuild);
        return;
      }
    }

    normalizeNode(entry);
  };

  return editor;
};
