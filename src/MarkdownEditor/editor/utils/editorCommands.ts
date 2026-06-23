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
import { NativeTableEditor } from '../../utils/native-table';
import { EditorUtils } from './editorUtils';

export { createList, type ListToolbarMode } from '../plugins/lists';

/**
 * 获取当前编辑器中的最低层级元素节点
 */
export function getCurrentNodes(editor: Editor) {
  return Editor.nodes<any>(editor, {
    mode: 'lowest',
    match: (m) => {
      return Element.isElement(m);
    },
  });
}

/** 光标所在段落/标题；避免 getCurrentNodes 取到 list-item 等子块导致插入路径错误 */
function resolveParagraphOrHead(
  editor: Editor,
  preferred?: [any, Path],
): [any, Path] | undefined {
  if (
    preferred?.[0] &&
    ['paragraph', 'head'].includes((preferred[0] as any).type)
  ) {
    return preferred;
  }
  const { selection } = editor;
  if (selection) {
    const above = Editor.above(editor, {
      at: selection.anchor,
      match: (n) =>
        Element.isElement(n) && ['paragraph', 'head'].includes((n as any).type),
    });
    if (above) {
      return above as [any, Path];
    }
  }
  const nodesResult = Editor.nodes(editor, {
    at: [],
    match: (n) =>
      Element.isElement(n) && ['paragraph', 'head'].includes((n as any).type),
    mode: 'lowest',
  }) as Iterable<[any, Path]> | Iterator<[any, Path]>;

  if (Array.isArray(nodesResult) && nodesResult.length > 0) {
    const entry = nodesResult[0] as [any, Path];
    if (entry?.[0] && ['paragraph', 'head'].includes((entry[0] as any).type)) {
      return entry;
    }
    return undefined;
  }

  const iter = nodesResult as Iterator<[any, Path]>;
  if (iter && typeof iter.next === 'function') {
    const first = iter.next();
    return first.done ? undefined : (first.value as [any, Path]);
  }
  return undefined;
}

function firstLowestElement(editor: Editor): [any, Path] | undefined {
  const nodesResult = Editor.nodes(editor, {
    at: [],
    match: (n) => Element.isElement(n),
    mode: 'lowest',
  }) as Iterable<[any, Path]> | Iterator<[any, Path]>;

  if (Array.isArray(nodesResult) && nodesResult.length > 0) {
    return nodesResult[0] as [any, Path];
  }
  const iter = nodesResult as Iterator<[any, Path]>;
  if (iter && typeof iter.next === 'function') {
    const first = iter.next();
    return first.done ? undefined : (first.value as [any, Path]);
  }
  return undefined;
}

/**
 * 插入表格
 *
 * 在当前位置插入一个3x3的表格（包含表头行）。
 * 根据当前节点类型（段落、标题或列单元格）
 * 决定在何处插入表格及如何处理现有内容。
 *
 * @param editor Slate 编辑器实例
 * @param node 可选的节点，如果不提供则从编辑器获取
 */
export function insertTable(editor: Editor, node?: [any, Path]) {
  if (node?.[0]?.type === 'column-cell') {
    NativeTableEditor.insertTable(editor, {
      rows: 3,
      cols: 3,
      at: [...node[1], 0],
    });
    return;
  }

  if (
    node !== undefined &&
    !['paragraph', 'head'].includes(node[0]?.type as string)
  ) {
    return;
  }

  const currentNode =
    node === undefined
      ? (resolveParagraphOrHead(editor) ?? firstLowestElement(editor))
      : resolveParagraphOrHead(editor, node);
  if (currentNode && ['paragraph', 'head'].includes(currentNode?.[0]?.type)) {
    const path =
      currentNode?.[0]?.type === 'paragraph' && !Node.string(currentNode[0])
        ? currentNode[1]
        : Path.next(currentNode[1]);

    // 使用原生表格编辑器插入表格
    NativeTableEditor.insertTable(editor, {
      rows: 3,
      cols: 3,
      at: path,
    });

    if (
      currentNode?.[0]?.type === 'paragraph' &&
      !Node.string(currentNode[0])
    ) {
      Transforms.delete(editor, { at: Path.next(path) });
    }
    Transforms.select(editor, Editor.start(editor, path));
  }
}

/**
 * 插入代码块
 *
 * 在当前位置插入代码块，并根据传入的类型设置语言和渲染模式。
 * 支持在列单元格内或普通段落/标题后插入代码块。
 *
 * @param editor Slate 编辑器实例
 * @param type 可选的代码块类型，'mermaid'表示流程图，'html'表示HTML渲染
 * @param node 可选的节点，如果不提供则从编辑器获取
 */
