import type { Editor } from 'slate';

export { getListType, isListType } from './lists';
import { withAgenticLists } from './lists';

export const withListsPlugin = (editor: Editor): Editor => withAgenticLists(editor);
