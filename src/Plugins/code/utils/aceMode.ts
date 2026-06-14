import type { Ace } from 'ace-builds';
import { getAceLangs, modeMap } from '../../../MarkdownEditor/editor/utils/ace';

export interface SetAceEditorModeOptions {
  codeEditor: Ace.Editor;
  language: string | null | undefined;
  fallbackToText?: boolean;
  isCurrentEditor: (codeEditor: Ace.Editor) => boolean;
}

export async function setAceEditorMode({
  codeEditor,
  language,
  fallbackToText = true,
  isCurrentEditor,
}: SetAceEditorModeOptions) {
  let lang = language || '';
  if (modeMap.has(lang)) {
    lang = modeMap.get(lang)!;
  }

  const aceLangs = await getAceLangs();
  if (!isCurrentEditor(codeEditor)) return;

  const mode = aceLangs.has(lang)
    ? `ace/mode/${lang}`
    : fallbackToText
      ? 'ace/mode/text'
      : null;

  if (!mode) return;

  try {
    const session = codeEditor.getSession?.() || codeEditor.session;
    if (isCurrentEditor(codeEditor) && session) {
      session.setMode(mode);
    }
  } catch (error) {
    console.warn('Failed to set Ace Editor mode:', error);
  }
}
