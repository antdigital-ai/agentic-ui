import { Editor, Element, Node, Path, Range, Transforms } from 'slate';
import {
  ComposerChipData,
  ComposerSlashChip,
  createLongTextChipNode,
  isSlashChipUnconfigured,
  readComposerChipData,
  shouldCollapsePastedText,
} from '../elements/ComposerChip/types';

export { ComposerChipData, shouldCollapsePastedText };

/**
 * withComposerChips — 内联原子 chip 编辑器插件。
 *
 * 职责：
 * 1. 注册 `composer-chip` 为 inline + void 元素。
 * 2. 删除行为：光标紧贴 chip 前/后按 Backspace 删除整个 chip（对齐 IDE atom 节点整体删除）。
 * 3. 插入后空格分隔：chip 后无文本时，Backspace 不合并；insertText 在 chip 后追加普通文本 leaf。
 * 4. 长文本粘贴折叠：超过阈值的纯文本粘贴折叠为 long-text chip（对齐 IDE pastedLongText）。
 * 5. 发送前 gate 辅助：遍历文档找未配置 slash chip。
 */
export const withComposerChips = (editor: Editor) => {
  const { isInline, isVoid, insertText, deleteBackward, insertBreak } = editor;

  editor.isInline = (element) => {
    if ((element as any).type === 'composer-chip') return true;
    return isInline(element);
  };

  editor.isVoid = (element) => {
    if ((element as any).type === 'composer-chip') return true;
    return isVoid(element);
  };

  /** chip 后插入文本：插到 chip 所在段落末尾的普通文本位置，避免 Slate 报 void 内插入 */
  editor.insertText = (text) => {
    const { selection } = editor;
    if (selection && Range.isCollapsed(selection)) {
      // 光标落在 void chip 占位 leaf 上时，把文本插到 chip 之后
      try {
        const entry = Editor.above(editor, {
          at: selection,
          match: (n) =>
            Element.isElement(n) && (n as any).type === 'composer-chip',
        });
        if (entry) {
          const [, chipPath] = entry;
          const nextPath = Path.next(chipPath);
          Transforms.insertNodes(editor, [{ text }], {
            at: nextPath,
            select: true,
          });
          return;
        }
      } catch {
        // 路径失效走默认行为
      }
    }
    insertText(text);
  };

  /** Backspace 整体删除 chip（对齐 IDE atom 节点选择后删除） */
  editor.deleteBackward = (unit) => {
    const { selection } = editor;
    if (selection && Range.isCollapsed(selection)) {
      const { anchor } = selection;
      try {
        // 情况 1：光标在普通文本开头，前一个是 chip → 删 chip
        const prev = Editor.previous(editor, {
          at: anchor.path,
          match: (n) =>
            Element.isElement(n) && (n as any).type === 'composer-chip',
        });
        if (prev && anchor.offset === 0) {
          const [, prevPath] = prev;
          Editor.withoutNormalizing(editor, () => {
            Transforms.removeNodes(editor, { at: prevPath });
          });
          return;
        }

        // 情况 2：光标在 chip 自身的占位 leaf 上（点击选中后）→ 删整个 chip
        const entry = Editor.above(editor, {
          at: anchor.path,
          match: (n) =>
            Element.isElement(n) && (n as any).type === 'composer-chip',
        });
        if (entry) {
          const [, chipPath] = entry;
          Editor.withoutNormalizing(editor, () => {
            Transforms.removeNodes(editor, { at: chipPath });
          });
          return;
        }
      } catch {
        // 路径失效走默认行为
      }
    }
    deleteBackward(unit);
  };

  /** chip 内禁用 Enter 分段 */
  editor.insertBreak = () => {
    const { selection } = editor;
    if (selection) {
      const entry = Editor.above(editor, {
        match: (n) =>
          Element.isElement(n) && (n as any).type === 'composer-chip',
      });
      if (entry) {
        // chip 内按 Enter：移到 chip 后并换行
        const [, chipPath] = entry;
        const nextPath = Path.next(chipPath);
        if (!Editor.hasPath(editor, nextPath)) {
          Transforms.insertNodes(
            editor,
            { text: '' },
            { at: nextPath, select: true },
          );
        } else {
          Transforms.select(editor, Editor.start(editor, nextPath));
        }
        insertBreak();
        return;
      }
    }
    insertBreak();
  };

  return editor;
};

/** 在当前选区插入 chip 节点并确保尾部空格分隔（对齐 insertComposerSlashAtom） */
export const insertComposerChip = (
  editor: Editor,
  data: ComposerChipData,
  options?: {
    at?: any;
    ensureTrailingSpace?: boolean;
    /** 渲染层附加上下文（如 slash chip 的 placeholderText） */
    contextProps?: Record<string, any>;
  },
) => {
  const ensureTrailingSpace = options?.ensureTrailingSpace !== false;
  const target = options?.at ?? editor.selection;

  if (target) {
    Editor.withoutNormalizing(editor, () => {
      if (!Range.isCollapsed(target as Range)) {
        Transforms.delete(editor, { at: target as Range });
      }
      const at = Range.start(target as Range);
      // chip 与分隔空格作为兄弟节点数组一次插入，保证空格紧跟 chip
      const nodes: any[] = [
        {
          type: 'composer-chip',
          chip: data,
          ...(options?.contextProps
            ? { contextProps: options.contextProps }
            : {}),
          children: [{ text: '' }],
        },
      ];
      if (ensureTrailingSpace) {
        nodes.push({ text: ' ' });
      }
      Transforms.insertNodes(editor, nodes, { at });
    });
    return true;
  }
  return false;
};

/**
 * 粘贴长文本折叠：粘贴纯文本超过阈值时折叠为 long-text chip。
 * 返回 true 表示已处理（调用方不再走默认插入）。
 */
export const handleLongTextPasteFold = (
  editor: Editor,
  text: string,
): boolean => {
  if (!shouldCollapsePastedText(text)) return false;

  const normalized = text.replace(/\r\n?/g, '\n');
  const node = createLongTextChipNode(normalized);
  const target = editor.selection;
  if (!target) return false;

  Editor.withoutNormalizing(editor, () => {
    if (!Range.isCollapsed(target)) {
      Transforms.delete(editor, { at: target });
    }
    const at = Range.start(target);
    // chip 与分隔空格一起插入（与 insertComposerChip 一致）
    Transforms.insertNodes(editor, [node, { text: ' ' }], { at });
  });
  return true;
};

/**
 * 发送前 gate 检查：返回文档中所有「未配置」的 slash chip。
 * 对齐 IDE guiSlashSendGate：未配置的结构化技能命令应阻止发送并提示配置。
 */
export const findUnconfiguredSlashChips = (
  nodes: Node[],
): ComposerSlashChip[] => {
  const result: ComposerSlashChip[] = [];
  const walk = (list: Node[]) => {
    for (const node of list) {
      if ((node as any).type === 'composer-chip') {
        const chip = readComposerChipData((node as any).chip);
        if (chip && chip.kind === 'slash' && isSlashChipUnconfigured(chip)) {
          result.push(chip);
        }
      }
      if (node.children) {
        walk(node.children as Node[]);
      }
    }
  };
  walk(nodes);
  return result;
};
