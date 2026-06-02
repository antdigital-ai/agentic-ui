import { Editor, Node, Operation, Path, Range, Transforms } from 'slate';
import { clearCardAreaText, hasRange, isCardEmpty } from './utils';

/** 删 card 后若文档为空，补一个空段落，避免后续 selection 拿到无效 path */
const ensureNonEmptyEditor = (editor: Editor) => {
  if (!editor.children || editor.children.length === 0) {
    Transforms.insertNodes(
      editor,
      { type: 'paragraph', children: [{ text: '' }] } as any,
      { at: [0], select: true },
    );
  }
};

/** 安全取 parent path：长度不足时返回 null */
const safeParentPath = (path: Path): Path | null => {
  if (!path || path.length === 0) return null;
  return Path.parent(path);
};

/** 安全取节点：路径不存在或异常时返回 null */
const safeGetNode = (editor: Editor, path: Path | null): any => {
  if (!path) return null;
  if (!Editor.hasPath(editor, path)) return null;
  try {
    return Node.get(editor, path);
  } catch {
    return null;
  }
};

/**
 * 若给定 path 是 card-after 的内部 text 节点路径（[card, 2, 0]），
 * 返回它所属的 card 的 path 与节点；否则返回 null。
 */
const findCardForCardAfterInner = (
  editor: Editor,
  innerPath: Path,
): { cardPath: Path; cardAfterPath: Path } | null => {
  const cardAfterPath = safeParentPath(innerPath);
  if (!cardAfterPath) return null;
  const cardPath = safeParentPath(cardAfterPath);
  if (!cardPath) return null;
  const cardNode = safeGetNode(editor, cardPath);
  if (!cardNode || cardNode.type !== 'card') return null;
  return { cardPath, cardAfterPath };
};

/**
 * 在 card-after 内的文本输入：把文字挪到 card 之后的新段落里，
 * card 本体保持原样，card-after 占位字符还原为零宽。
 */
const redirectCardAfterText = (
  editor: Editor,
  innerPath: Path,
  text: string,
): boolean => {
  const ctx = findCardForCardAfterInner(editor, innerPath);
  if (!ctx) return false;

  Editor.withoutNormalizing(editor, () => {
    const afterCardPath = Path.next(ctx.cardPath);
    Transforms.insertNodes(
      editor,
      { type: 'paragraph', children: [{ text }] } as any,
      { at: afterCardPath },
    );
    const newTextPath = [...afterCardPath, 0];
    Transforms.select(editor, {
      anchor: { path: newTextPath, offset: text.length },
      focus: { path: newTextPath, offset: text.length },
    });
    clearCardAreaText(editor, ctx.cardAfterPath);
  });
  return true;
};

/**
 * 在 card-after 内的片段插入：把整个 fragment 挪到 card 之后，
 * card 本体保持原样，card-after 占位字符还原为零宽。
 */
const redirectCardAfterFragment = (
  editor: Editor,
  innerPath: Path,
  fragment: any,
): boolean => {
  const ctx = findCardForCardAfterInner(editor, innerPath);
  if (!ctx) return false;

  Editor.withoutNormalizing(editor, () => {
    Transforms.insertNodes(editor, fragment, {
      at: Path.next(ctx.cardPath),
      select: true,
    });
    // 与 insertText 对称：清掉 card-after 内可能残留的非零宽文本
    clearCardAreaText(editor, ctx.cardAfterPath);
  });
  return true;
};

/**
 * 在 card-after 内的节点插入：把节点挪到 card 之后。
 */
const redirectCardAfterNode = (
  editor: Editor,
  innerPath: Path,
  node: any,
): boolean => {
  const ctx = findCardForCardAfterInner(editor, innerPath);
  if (!ctx) return false;

  Transforms.insertNodes(editor, node, {
    at: Path.next(ctx.cardPath),
  });
  return true;
};

/**
 * 处理卡片相关节点的操作
 *
 * @param editor - Slate编辑器实例
 * @param operation - 要处理的操作
 * @param apply - 原始的apply函数
 * @returns 如果操作被处理则返回true，否则返回false
 *
 * @description
 * 处理以下卡片相关操作:
 * - 删除卡片节点 (remove_node)，包括card、card-before和card-after
 * - 在卡片内插入节点 (insert_node)：card-before 阻止；card-after 重定向到卡后
 * - 检查并删除空卡片
 *
 * 备注：用户键盘输入走 editor.insertText / editor.insertFragment 入口，
 * 已经在那里拦截并跑了 redirect 逻辑，不会再走到 apply 这里的 insert_text。
 * 仅当外部代码直接 `editor.apply({ type: 'insert_text', ... })` 时才会触发
 * apply 层的 card-before 阻止分支（card-after 重定向已不必要，简化掉）。
 */
