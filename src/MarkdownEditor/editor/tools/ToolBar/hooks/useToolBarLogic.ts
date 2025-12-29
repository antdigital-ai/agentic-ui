import { useCallback, useEffect, useMemo, useState } from 'react';
import type { BaseEditor } from 'slate';
import { Editor, Element, Node, Text, Transforms } from 'slate';
import type { HistoryEditor } from 'slate-history';
import type { ReactEditor } from 'slate-react';
import { MarkdownFormatter } from '../../../../../plugins/formatter';
import { getSelRect } from '../../../utils/dom';
import { EditorUtils } from '../../../utils/editorUtils';

export interface UseToolBarLogicProps {
  markdownEditorRef: React.RefObject<BaseEditor & ReactEditor & HistoryEditor>;
  keyTask$: any;
  store: any;
  openInsertLink$: any;
  setDomRect: (rect: any) => void;
  refreshFloatBar: any;
  domRect: any;
}

export const useToolBarLogic = ({
  markdownEditorRef,
  keyTask$,
  store,
  openInsertLink$,
  setDomRect,
  refreshFloatBar,
  domRect,
}: UseToolBarLogicProps) => {
  const [refresh, setRefresh] = useState(false);
  const [highColor, setHighColor] = useState<string | null>(null);

  // 检查是否为代码节点
  const isCodeNode = useCallback(
    (editor: BaseEditor & ReactEditor & HistoryEditor) => {
      const [node] = Editor.nodes(editor, {
        match: (n: any) => Element.isElement(n),
        mode: 'lowest',
      });
      return node && ((node as any)[0] as any).type === 'code';
    },
    [],
  );

  // 获取当前节点
  const currentNode = useMemo(() => {
    if (!markdownEditorRef.current) return null;
    const [node] = Editor.nodes<any>(markdownEditorRef.current, {
      match: (n) => Element.isElement(n),
      mode: 'lowest',
    });
    return node;
  }, [markdownEditorRef, refresh]);

  // 检查格式是否激活
  const isFormatActive = useCallback(
    (type: string) => {
      if (!markdownEditorRef.current) return false;
      return EditorUtils.isFormatActive(markdownEditorRef.current, type);
    },
    [markdownEditorRef, refresh],
  );

  // 撤销操作
  const handleUndo = useCallback(() => {
    keyTask$.next({ key: 'undo', args: [] });
  }, [keyTask$]);

  // 重做操作
  const handleRedo = useCallback(() => {
    keyTask$.next({ key: 'redo', args: [] });
  }, [keyTask$]);

  // 清除格式
  const handleClearFormat = useCallback(() => {
    if (!markdownEditorRef.current || isCodeNode(markdownEditorRef.current))
      return;
    EditorUtils.clearMarks(markdownEditorRef.current, true);
    EditorUtils.highColor(markdownEditorRef.current);
  }, [markdownEditorRef, isCodeNode]);

  // 格式化文档
  const handleFormat = useCallback(() => {
    const editor = markdownEditorRef.current;
    if (!editor) return;

    const [node] = Editor.nodes(editor, {
      match: (n) => Text.isText(n),
      mode: 'all',
    });

    if (node) {
      const content = Node.string(node.at(0));
      if (content.trim() === '') {
        const markdown = store.getMDContent();
        if (markdown) {
          const formatted = MarkdownFormatter.format(markdown);
          store.setMDContent(formatted);
          setRefresh((r) => !r);
        }
        return;
      }

      const formatted = MarkdownFormatter.format(content);
      const selection = editor.selection;
      if (!selection) return;

      Transforms.insertText(editor, formatted, { at: node[1] });
      Transforms.select(editor, node[1]);
    }
  }, [markdownEditorRef, store]);

  // 标题变更
  const handleHeadingChange = useCallback(
    (level: number) => {
      keyTask$.next({ key: 'head', args: [level] });
    },
    [keyTask$],
  );

  // 颜色变更
  const handleColorChange = useCallback(
    (color: string) => {
      if (!markdownEditorRef.current || isCodeNode(markdownEditorRef.current))
        return;
      EditorUtils.highColor(markdownEditorRef.current, color);
      setHighColor(color);
      setRefresh((r) => !r);
    },
    [markdownEditorRef, isCodeNode],
  );

  // 切换高亮颜色
  const handleToggleHighColor = useCallback(() => {
    if (!markdownEditorRef.current || isCodeNode(markdownEditorRef.current))
      return;

    if (EditorUtils.isFormatActive(markdownEditorRef.current, 'highColor')) {
      EditorUtils.highColor(markdownEditorRef.current);
    } else {
      EditorUtils.highColor(markdownEditorRef.current, highColor || '#10b981');
    }
    setRefresh((r) => !r);
  }, [markdownEditorRef, isCodeNode, highColor]);

  // 工具点击处理
  const handleToolClick = useCallback(
    (tool: any) => {
      if (!markdownEditorRef.current || isCodeNode(markdownEditorRef.current))
        return;

      if (tool.onClick) {
        tool.onClick(markdownEditorRef.current);
      } else {
        EditorUtils.toggleFormat(markdownEditorRef.current, tool.type);
      }
      setRefresh((r) => !r);
    },
    [markdownEditorRef, isCodeNode],
  );

  // 插入链接
  const handleInsertLink = useCallback(() => {
    const sel = markdownEditorRef.current?.selection;
    if (!sel) return;

    setDomRect(getSelRect()!);
    if (
      typeof window === 'undefined' ||
      typeof window.matchMedia === 'undefined'
    )
      return;
    openInsertLink$.next(sel);
  }, [markdownEditorRef, setDomRect, openInsertLink$]);

  // 插入操作
  const handleInsert = useCallback(
    (op: any) => {
      if (!op) return;
      keyTask$.next({ key: op.task, args: op.args });
    },
    [keyTask$],
  );

  // 监听变化
  useEffect(() => {
    setRefresh((r) => !r);
  }, [refreshFloatBar, domRect]);

  return {
    currentNode,
    highColor,
    isCodeNode: useCallback(
      () =>
        markdownEditorRef.current
          ? isCodeNode(markdownEditorRef.current)
          : false,
      [isCodeNode, markdownEditorRef],
    ),
    isFormatActive,
    isHighColorActive: isFormatActive('highColor'),
    isLinkActive: isFormatActive('url'),
    handleUndo,
    handleRedo,
    handleClearFormat,
    handleFormat,
    handleHeadingChange,
    handleColorChange,
    handleToggleHighColor,
    handleToolClick,
    handleInsertLink,
    handleInsert,
  };
};
