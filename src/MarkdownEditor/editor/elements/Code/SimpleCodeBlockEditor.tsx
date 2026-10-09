import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Editor, Node } from 'slate';
import { useSlateStatic } from 'slate-react';
import type { CodeNode } from '../../../el';
import { useEditorStore } from '../../store';
import {
  handleCodeBlockTextInputKeyDown,
  isCodeBlockElement,
  setCodeBlockNodes,
} from '../../utils/codeBlockBehavior';
import { getCodeBlockPlainText } from '../../utils/codeBlockPlainText';
import { findElementPath } from '../../utils/findElementPath';

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
  const body = getCodeBlockPlainText(element);
  const [draft, setDraft] = useState(body);
  const [isComposing, setIsComposing] = useState(false);
  const composingRef = useRef(false);

  useEffect(() => {
    if (isComposing) return;
    setDraft(body);
  }, [body, isComposing]);

  const commitValue = useCallback(
    (next: string) => {
      const path = findElementPath(editor, element, {
        matchKey: true,
        search: true,
      });
      if (readonly || !path || !Editor.hasPath(editor, path)) return;
      const currentNode = Node.get(editor, path);
      if (!isCodeBlockElement(currentNode)) return;
      if (
        getCodeBlockPlainText(currentNode) === next &&
        currentNode.otherProps?.finished === true
      ) {
        return;
      }
      setCodeBlockNodes(editor, path, {
        value: next,
        otherProps: {
          ...currentNode.otherProps,
          finished: true,
        },
      });
    },
    [editor, element, readonly],
  );

  const onChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const next = event.target.value;
    if (readonly) return;
    setDraft(next);
    if (composingRef.current) return;
    commitValue(next);
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    event.stopPropagation();
    if (
      readonly ||
      composingRef.current ||
      event.nativeEvent.isComposing ||
      event.keyCode === 229
    ) {
      return;
    }
    const path = findElementPath(editor, element, {
      matchKey: true,
      search: true,
    });
    if (!path || !isCodeBlockElement(Node.get(editor, path))) return;
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
      onCompositionStart={() => {
        composingRef.current = true;
        setIsComposing(true);
      }}
      onCompositionEnd={(event) => {
        composingRef.current = false;
        setIsComposing(false);
        setDraft(event.currentTarget.value);
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
