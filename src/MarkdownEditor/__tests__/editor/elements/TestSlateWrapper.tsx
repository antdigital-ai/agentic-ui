import React from 'react';
import { createEditor, Descendant } from 'slate';
import { ReactEditor, Slate, withReact } from 'slate-react';

interface TestSlateWrapperProps {
  children: React.ReactNode;
  initialValue?: Descendant[];
  editor?: ReactEditor;
}

export const TestSlateWrapper: React.FC<TestSlateWrapperProps> = ({
  children,
  initialValue = [{ type: 'paragraph', children: [{ text: '' }] }],
  editor,
}) => {
  // Create a real Slate editor if none provided
  const defaultEditor = React.useMemo(() => {
    if (editor) return editor;
    const baseEditor = createEditor();
    const reactEditor = withReact(baseEditor);
    return reactEditor;
  }, [editor]);

  return (
    <Slate
      editor={defaultEditor}
      initialValue={initialValue}
      onChange={() => {}}
    >
      {children}
    </Slate>
  );
};
