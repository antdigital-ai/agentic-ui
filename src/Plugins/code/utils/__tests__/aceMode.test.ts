import { beforeEach, describe, expect, it, vi } from 'vitest';
import { setAceEditorMode } from '../aceMode';

const mockGetAceLangs = vi.hoisted(() => vi.fn());

vi.mock('../../../../MarkdownEditor/editor/utils/ace', () => ({
  getAceLangs: mockGetAceLangs,
  modeMap: new Map([
    ['js', 'javascript'],
    ['ts', 'typescript'],
  ]),
}));

function createAceEditor({
  getSession,
  session,
}: {
  getSession?: () => { setMode: ReturnType<typeof vi.fn> } | null;
  session?: { setMode: ReturnType<typeof vi.fn> };
}) {
  return {
    getSession,
    session,
  } as any;
}

describe('setAceEditorMode', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetAceLangs.mockResolvedValue(
      new Set(['javascript', 'typescript', 'python']),
    );
  });

  it('maps language aliases before setting the Ace session mode', async () => {
    const session = { setMode: vi.fn() };
    const codeEditor = createAceEditor({ session });

    await setAceEditorMode({
      codeEditor,
      language: 'js',
      isCurrentEditor: (editor) => editor === codeEditor,
    });

    expect(session.setMode).toHaveBeenCalledWith('ace/mode/javascript');
  });

  it('falls back to text mode for unsupported languages by default', async () => {
    const session = { setMode: vi.fn() };
    const codeEditor = createAceEditor({ session });

    await setAceEditorMode({
      codeEditor,
      language: 'unknown-lang',
      isCurrentEditor: (editor) => editor === codeEditor,
    });

    expect(session.setMode).toHaveBeenCalledWith('ace/mode/text');
  });

  it('skips unsupported initial languages when fallback is disabled', async () => {
    const session = { setMode: vi.fn() };
    const codeEditor = createAceEditor({ session });

    await setAceEditorMode({
      codeEditor,
      language: 'unknown-lang',
      fallbackToText: false,
      isCurrentEditor: (editor) => editor === codeEditor,
    });

    expect(session.setMode).not.toHaveBeenCalled();
  });

  it('uses the session property when getSession returns null', async () => {
    const session = { setMode: vi.fn() };
    const codeEditor = createAceEditor({
      getSession: vi.fn(() => null),
      session,
    });

    await setAceEditorMode({
      codeEditor,
      language: 'python',
      isCurrentEditor: (editor) => editor === codeEditor,
    });

    expect(session.setMode).toHaveBeenCalledWith('ace/mode/python');
  });

  it('does not throw when Ace has no session during initialization', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const codeEditor = createAceEditor({
      getSession: vi.fn(() => null),
    });

    await expect(
      setAceEditorMode({
        codeEditor,
        language: 'python',
        isCurrentEditor: (editor) => editor === codeEditor,
      }),
    ).resolves.toBeUndefined();

    expect(warnSpy).not.toHaveBeenCalled();
    warnSpy.mockRestore();
  });

  it('ignores stale async language loads after the editor changes', async () => {
    let resolveLangs: (value: Set<string>) => void = () => {};
    mockGetAceLangs.mockReturnValueOnce(
      new Promise<Set<string>>((resolve) => {
        resolveLangs = resolve;
      }),
    );
    const session = { setMode: vi.fn() };
    const codeEditor = createAceEditor({ session });
    const nextEditor = createAceEditor({ session: { setMode: vi.fn() } });
    let currentEditor = codeEditor;

    const modePromise = setAceEditorMode({
      codeEditor,
      language: 'python',
      isCurrentEditor: (editor) => editor === currentEditor,
    });
    currentEditor = nextEditor;
    resolveLangs(new Set(['python']));
    await modePromise;

    expect(session.setMode).not.toHaveBeenCalled();
  });
});
