import type { Editor } from 'slate';
import { withAgenticLists } from './lists';

export { getListType, isListType } from './lists';

export const withListsPlugin = (editor: Editor): Editor =>
  withAgenticLists(editor);
