import React from 'react';
import { Subject } from 'rxjs';
import { createEditor } from 'slate';
import { withReact } from 'slate-react';
import type { MarkdownEditorProps } from '../../../types';
import {
  EditorStore,
  EditorStoreContext,
  type EditorStoreContextType,
} from '../../store';
import { createEditorSelChangeSubject } from '../../utils/editorSelChange';

export function createStubEditorStoreContextValue(
  partial?: Partial<EditorStoreContextType>,
): EditorStoreContextType {
  const markdownEditorRef = {
    current: withReact(createEditor()),
  };
  const store = new EditorStore(markdownEditorRef as any);

  return {
    store,
    readonly: false,
    typewriter: false,
    setShowComment: () => {},
    keyTask$: new Subject(),
    insertCompletionText$: new Subject(),
    openInsertLink$: new Subject(),
    selChange$: createEditorSelChangeSubject(),
    floatBarRevision: 0,
    domRect: null,
    setDomRect: () => {},
    bumpFloatBarRevision: () => {},
    editorProps: {} as MarkdownEditorProps,
    markdownEditorRef: markdownEditorRef as any,
    markdownContainerRef: { current: null },
    ...partial,
  };
}

export function EditorStoreTestProvider({
  children,
  value,
}: {
  children: React.ReactNode;
  value?: Partial<EditorStoreContextType>;
}) {
  const contextValue = createStubEditorStoreContextValue(value);
  return (
    <EditorStoreContext.Provider value={contextValue}>
      {children}
    </EditorStoreContext.Provider>
  );
}
