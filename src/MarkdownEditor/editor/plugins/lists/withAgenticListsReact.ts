import type { Editor } from 'slate';

import { withRangeCloneContentsPatched } from './util/withRangeCloneContentsPatched';

/**
 * Patches copy/paste fragment assembly for list DOM (Prezly withListsReact).
 */
export function withAgenticListsReact<T extends Editor>(editor: T): T {
  const { setFragmentData } = editor;

  editor.setFragmentData = (data: DataTransfer) => {
    withRangeCloneContentsPatched(() => {
      setFragmentData(data);
    });
  };

  return editor;
}