export function insertCodeBlock(
  editor: Editor,
  type?: 'mermaid' | 'html',
  node?: [any, Path],
) {
  if (
    node !== undefined &&
    !['paragraph', 'head'].includes(node[0]?.type as string)
  ) {
    return;
  }

  const currentNode =
    node === undefined
      ? (resolveParagraphOrHead(editor) ?? firstLowestElement(editor))
      : resolveParagraphOrHead(editor, node);
  if (
    currentNode &&
    currentNode[0] &&
    ['paragraph', 'head'].includes(currentNode[0].type)
  ) {
    const path =
      currentNode[0].type === 'paragraph' && !Node.string(currentNode[0])
        ? currentNode[1]
        : Path.next(currentNode[1]);
    let lang = '';
    if (type === 'mermaid') {
      lang = 'mermaid';
    }

    Transforms.insertNodes(
      editor,
      {
        type: 'code',
        language: lang ? lang : undefined,
        children: [
          {
            text: `flowchart TD\n    Start --> Stop`,
          },
        ],
        render: type === 'html' ? true : undefined,
      },
      { at: path },
    );

    Transforms.select(editor, Editor.end(editor, path));
  }
}

/**
 * 插入或移除引用块
 *
 * 如果当前节点已在引用块中，则移除引用块；
 * 否则，将当前节点转换为引用块。
 * 如果当前节点是标题，先将其转换为普通段落。
 *
 * @param editor Slate 编辑器实例
 * @param node 可选的节点，如果不提供则从编辑器获取
 */
export function toggleQuote(editor: Editor, node?: [any, Path]) {
  const currentNode = node || Array.from(getCurrentNodes(editor))[0];
  if (!currentNode || !['paragraph', 'head'].includes(currentNode?.[0]?.type))
    return;
  if (Node.parent(editor, currentNode[1]).type === 'blockquote') {
    Transforms.unwrapNodes(editor, { at: Path.parent(currentNode[1]) });
    return;
  }
  if (currentNode?.[0]?.type === 'head') {
    Transforms.setNodes(
      editor,
      {
        type: 'paragraph',
      },
      { at: currentNode[1] },
    );
  }
  Transforms.wrapNodes(editor, {
    type: 'blockquote',
    children: [],
  });
}

/**
 * 插入水平分割线
 *
 * 在当前位置插入水平分割线，并将光标定位到分割线后的位置。
 * 如果分割线后没有内容，则自动插入一个空段落并将光标定位到该段落。
 *
 * @param editor Slate 编辑器实例
 * @param node 可选的节点，如果不提供则从编辑器获取
 */
export function insertHorizontalLine(editor: Editor, node?: [any, Path]) {
  const currentNode = node || Array.from(getCurrentNodes(editor))[0];
  if (currentNode && ['paragraph', 'head'].includes(currentNode?.[0]?.type)) {
    const path =
      currentNode?.[0]?.type === 'paragraph' && !Node.string(currentNode[0])
        ? currentNode[1]
        : Path.next(currentNode[1]);
    Transforms.insertNodes(
      editor,
      {
        type: 'hr',
        children: [{ text: '' }],
      },
      { at: path },
    );
    if (Editor.hasPath(editor, Path.next(path))) {
      Transforms.select(editor, Editor.start(editor, Path.next(path)));
    } else {
      Transforms.insertNodes(
        editor,
        {
          type: 'paragraph',
          children: [{ text: '' }],
        },
        { at: Path.next(path), select: true },
      );
    }
  }
}

/**
 * 将标题转换为普通段落
 *
 * 如果当前节点是标题类型，将其转换为普通段落
 *
 * @param editor Slate 编辑器实例
 */
function convertToParagraph(editor: Editor) {
  const [node] = getCurrentNodes(editor);
  if (node && ['head'].includes(node?.[0]?.type)) {
    Transforms.setNodes(editor, { type: 'paragraph' }, { at: node[1] });
  }
}

/**
 * 查找选区内的块级节点
 *
 * @param editor - 编辑器实例
 * @param selection - 当前选区
 * @returns 找到的块级节点数组，每个元素包含 [node, path]
 */
function findBlockNodesInSelection(
  editor: Editor,
  selection: Range | null,
): Array<[Element, Path]> {
  if (!selection) {
    return [];
  }

  const blockNodes = Array.from(
    Editor.nodes(editor, {
      at: selection,
      match: (n) =>
        Element.isElement(n) &&
        !Editor.isInline(editor, n) &&
        ['paragraph', 'head'].includes(n.type),
    }),
  ) as Array<[Element, Path]>;

  return blockNodes;
}