const handleCardOperation = (
  editor: Editor,
  operation: Operation,
  apply: (op: Operation) => void,
): boolean => {
  if (operation.type === 'remove_node') {
    const { node } = operation;

    // 删除card时，直接删除整个卡片，并保证文档非空
    if (node.type === 'card') {
      apply(operation);
      ensureNonEmptyEditor(editor);
      return true;
    }

    // 删除 card-after：定位到父 card，直接 emit 一个 card 的 remove_node，
    // 绕过 Transforms.removeNodes(parent) 的二次链路，避免嵌套触发
    if (node.type === 'card-after') {
      const cardPath = safeParentPath(operation.path);
      const cardNode = safeGetNode(editor, cardPath);
      if (cardPath && cardNode && cardNode.type === 'card') {
        apply({
          type: 'remove_node',
          path: cardPath,
          node: cardNode,
        });
        ensureNonEmptyEditor(editor);
        return true;
      }
      // 不在 card 内（schema 异常）→ 让原 apply 兜底
      apply(operation);
      return true;
    }

    // 删除 card-before：和 card-after 同等处理，整张卡片一起删，
    // 避免留下 [content, card-after] 这种残缺结构
    if (node.type === 'card-before') {
      const cardPath = safeParentPath(operation.path);
      const cardNode = safeGetNode(editor, cardPath);
      if (cardPath && cardNode && cardNode.type === 'card') {
        apply({
          type: 'remove_node',
          path: cardPath,
          node: cardNode,
        });
        ensureNonEmptyEditor(editor);
        return true;
      }
      apply(operation);
      return true;
    }

    // 检查操作后的父级是否为空卡片，如果是则删除
    const parentPath = safeParentPath(operation.path);
    if (parentPath) {
      const parentNode = safeGetNode(editor, parentPath);
      if (parentNode && parentNode.type === 'card' && isCardEmpty(parentNode)) {
        Transforms.removeNodes(editor, { at: parentPath });
        ensureNonEmptyEditor(editor);
        return true;
      }
    }
  }

  if (operation.type === 'insert_text') {
    // editor.insertText 已处理用户键入路径下的 card-after 重定向；
    // 此处仅作为防御层：直接 editor.apply({ type: 'insert_text', ... }) 进入
    // card-before / card-after 时一律阻止，避免占位 span 被写入字符。
    const parentPath = safeParentPath(operation.path);
    const parentNode = safeGetNode(editor, parentPath);
    if (
      parentNode?.type === 'card-before' ||
      parentNode?.type === 'card-after'
    ) {
      return true;
    }
  }

  if (operation.type === 'insert_node') {
    const parentPath = safeParentPath(operation.path);
    const parentNode = safeGetNode(editor, parentPath);

    // card-before 不允许任何节点插入
    if (parentNode?.type === 'card-before') {
      return true;
    }

    // card-after 的节点插入会放到卡片后面
    if (parentNode?.type === 'card-after') {
      if (redirectCardAfterNode(editor, operation.path, operation.node)) {
        return true;
      }
      // 不在 card 内（异常 schema）→ 退回到 parent 路径插入
      if (parentPath) {
        Transforms.insertNodes(editor, operation.node, { at: parentPath });
        return true;
      }
    }
  }

  return false;
};

/**
 * 扩展编辑器以处理卡片节点的操作和行为
 *
 * @param editor - 要扩展的Slate编辑器实例
 * @returns 增强后的编辑器实例，能够处理卡片相关操作
 *
 * @description
 * 该插件重写编辑器的 `apply`、`insertText`、`insertFragment` 和 `deleteBackward` 方法，
 * 添加对卡片节点的特殊处理逻辑，包括：
 * - 卡片节点的删除、插入和文本操作
 * - 卡片空检查逻辑
 * - 卡片区域的文本和片段插入处理
 */
