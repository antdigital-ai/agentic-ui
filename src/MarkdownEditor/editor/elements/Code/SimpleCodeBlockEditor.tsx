import React, { useCallback, useEffect, useState } from 'react';
import { ReactEditor, useSlateStatic } from 'slate-react';
import type { CodeNode } from '../../../el';
import { useEditorStore } from '../../store';
import {
  handleCodeBlockTextInputKeyDown,
  setCodeBlockNodes,
} from '../../utils/codeBlockBehavior';
import { getCodeBlockPlainText } from '../../utils/codeBlockPlainText';

const TEXTAREA_STYLE: React.CSSProperties = {
  boxSizing: 'border-box',
  width: '100%',
  height: '100%',
  minHeight: '12em',
  margin: 0,
  padding: 0,
  border: 'none',
  outline: 'none',
  resize: 'none',
  fontFamily: `'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace`,
  fontSize: '0.875em',
  lineHeight: 1.5,
  color: 'inherit',
  background: 'transparent',
};

interface SimpleCodeBlockEditorProps {
  element: CodeNode;
}

/**
 * 未挂载 Code 插件（CodeRenderer / Ace）时的最简代码块编辑：textarea 写回 `value`。
 */
export const SimpleCodeBlockEditor: React.FC<SimpleCodeBlockEditorProps> = ({
  element,
}) => {
  const editor = useSlateStatic();
  const { readonly } = useEditorStore();
  const path = ReactEditor.findPath(editor, element);
  const body = getCodeBlockPlainText(element);
  const [draft, setDraft] = useState(body);
  const [isComposing, setIsComposing] = useState(false);

  useEffect(() => {
    if (isComposing) return;
    setDraft(body);
  }, [body, isComposing]);

  const commitValue = useCallback(
    (next: string) => {
      setCodeBlockNodes(editor, path, {
        value: next,
        otherProps: {
          ...element.otherProps,
          finished: true,
        },
      });
    },
    [editor, element.otherProps, path],
  );

  const onChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const next = event.target.value;
    setDraft(next);
    commitValue(next);
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const result = handleCodeBlockTextInputKeyDown(
      editor,
      path,
      event.nativeEvent,
      event.currentTarget,
    );
    if (result === 'handled') {
      event.preventDefault();
      return;
    }
    event.stopPropagation();
  };

  const stopSlatePointerBubble = (
    event: React.MouseEvent | React.PointerEvent,
  ) => {
    event.stopPropagation();
  };

  return (
    <textarea
      data-testid="simple-code-block-editor"
      aria-label={element.language ? `Code: ${element.language}` : 'Code block'}
      value={draft}
      readOnly={readonly}
      onChange={onChange}
      onCompositionStart={() => setIsComposing(true)}
      onCompositionEnd={(event) => {
        setIsComposing(false);
        commitValue(event.currentTarget.value);
      }}
      onKeyDown={onKeyDown}
      onMouseDown={stopSlatePointerBubble}
      onPointerDown={stopSlatePointerBubble}
      onClick={stopSlatePointerBubble}
      spellCheck={false}
      style={TEXTAREA_STYLE}
    />
  );
};

SimpleCodeBlockEditor.displayName = 'SimpleCodeBlockEditor';
