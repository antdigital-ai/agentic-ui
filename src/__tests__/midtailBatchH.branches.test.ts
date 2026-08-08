/**
 * Midtail batch H（exclusive #7）：Utils / Attachment / mermaid / History data 纯函数矩阵。
 * 避开 FileComponent / Editor / charts / SchemaForm / store。
 */
import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  isAttachmentFileLoading,
  isFileMetaPlaceholderState,
  isImageFile,
  isMediaFile,
  isVideoFile,
  kbToSize,
} from '../MarkdownInputField/AttachmentButton/utils';
import {
  applyMermaidTheme,
  cleanupTempElement,
  createMermaidThemeConfig,
  renderSvgToContainer,
} from '../Plugins/mermaid/utils';
import {
  createConfiguredSandbox,
  DEFAULT_SANDBOX_CONFIG,
  DEFAULT_SECURITY_CONFIG,
  quickExecute,
  safeMathEval,
  SandboxHealthChecker,
  sandboxHealthChecker,
} from '../Utils/proxySandbox';
import {
  hasDangerousUrlScheme,
  looksLikeHtmlSnippet,
  serializeHastElement,
  shouldRenderUrlAsPlainText,
} from '../Utils/htmlUrlSafety';
import { useHistoryData } from '../History/hooks/useHistoryData';

