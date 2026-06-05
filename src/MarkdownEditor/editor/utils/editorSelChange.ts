import { Subject } from 'rxjs';
import type { BaseSelection, NodeEntry } from 'slate';

export type EditorSelChangePayload = {
  sel: BaseSelection;
  node: NodeEntry<any>;
} | null;

export function createEditorSelChangeSubject() {
  return new Subject<EditorSelChangePayload>();
}
