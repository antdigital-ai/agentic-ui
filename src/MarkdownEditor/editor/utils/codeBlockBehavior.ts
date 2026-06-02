import { Editor, Element, Node, Path, Transforms } from 'slate';
import type { CodeNode, ParagraphNode } from '../../el';

const CODE_BLOCK_PLACEHOLDER_CHILD = [{ text: '' }] as CodeNode['children'];

const EMPTY_PARAGRAPH: ParagraphNode = {
  type: 'paragraph',
  children: [{ text: '' }],
};

export const isCodeBlockElement = (
  node: Node | null | undefined,
): node is CodeNode =>
  !!node && Element.isElement(node) && node.type === 'code';

/**
 * 块级 code 唯一正文来源为 `value`；`children` 仅保留 void 占位。
 */
export const setCodeBlockNodes = (
  editor: Editor,
  path: Path,
  data: Partial<CodeNode>,
): void => {
  const payload: Partial<CodeNode> = { ...data };
  if ('value' in data) {
    payload.children = CODE_BLOCK_PLACEHOLDER_CHILD;
  }

  Editor.withoutNormalizing(editor, () => {
    Transforms.setNodes(editor, payload, { at: path });
  });
};

export const removeEmptyCodeBlock = (editor: Editor, path: Path): void => {
  Editor.withoutNormalizing(editor, () => {
    Transforms.removeNodes(editor, { at: path });
    Transforms.insertNodes(editor, EMPTY_PARAGRAPH, {
      at: path,
      select: true,
    });
    Transforms.select(editor, Editor.start(editor, path));
  });
};

export const insertParagraphAfterCodeBlock = (
  editor: Editor,
  path: Path,
): void => {
  Transforms.insertNodes(editor, EMPTY_PARAGRAPH, {
    at: Path.next(path),
    select: true,
  });
};

export type CodeBlockAceKeyDownResult = 'handled' | 'ignored';

/**
 * Ace 内键盘：空块 Backspace、Mod+Enter 跳出代码块；其余键由 Ace 处理。
 */
export const handleCodeBlockAceKeyDown = (
  editor: Editor,
  path: Path,
  event: KeyboardEvent,
  codeText: string,
): CodeBlockAceKeyDownResult => {
  if (event.key === 'Backspace' && codeText.trim() === '') {
    removeEmptyCodeBlock(editor, path);
    event.preventDefault();
    event.stopPropagation();
    return 'handled';
  }

  const isModEnter =
    event.key === 'Enter' && (event.metaKey || event.ctrlKey) && !event.shiftKey;
  if (isModEnter) {
    insertParagraphAfterCodeBlock(editor, path);
    event.preventDefault();
    event.stopPropagation();
    return 'handled';
  }

  return 'ignored';
};

/** 焦点在 Ace 输入区时，外层 Slate onKeyDown 应让路。 */
export const isCodeBlockAceInputTarget = (target: EventTarget | null): boolean => {
  if (!(target instanceof HTMLElement)) {
    return false;
  }
  return !!target.closest(
    '[data-be="code"] textarea, [data-be="code"] .ace_text-input',
  );
};