describe('midtail batch H pure branches', () => {
  afterEach(() => {
    document.body.innerHTML = '';
    vi.restoreAllMocks();
  });

  it('kbToSize / isImage / isVideo / isMedia / placeholder 矩阵', () => {
    expect(kbToSize(0)).toBe('0 B');
    expect(kbToSize(-1)).toBe('0 B');
    expect(kbToSize(0.5)).toMatch(/B$/);
    expect(kbToSize(1)).toMatch(/KB/);
    expect(kbToSize(1024)).toMatch(/MB/);
    expect(kbToSize(1048576)).toMatch(/GB/);

    expect(isImageFile({ type: 'image/png', name: 'x.bin' } as File)).toBe(
      true,
    );
    expect(isImageFile({ type: '', name: 'pic.JPEG' } as File)).toBe(true);
    expect(isImageFile({ type: 'text/plain', name: 'a.txt' } as File)).toBe(
      false,
    );

    expect(isVideoFile({ type: 'video/mp4', name: 'x' } as File)).toBe(true);
    expect(isVideoFile({ type: '', name: 'clip.MOV' } as File)).toBe(true);
    expect(
      isVideoFile({
        type: '',
        name: 'x.bin',
        url: 'https://cdn/a.mp4?token=1',
      } as any),
    ).toBe(true);
    expect(isVideoFile({ type: '', name: 'a.txt' } as File)).toBe(false);
    expect(isMediaFile({ type: 'image/gif', name: 'g' } as File)).toBe(true);
    expect(isMediaFile({ type: '', name: 'doc.pdf' } as File)).toBe(false);

    expect(isAttachmentFileLoading('uploading')).toBe(true);
    expect(isAttachmentFileLoading('pending')).toBe(true);
    expect(isAttachmentFileLoading('done')).toBe(false);
    expect(isAttachmentFileLoading(null)).toBe(false);

    expect(
      isFileMetaPlaceholderState({
        status: 'done',
        name: 'a',
      } as any),
    ).toBe(true);
    expect(
      isFileMetaPlaceholderState({
        status: 'uploading',
        name: 'a',
      } as any),
    ).toBe(false);
    expect(
      isFileMetaPlaceholderState({
        status: 'done',
        url: 'https://x',
        name: 'a',
      } as any),
    ).toBe(false);
    expect(
      isFileMetaPlaceholderState({ name: 'a' } as any),
    ).toBe(false);
  });

  it('createConfiguredSandbox / DEFAULT configs / safeMathEval / quickExecute', async () => {
    expect(DEFAULT_SANDBOX_CONFIG.allowConsole).toBe(true);
    expect(DEFAULT_SECURITY_CONFIG.permissions?.network).toBe(false);

    const basic = createConfiguredSandbox('basic');
    const secure = createConfiguredSandbox('secure');
    const restricted = createConfiguredSandbox('restricted');
    const fallback = createConfiguredSandbox('unknown' as any);
    expect(basic).toBeTruthy();
    expect(secure).toBeTruthy();
    expect(restricted).toBeTruthy();
    expect(fallback).toBeTruthy();
    basic.destroy();
    secure.destroy();
    restricted.destroy();
    fallback.destroy();

    await expect(safeMathEval('1+2*3')).resolves.toBe(7);
    await expect(safeMathEval('abs(-4)')).resolves.toBe(4);
    await expect(safeMathEval('evil();')).rejects.toThrow(/unsafe/i);
    await expect(safeMathEval('"x"')).rejects.toThrow(/unsafe/i);

    await expect(quickExecute('return 2+2')).resolves.toBe(4);
    await expect(quickExecute('throw new Error("boom")')).rejects.toThrow(
      /boom|failed/i,
    );
  });

  it('SandboxHealthChecker：单例 / support / basic tests', async () => {
    const a = SandboxHealthChecker.getInstance();
    const b = SandboxHealthChecker.getInstance();
    expect(a).toBe(b);
    expect(sandboxHealthChecker).toBe(a);

    const support = a.checkEnvironmentSupport();
    expect(support.supported).toBe(true);
    expect(Array.isArray(support.issues)).toBe(true);

    const basic = await a.testBasicFunctionality();
    expect(basic.results.basicExecution).toBe(true);
    expect(typeof basic.passed).toBe('boolean');
  });

  it('mermaid theme：rgba / 无效色 / dark 默认填充 / apply / render / cleanup', () => {
    const viaRgba = createMermaidThemeConfig({
      colorBgContainer: 'rgba(10, 10, 10, 0.9)',
    });
    expect(viaRgba.darkMode).toBe(true);

    const invalid = createMermaidThemeConfig({
      colorBgContainer: 'not-a-color',
      colorText: '#111111',
    });
    expect(invalid.darkMode).toBe(false);

    const darkDefaults = createMermaidThemeConfig({
      colorBgContainer: '#0a0a0a',
    });
    expect(darkDefaults.themeVariables.background).toBeTruthy();
    expect(darkDefaults.themeVariables.textColor).toBeTruthy();

    const lightDefaults = createMermaidThemeConfig({});
    expect(lightDefaults.darkMode).toBe(false);

    const initialize = vi.fn();
    applyMermaidTheme({ initialize } as any);
    applyMermaidTheme({ initialize } as any, darkDefaults);
    expect(initialize).toHaveBeenCalledTimes(2);

    const container = document.createElement('div');
    renderSvgToContainer(
      '<svg style="color:red"><circle /></svg>',
      container,
    );
    expect(container.querySelector('[data-mermaid-svg]')).toBeTruthy();

    cleanupTempElement('missing-h');
    const el = document.createElement('div');
    el.id = 'dclean-h';
    document.body.appendChild(el);
    cleanupTempElement('clean-h');
    expect(document.getElementById('dclean-h')).toBeNull();
  });

  it('htmlUrlSafety：危险 scheme / snippet / serialize 边界', () => {
    expect(hasDangerousUrlScheme('JaVaScRiPt:alert(1)')).toBe(true);
    expect(hasDangerousUrlScheme('data:text/html,x')).toBe(true);
    expect(hasDangerousUrlScheme('https://ok')).toBe(false);
    expect(shouldRenderUrlAsPlainText('vbscript:x')).toBe(true);
    expect(looksLikeHtmlSnippet('<img src=x>')).toBe(true);
    expect(
      serializeHastElement({
        tagName: 'br',
        properties: { className: undefined },
      }),
    ).toBe('<br>');
  });

  it('useHistoryData：无 request / 非数组 / 相等 bail-out / 失败清空', async () => {
    const { result, rerender } = renderHook(
      ({ request, agentId }) => useHistoryData({ request, agentId } as any),
      { initialProps: { request: undefined as any, agentId: 'a1' } },
    );
    await act(async () => {
      await result.current.loadHistory();
    });
    expect(result.current.chatList).toEqual([]);

    const item = {
      sessionId: 's1',
      gmtCreate: 1,
      isFavorite: false,
      sessionTitle: 't',
      status: 'idle',
    };
    const request = vi.fn().mockResolvedValue([item]);
    rerender({ request, agentId: 'a1' });
    await act(async () => {
      await result.current.loadHistory();
    });
    expect(result.current.chatList).toHaveLength(1);
    const firstRef = result.current.chatList;

    request.mockResolvedValue([{ ...item }]);
    await act(async () => {
      await result.current.loadHistory();
    });
    expect(result.current.chatList).toBe(firstRef);

    request.mockResolvedValue(null);
    await act(async () => {
      await result.current.loadHistory();
    });
    expect(result.current.chatList).toEqual([]);

    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    request.mockRejectedValue(new Error('net'));
    await act(async () => {
      await result.current.loadHistory();
    });
    expect(result.current.chatList).toEqual([]);
    errSpy.mockRestore();
  });
});