/**
 * 处理选区并设置标题格式
 *
 * @param editor - 编辑器实例
 * @param selection - 选区范围
 * @param level - 标题级别（1-3）
 */
function processSelectionForHeading(
  editor: Editor,
  selection: Range,
  level: number,
) {
  const [selStart, selEnd] = Range.edges(selection);

  // 找到所有涉及选中文本的段落/标题节点
  const blockNodes = findBlockNodesInSelection(editor, selection);

  if (blockNodes.length === 0) {
    return;
  }

  // 使用 withoutNormalizing 确保原子性操作
  Editor.withoutNormalizing(editor, () => {
    // 按路径倒序处理，从后往前，避免路径变化影响
    const sortedNodes = [...blockNodes].sort((a, b) =>
      Path.compare(b[1], a[1]),
    );

    for (const [, path] of sortedNodes) {
      if (!Editor.hasPath(editor, path)) {
        continue;
      }

      const nodeStart = Editor.start(editor, path);
      const nodeEnd = Editor.end(editor, path);

      // 计算节点内的实际选区范围
      const actualStart = Point.isBefore(selStart, nodeStart)
        ? nodeStart
        : Point.isAfter(selStart, nodeEnd)
          ? nodeEnd
          : selStart;
      const actualEnd = Point.isAfter(selEnd, nodeEnd)
        ? nodeEnd
        : Point.isBefore(selEnd, nodeStart)
          ? nodeStart
          : selEnd;

      // 检查是否选中了整个节点
      const isWholeNodeSelected =
        (Point.isBefore(selStart, nodeStart) ||
          Point.equals(selStart, nodeStart)) &&
        (Point.isAfter(selEnd, nodeEnd) || Point.equals(selEnd, nodeEnd));

      if (isWholeNodeSelected) {
        // 直接转换整个节点
        Transforms.setNodes(editor, { type: 'head', level }, { at: path });
        continue;
      }

      // 如果选区不在节点内，跳过
      if (
        Point.isAfter(actualStart, actualEnd) ||
        Point.equals(actualStart, actualEnd) ||
        Point.isBefore(actualStart, nodeStart) ||
        Point.isAfter(actualEnd, nodeEnd)
      ) {
        continue;
      }

      // 情况1: 选中了整个节点（从开始到结束）
      if (
        Point.equals(actualStart, nodeStart) &&
        Point.equals(actualEnd, nodeEnd)
      ) {
        Transforms.setNodes(editor, { type: 'head', level }, { at: path });
        continue;
      }

      // 情况2: 只选中了节点的一部分，需要拆分
      const isAtStart = Point.equals(actualStart, nodeStart);
      const isAtEnd = Point.equals(actualEnd, nodeEnd);

      if (isAtStart && isAtEnd) {
        // 这种情况已经在情况1处理了，不会到这里
        continue;
      }

      // 获取原节点的属性
      const originalNode = Node.get(editor, path);
      if (!Element.isElement(originalNode)) {
        continue;
      }

      if (isAtStart) {
        // 选中在开始位置：拆分成两个节点（选中部分 + 剩余部分）
        // 在 actualEnd 位置拆分节点
        Transforms.splitNodes(editor, {
          at: actualEnd,
        });

        // 拆分后，原节点包含选中部分，新节点包含剩余部分
        // 将原节点（选中部分）转换为标题
        Transforms.setNodes(editor, { type: 'head', level }, { at: path });
      } else if (isAtEnd) {
        // 选中在结束位置：拆分成两个节点（前面部分 + 选中部分）
        // 在 actualStart 位置拆分节点
        Transforms.splitNodes(editor, {
          at: actualStart,
        });

        // 拆分后，原节点包含前面部分，新节点包含选中部分
        // 将新节点（选中部分）转换为标题
        const nextPath = Path.next(path);
        if (Editor.hasPath(editor, nextPath)) {
          Transforms.setNodes(
            editor,
            { type: 'head', level },
            { at: nextPath },
          );
        }
      } else {
        // 选中在中间位置：拆分成三个节点（前面部分 + 选中部分 + 后面部分）
        // 计算选中部分的长度（字符偏移量）
        const selectionOffset = actualEnd.offset - actualStart.offset;

        // 第一步：在 actualStart 位置拆分节点
        Transforms.splitNodes(editor, {
          at: actualStart,
        });

        // 拆分后，原节点包含前面部分，新节点包含选中部分和后面部分
        // 新节点的路径是 Path.next(path)
        const middlePath = Path.next(path);
        if (!Editor.hasPath(editor, middlePath)) {
          continue;
        }

        // 第二步：在新节点内计算拆分点
        // 使用偏移量来计算：在新节点开始位置 + 选中部分的长度
        // 需要找到对应的文本节点和偏移量
        let splitPoint: Point | null = null;

        // 遍历新节点内的文本节点，计算正确的拆分点
        const textNodes = Array.from(
          Editor.nodes(editor, {
            at: middlePath,
            match: (n) => Text.isText(n),
          }),
        );

        let currentOffset = 0;
        for (const [textNode, textPath] of textNodes) {
          if (!Text.isText(textNode)) {
            continue;
          }

          const text = textNode.text;
          if (typeof text !== 'string') {
            continue;
          }

          const textLength = text.length;
          const nextOffset = currentOffset + textLength;

          // 如果选中结束位置在这个文本节点内
          if (selectionOffset <= nextOffset) {
            const offsetInText = selectionOffset - currentOffset;
            splitPoint = {
              path: textPath,
              offset: offsetInText,
            };
            break;
          }

          currentOffset = nextOffset;
        }

        // 如果找不到拆分点，使用新节点的结束位置
        if (!splitPoint) {
          const middleNodeEnd = Editor.end(editor, middlePath);
          splitPoint = middleNodeEnd;
        }

        // 在新节点内的 splitPoint 位置拆分
        Transforms.splitNodes(editor, {
          at: splitPoint,
        });

        // 拆分后，middlePath 包含选中部分，下一个节点包含后面部分
        // 将 middlePath（选中部分）转换为标题
        Transforms.setNodes(
          editor,
          { type: 'head', level },
          { at: middlePath },
        );
      }
    }
  });
}