export const withCardPlugin = (editor: Editor) => {
  const { apply, insertText, insertFragment, deleteBackward } = editor;

  editor.apply = (operation: Operation) => {
    // 尝试处理卡片相关操作
    if (handleCardOperation(editor, operation, apply)) {
      return;
    }

    // 记录操作前可能涉及的卡片路径，用于操作后检查
    let cardPathsToCheck: Path[] = [];

    if (operation.type === 'remove_text' || operation.type === 'insert_text') {
      if (operation.path && operation.path.length > 0) {
        try {
          // 向上查找是否在卡片内
          let currentPath = operation.path;
          while (currentPath.length > 0) {
            const node = Node.get(editor, currentPath);
            if (node && node.type === 'card') {
              cardPathsToCheck.push(currentPath);
              break;
            }
            currentPath = Path.parent(currentPath);
          }
        } catch (error) {
          // 如果无法获取节点，忽略错误
        }
      }
    }

    // 执行原始操作
    apply(operation);

    // 操作执行后，检查涉及的卡片是否变空
    for (const cardPath of cardPathsToCheck) {
      const cardNode = safeGetNode(editor, cardPath);
      if (cardNode && cardNode.type === 'card' && isCardEmpty(cardNode)) {
        Transforms.removeNodes(editor, { at: cardPath });
        ensureNonEmptyEditor(editor);
      }
    }
  };

  editor.insertText = (text: string) => {
    const { selection } = editor;
    if (selection && Range.isCollapsed(selection)) {
      const parentPath = safeParentPath(selection.anchor.path);
      const parentNode = safeGetNode(editor, parentPath);

      // card-before 不允许任何文本输入
      if (parentNode?.type === 'card-before') {
        return;
      }

      // card-after 的输入会插入到卡片后面的新段落中
      if (parentNode?.type === 'card-after') {
        if (redirectCardAfterText(editor, selection.anchor.path, text)) {
          return;
        }
        // 不在标准 card 结构内 → 走默认 insertText
      }
    }

    insertText(text);
  };

  editor.insertFragment = (fragment: any) => {
    const { selection } = editor;
    if (selection && Range.isCollapsed(selection)) {
      const parentPath = safeParentPath(selection.anchor.path);
      const parentNode = safeGetNode(editor, parentPath);

      // card-before 不允许任何片段插入
      if (parentNode?.type === 'card-before') {
        return;
      }

      // card-after 的片段插入会放到卡片后面
      if (parentNode?.type === 'card-after') {
        if (redirectCardAfterFragment(editor, selection.anchor.path, fragment)) {
          return;
        }
        // 不在标准 card 结构内 → 走默认 insertFragment
      }
    }

    insertFragment(fragment);
  };

  editor.deleteBackward = (unit: any) => {
    const { selection } = editor;

    if (
      selection &&
      hasRange(editor, selection) &&
      Range.isCollapsed(selection)
    ) {
      const parentPath = safeParentPath(selection.anchor.path);
      const parentNode = safeGetNode(editor, parentPath);

      // 在 card-before 内 Backspace 静默忽略（前面没有任何可删内容）
      if (parentNode?.type === 'card-before') {
        return;
      }
      // 在 card-after 内 Backspace 改为两阶段：
      //   第一次：把光标挪到 card 内容尾部，给用户一个"将要删除什么"的反馈机会
      //   第二次：用户在 content 内继续 Backspace，按正常文字/void 删除路径走
      // content 全删空后会触发自动空卡片清理，整张 card 才消失
      if (parentNode?.type === 'card-after') {
        const cardAfterPath = parentPath!;
        const cardPath = safeParentPath(cardAfterPath);
        const cardNode = safeGetNode(editor, cardPath);
        if (
          cardPath &&
          cardNode?.type === 'card' &&
          Array.isArray(cardNode.children) &&
          cardNode.children.length >= 2
        ) {
          // content 节点 = card-after 之前的兄弟
          const contentIndex = cardAfterPath[cardAfterPath.length - 1] - 1;
          if (contentIndex >= 0) {
            const contentPath = [...cardPath, contentIndex];
            if (Editor.hasPath(editor, contentPath)) {
              Transforms.select(editor, Editor.end(editor, contentPath));
              return;
            }
          }
          // 没有 content 节点，直接删整张卡片
          Transforms.removeNodes(editor, { at: cardPath });
          ensureNonEmptyEditor(editor);
          return;
        }
      }
    }
    deleteBackward(unit);
  };

  return editor;
};
