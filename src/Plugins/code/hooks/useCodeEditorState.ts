/**
 * @fileoverview 代码编辑器状态管理Hook
 * 统一管理代码编辑器的状态逻辑
 */

import { useEffect } from 'react';
import { useGetSetState } from 'react-use';
import { Transforms } from 'slate';
import { ReactEditor } from 'slate-react';
import { useRefFunction } from '../../../Hooks/useRefFunction';
import { useEditorStore } from '../../../MarkdownEditor/editor/store';
import { getSlateElementPlainText } from '../../../MarkdownEditor/editor/utils/codeBlockPlainText';
import { CodeNode } from '../../../MarkdownEditor/el';
import { useSelStatus } from '../../../MarkdownEditor/hooks/editor';

interface CodeEditorState {
  showBorder: boolean;
  htmlStr: string;
  hide: boolean;
  lang: string;
}

export function useCodeEditorState(element: CodeNode) {
  const { store, markdownEditorRef } = useEditorStore();
  const [selected, path] = useSelStatus(element);

  // 组件内部状态
  const [state, setState] = useGetSetState<CodeEditorState>({
    showBorder: false,
    htmlStr: '',
    hide: false,
    lang: element.language || '',
  });

  // 更新代码节点数据
  const update = useRefFunction((data: Partial<CodeNode>) => {
    Transforms.setNodes(store.editor, data, { at: path });
  });

  // 处理编辑器选中状态的边框显示
  useEffect(() => {
    if (selected && ReactEditor.isFocused(markdownEditorRef.current)) {
      setState({ showBorder: true });
    } else if (state().showBorder) {
      setState({ showBorder: false });
    }
  }, [selected, path, setState, state, markdownEditorRef]);

  // 工具栏事件处理器
  const handleCloseClick = useRefFunction(() => {
    setState({ hide: false });
  });

  const handleRunHtml = useRefFunction(() => {
    try {
      setState({ htmlStr: getSlateElementPlainText(element) });
    } catch (error) {
      // HTML 执行失败时静默处理
    }
  });

  const handleHtmlPreviewClose = useRefFunction(() => {
    setState({ htmlStr: '' });
  });

  const handleShowBorderChange = useRefFunction((show: boolean) => {
    setState({ showBorder: show });
  });

  const handleHideChange = useRefFunction((hide: boolean) => {
    setState({ hide });
  });

  return {
    state: state(),
    setState,
    update,
    selected,
    path,
    handleCloseClick,
    handleRunHtml,
    handleHtmlPreviewClose,
    handleShowBorderChange,
    handleHideChange,
  };
}