/**
 * 设置标题级别
 *
 * 将当前段落或标题节点转换为指定级别的标题。
 * 如果级别为4，则转换为普通段落。
 * 如果存在选中文本，则只将选中的部分转换为标题，并拆分段落。
 *
 * @param editor Slate 编辑器实例
 * @param level 标题级别（1-3）或4（表示普通段落）
 */
export function setHeading(editor: Editor, level: number) {
  const selection = editor.selection;

  // 如果级别为4，转换为段落
  if (level === 4) {
    convertToParagraph(editor);
    return;
  }

  // 如果有非折叠的选区，处理选中文本
  if (selection && !Range.isCollapsed(selection)) {
    processSelectionForHeading(editor, selection, level);
    return;
  }

  // 如果没有选区，保持原有行为：转换整个节点
  const [node] = getCurrentNodes(editor);
  if (
    node &&
    ['paragraph', 'head'].includes(node?.[0]?.type) &&
    EditorUtils.isTop(editor, node[1])
  ) {
    Transforms.setNodes(editor, { type: 'head', level }, { at: node[1] });
  }
}

export { convertToParagraph };

/**
 * 增加标题级别（使标题变小）
 *
 * 将段落转换为4级标题，
 * 或将标题级别从1级改为普通段落，
 * 或将其他级别标题升级一级（数字变小）
 *
 * @param editor Slate 编辑器实例
 */
export function increaseHeadingLevel(editor: Editor) {
  const [node] = getCurrentNodes(editor);
  if (
    node &&
    ['paragraph', 'head'].includes(node?.[0]?.type) &&
    EditorUtils.isTop(editor, node[1])
  ) {
    if (node?.[0]?.type === 'paragraph') {
      Transforms.setNodes(editor, { type: 'head', level: 4 }, { at: node[1] });
    } else if (node[0].level === 1) {
      Transforms.setNodes(editor, { type: 'paragraph' }, { at: node[1] });
    } else {
      Transforms.setNodes(
        editor,
        { level: node[0].level - 1 },
        { at: node[1] },
      );
    }
  }
}

/**
 * 降低标题级别（使标题变大）
 *
 * 将段落转换为1级标题，
 * 或将4级标题改为普通段落，
 * 或将其他级别标题降级一级（数字变大）
 *
 * @param editor Slate 编辑器实例
 */
export function decreaseHeadingLevel(editor: Editor) {
  const [node] = getCurrentNodes(editor);
  if (
    node &&
    ['paragraph', 'head'].includes(node?.[0]?.type) &&
    EditorUtils.isTop(editor, node[1])
  ) {
    if (node?.[0]?.type === 'paragraph') {
      Transforms.setNodes(editor, { type: 'head', level: 1 }, { at: node[1] });
    } else if (node[0].level === 4) {
      Transforms.setNodes(editor, { type: 'paragraph' }, { at: node[1] });
    } else {
      Transforms.setNodes(
        editor,
        { level: node[0].level + 1 },
        { at: node[1] },
      );
    }
  }
}
