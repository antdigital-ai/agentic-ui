import { createContext, useContext } from 'react';

import type { EditorStoreContextType } from './store';

/** 与 store.ts 解耦，供 FncLeaf 等只读路径使用，避免 vi.mock('editor/store') 遮蔽 Context */
export const EditorStoreContext = createContext<EditorStoreContextType | null>(
  null,
);

/** Shared by editor and readonly views without loading the Slate store. */
export const useEditorStore = (): EditorStoreContextType => {
  const context = useContext(EditorStoreContext);
  if (!context) {
    throw new Error(
      'useEditorStore must be used within EditorStoreContext.Provider',
    );
  }
  return context;
};
