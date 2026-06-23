import { createContext } from 'react';

import type { EditorStoreContextType } from './store';

/** 与 store.ts 解耦，供 FncLeaf 等只读路径使用，避免 vi.mock('editor/store') 遮蔽 Context */
export const EditorStoreContext = createContext<EditorStoreContextType | null>(
  null,
);
