import { Editor, Element, Node, Path, Range, Transforms } from 'slate';
import { ListItemNode } from '../../el';
import { NativeTableEditor } from '../../utils/native-table';
import { getListType, isListType } from '../plugins/withListsPlugin';
import { EditorUtils } from './editorUtils';

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
  const currentNode = node || Array.from(getCurrentNodes(editor))[0];
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

    if (currentNode?.[0]?.type === 'paragraph' && !Node.string(currentNode[0])) {
      Transforms.delete(editor, { at: Path.next(path) });
    }
    Transforms.select(editor, Editor.start(editor, path));
  }

  if (currentNode && ['column-cell'].includes(currentNode?.[0]?.type)) {
    NativeTableEditor.insertTable(editor, {
      rows: 3,
      cols: 3,
      at: [...currentNode[1], 0],
    });
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
export function insertCodeBlock(editor: Editor, type?: 'mermaid' | 'html', node?: [any, Path]) {
  const currentNode = node || Array.from(getCurrentNodes(editor))[0];
  if (currentNode && currentNode[0] && ['paragraph', 'head'].includes(currentNode[0].type)) {
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
  if (!currentNode || !['paragraph', 'head'].includes(currentNode?.[0]?.type)) return;
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
 * 设置标题级别
 *
 * 将当前段落或标题节点转换为指定级别的标题。
 * 如果级别为4，则转换为普通段落。
 *
 * @param editor Slate 编辑器实例
 * @param level 标题级别（1-3）或4（表示普通段落）
 */
export function setHeading(editor: Editor, level: number) {
  const [node] = getCurrentNodes(editor);
  if (level === 4) {
    convertToParagraph(editor);
    return;
  }
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
 * 将标题节点转换为段落节点
 *
 * @param editor - 编辑器实例
 * @param path - 标题节点的路径
 */
function convertHeadingToParagraph(editor: Editor, path: Path) {
  Transforms.setNodes(
    editor,
    {
      type: 'paragraph',
    },
    { at: path },
  );
  // 移除 level 属性
  Transforms.unsetNodes(editor, 'level', { at: path });
}

/**
 * 检查路径是否有后一个兄弟节点
 * 注意：Path.hasNext 在 Slate 中不存在，所以需要自定义实现
 */
function hasNext(editor: Editor, path: Path): boolean {
  if (path.length === 0) {
    return false;
  }
  try {
    const parentPath = Path.parent(path);
    if (!Editor.hasPath(editor, parentPath)) {
      return false;
    }
    const parentNode = Node.get(editor, parentPath);
    if (!Element.isElement(parentNode)) {
      return false;
    }
    const index = path[path.length - 1];
    return index < parentNode.children.length - 1;
  } catch {
    return false;
  }
}

/**
 * 查找相邻的列表节点
 *
 * @param editor - 编辑器实例
 * @param path - 当前路径
 * @param listType - 目标列表类型
 * @returns 相邻列表的路径，如果不存在则返回 null
 */
function findAdjacentList(
  editor: Editor,
  path: Path,
  listType: 'bulleted-list' | 'numbered-list',
): Path | null {
  // 如果是根路径，无法查找相邻节点
  if (path.length === 0) {
    return null;
  }

  // 检查前一个兄弟节点（使用 Slate 的 Path.hasPrevious）
  if (Path.hasPrevious(path)) {
    const prevPath = Path.previous(path);
    if (Editor.hasPath(editor, prevPath)) {
      const prevNode = Node.get(editor, prevPath);
      if (isListType(prevNode) && prevNode.type === listType) {
        return prevPath;
      }
    }
  }

  // 检查后一个兄弟节点（使用自定义 hasNext）
  if (hasNext(editor, path)) {
    const nextPath = Path.next(path);
    if (Editor.hasPath(editor, nextPath)) {
      const nextNode = Node.get(editor, nextPath);
      if (isListType(nextNode) && nextNode.type === listType) {
        return nextPath;
      }
    }
  }

  return null;
}

/**
 * 合并列表项到相邻列表
 *
 * @param editor - 编辑器实例
 * @param listItemPaths - 要合并的列表项路径数组
 * @param targetListPath - 目标列表路径
 */
function mergeIntoAdjacentList(
  editor: Editor,
  listItemPaths: Path[],
  targetListPath: Path,
) {
  const targetList = Node.get(editor, targetListPath);
  if (!isListType(targetList)) {
    return;
  }

  // 按路径倒序处理，避免路径变化影响
  for (const listItemPath of listItemPaths.reverse()) {
    if (Editor.hasPath(editor, listItemPath)) {
      const targetIndex = targetList.children.length;
      Transforms.moveNodes(editor, {
        at: listItemPath,
        to: [...targetListPath, targetIndex],
      });
    }
  }
}

/**
 * 解包列表为段落
 *
 * @param editor - 编辑器实例
 * @param listItemPath - 列表项路径
 * @param listPath - 列表路径
 */
function unwrapListToParagraph(
  editor: Editor,
  listItemPath: Path,
  listPath: Path,
) {
  // 先解包 list-item，保留其内容
  Transforms.unwrapNodes(editor, { at: listItemPath });

  // 如果列表为空，删除列表容器
  const list = Node.get(editor, listPath);
  if (isListType(list) && list.children.length === 0) {
    Transforms.removeNodes(editor, { at: listPath });
  }
}

/**
 * 更新列表类型
 *
 * @param editor - 编辑器实例
 * @param listPath - 列表路径
 * @param mode - 列表类型模式
 */
function updateListType(
  editor: Editor,
  listPath: Path,
  mode: 'ordered' | 'unordered' | 'task',
) {
  const listType = getListType(mode === 'ordered');

  // 更新列表类型
  Transforms.setNodes(
    editor,
    {
      type: listType,
      ...(mode === 'ordered' && { start: 1 }),
      ...(mode === 'task' && { task: true }),
    },
    { at: listPath },
  );

  // 移除旧的 order 属性（如果存在）
  const listNode = Node.get(editor, listPath);
  if ((listNode as any).order !== undefined) {
    Transforms.unsetNodes(editor, 'order', { at: listPath });
  }

  // 如果是任务列表，更新所有列表项的 checked 状态
  if (mode === 'task') {
    const listItems = Array.from<any>(
      Editor.nodes(editor, {
        match: (n) => n.type === 'list-item',
        at: listPath,
        reverse: true,
        mode: 'lowest',
      }),
    );
    for (const [item, itemPath] of listItems) {
      Transforms.setNodes(
        editor,
        { checked: item.checked || false },
        { at: itemPath },
      );
    }
  }
}

/**
 * 创建或转换列表
 *
 * 将当前段落或标题转换为指定类型的列表。
 * 如果已经是列表项，则根据情况切换类型或解包。
 *
 * @param editor Slate 编辑器实例
 * @param mode 列表类型 'ordered'(有序列表), 'unordered'(无序列表), 'task'(任务列表)
 */
export function createList(
  editor: Editor,
  mode: 'ordered' | 'unordered' | 'task',
) {
  const selection = editor.selection;
  if (!selection) {
    return;
  }

  const [curNode] = getCurrentNodes(editor);
  if (!curNode) {
    return;
  }

  const targetListType = getListType(mode === 'ordered');

  // 情况1: 当前节点已经是 list-item，处理反向转换或类型切换
  if (curNode[0].type === 'list-item') {
    const listItemPath = curNode[1];
    const listPath = Path.parent(listItemPath);
    const listNode = Node.get(editor, listPath);

    if (isListType(listNode)) {
      // 如果列表类型与目标类型相同，执行解包
      if (listNode.type === targetListType && mode !== 'task') {
        Editor.withoutNormalizing(editor, () => {
          unwrapListToParagraph(editor, listItemPath, listPath);
        });
        return;
      }

      // 否则更新列表类型
      Editor.withoutNormalizing(editor, () => {
        updateListType(editor, listPath, mode);
      });
      return;
    }
  }

  // 情况2: 当前节点在 list-item 中（paragraph 在 list-item 内）
  if (['paragraph', 'head'].includes(curNode[0].type)) {
    const parent = Editor.parent(editor, curNode[1]);
    if (
      parent &&
      Element.isElement(parent[0]) &&
      parent[0].type === 'list-item' &&
      !Path.hasPrevious(curNode[1])
    ) {
      const listParent = Editor.parent(editor, parent[1]);
      if (listParent && Element.isElement(listParent[0]) && isListType(listParent[0])) {
        // 如果列表类型与目标类型相同，且不是任务列表，执行解包
        const isTaskList =
          listParent[0].type === 'bulleted-list' &&
          (listParent[0] as any).task === true;
        if (
          listParent[0].type === targetListType &&
          mode !== 'task' &&
          !isTaskList
        ) {
          Editor.withoutNormalizing(editor, () => {
            unwrapListToParagraph(editor, parent[1], listParent[1]);
          });
          return;
        }

        // 否则更新列表类型
        Editor.withoutNormalizing(editor, () => {
          updateListType(editor, listParent[1], mode);
        });
        return;
      }
    }
  }

  // 情况3: 将节点转换为列表
  if (!['paragraph', 'head'].includes(curNode[0].type)) {
    return;
  }

  // 查找需要转换的块级节点
  let blockNodes = findBlockNodesInSelection(editor, selection);

  // 如果没有找到节点，且选区已折叠，使用当前节点
  if (blockNodes.length === 0 && Range.isCollapsed(selection)) {
    if (['paragraph', 'head'].includes(curNode[0].type)) {
      blockNodes.push(curNode);
    } else {
      return;
    }
  }

  // 处理部分选中：如果选区只选中了节点的一部分文本，转换整个节点
  if (blockNodes.length === 0 && selection && !Range.isCollapsed(selection)) {
    // 尝试获取选区覆盖的所有块级节点
    const [start, end] = Range.edges(selection);
    const startPath = start.path;
    const endPath = end.path;

    // 如果起始和结束在同一路径，说明是单个节点的部分选中
    if (Path.equals(startPath.slice(0, -1), endPath.slice(0, -1))) {
      const parentPath = Path.parent(startPath);
      const parentNode = Node.get(editor, parentPath);
      if (
        Element.isElement(parentNode) &&
        ['paragraph', 'head'].includes(parentNode.type)
      ) {
        blockNodes.push([parentNode, parentPath]);
      }
    } else {
      // 跨节点选中，查找所有涉及的块级节点
      const allBlockNodes = Array.from(
        Editor.nodes(editor, {
          at: selection,
          match: (n) =>
            Element.isElement(n) &&
            !Editor.isInline(editor, n) &&
            ['paragraph', 'head'].includes(n.type),
        }),
      ) as Array<[Element, Path]>;
      blockNodes = allBlockNodes;
    }
  }

  if (blockNodes.length === 0) {
    return;
  }

  // 过滤掉已经在列表中的节点（避免重复包装）
  blockNodes = blockNodes.filter(([, path]) => {
    const parent = Editor.parent(editor, path);
    return !Element.isElement(parent[0]) || parent[0].type !== 'list-item';
  });

  if (blockNodes.length === 0) {
    return;
  }

  // 使用 withoutNormalizing 确保原子性
  Editor.withoutNormalizing(editor, () => {
    // 步骤1: 处理标题降级和空节点
    for (const [node, path] of blockNodes) {
      if (!node || !Element.isElement(node)) {
        continue;
      }

      if (node.type === 'head') {
        convertHeadingToParagraph(editor, path);
      }

      // 处理空节点：确保节点有内容
      // 注意：convertHeadingToParagraph 可能改变了节点，需要重新获取
      if (!Editor.hasPath(editor, path)) {
        continue;
      }
      const currentNode = Node.get(editor, path);
      if (
        currentNode &&
        Element.isElement(currentNode) &&
        currentNode.type === 'paragraph' &&
        Node.string(currentNode).trim() === ''
      ) {
        // 空节点保持原样，后续会正常包装
      }
    }

    // 步骤2: 包装节点为 list-item
    const listItemPaths: Path[] = [];
    for (const [, path] of blockNodes) {
      // 检查节点是否已经是 list-item（可能在转换过程中变化）
      const currentNode = Node.get(editor, path);
      if (Element.isElement(currentNode) && currentNode.type === 'list-item') {
        listItemPaths.push(path);
        continue;
      }

      // 检查路径是否有效且不是根路径
      if (!Editor.hasPath(editor, path) || path.length === 0) {
        continue;
      }

      // 包装为 list-item
      const listItemProps: Partial<ListItemNode> = {
        type: 'list-item',
        mentions: [],
        id: '',
        ...(mode === 'task' && { checked: false }),
      };

      Transforms.wrapNodes(editor, listItemProps, { at: path });

      // 更新路径（因为包装后路径会变化）
      // wrapNodes 后，list-item 的路径就是原来的 path
      // 原节点现在在 [path, 0] 位置
      // 所以 list-item 的路径就是 path
      if (Editor.hasPath(editor, path)) {
        const listItemNode = Node.get(editor, path);
        if (
          Element.isElement(listItemNode) &&
          listItemNode.type === 'list-item'
        ) {
          listItemPaths.push(path);
        }
      }
    }

    // 步骤3: 包装 list-item 为列表
    if (listItemPaths.length === 0) {
      return;
    }

    // 检查第一个节点前后是否有相同类型的列表
    const firstPath = listItemPaths[0];

    // 验证路径有效性
    if (!Editor.hasPath(editor, firstPath)) {
      return;
    }

    // 获取第一个 list-item 的父路径（可能是容器）
    let firstListItemParentPath: Path;
    try {
      // 检查路径是否有效且不是根路径
      if (firstPath.length === 0) {
        // 如果是根路径，无法创建列表，直接返回
        return;
      }
      const firstListItemParent = Editor.parent(editor, firstPath);
      if (firstListItemParent && firstListItemParent[1]) {
        firstListItemParentPath = firstListItemParent[1];
      } else {
        // 如果无法获取父路径，使用 Path.parent
        firstListItemParentPath = Path.parent(firstPath);
      }
    } catch (error) {
      // 如果无法获取父路径，使用 Path.parent
      if (firstPath.length > 0) {
        firstListItemParentPath = Path.parent(firstPath);
      } else {
        // 根路径无法创建列表
        return;
      }
    }

    // 检查相邻列表（在同一个父容器层级）
    const adjacentListPath = findAdjacentList(
      editor,
      firstListItemParentPath,
      targetListType,
    );

    if (adjacentListPath) {
      // 合并到相邻列表
      mergeIntoAdjacentList(editor, listItemPaths, adjacentListPath);

      // 删除空的列表容器（如果有）
      const processedListPaths = new Set<Path>();
      for (const listItemPath of listItemPaths) {
        if (Editor.hasPath(editor, listItemPath)) {
          const listItemParent = Editor.parent(editor, listItemPath);
          if (
            Element.isElement(listItemParent[0]) &&
            isListType(listItemParent[0])
          ) {
            const listPath = listItemParent[1];
            if (!processedListPaths.has(listPath)) {
              processedListPaths.add(listPath);
              const list = listItemParent[0];
              if (list.children.length === 0) {
                Transforms.removeNodes(editor, { at: listPath });
              }
            }
          }
        }
      }
    } else {
      // 创建新列表
      const listProps: any = {
        type: targetListType,
        ...(mode === 'ordered' && { start: 1 }),
        ...(mode === 'task' && { task: true }),
      };

      // 包装第一个 list-item
      Transforms.wrapNodes(editor, listProps, { at: firstPath });

      // 将其他 list-item 移动到同一个列表中
      // 包装后，list 的路径是 firstPath 的父路径
      if (firstPath.length === 0) {
        return; // 根路径无法创建列表
      }
      const listPath = Path.parent(firstPath);

      // 验证列表路径有效
      if (!Editor.hasPath(editor, listPath)) {
        return;
      }
      for (let i = 1; i < listItemPaths.length; i++) {
        const listItemPath = listItemPaths[i];
        if (Editor.hasPath(editor, listItemPath)) {
          // 检查是否已经在列表中
          const listItemParent = Editor.parent(editor, listItemPath);
          if (
            Element.isElement(listItemParent[0]) &&
            isListType(listItemParent[0])
          ) {
            // 已经在列表中，移动到目标列表
            const targetList = Node.get(editor, listPath);
            if (isListType(targetList)) {
              const targetIndex = targetList.children.length;
              Transforms.moveNodes(editor, {
                at: listItemPath,
                to: [...listPath, targetIndex],
              });
            }
          } else {
            // 包装为列表，然后移动到目标列表
            Transforms.wrapNodes(editor, listProps, { at: listItemPath });
            if (listItemPath.length === 0) {
              continue; // 跳过根路径
            }
            const newListPath = Path.parent(listItemPath);
            const targetList = Node.get(editor, listPath);
            if (isListType(targetList)) {
              const targetIndex = targetList.children.length;
              Transforms.moveNodes(editor, {
                at: listItemPath,
                to: [...listPath, targetIndex],
              });
              // 删除空的列表容器
              if (Editor.hasPath(editor, newListPath)) {
                const emptyList = Node.get(editor, newListPath);
                if (isListType(emptyList) && emptyList.children.length === 0) {
                  Transforms.removeNodes(editor, { at: newListPath });
                }
              }
            }
          }
        }
      }
    }

    // 步骤4: 更新光标位置
    if (listItemPaths.length > 0) {
      const firstListItemPath = listItemPaths[0];
      if (Editor.hasPath(editor, firstListItemPath)) {
        Transforms.select(editor, Editor.start(editor, firstListItemPath));
      }
    }
  });
}

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
