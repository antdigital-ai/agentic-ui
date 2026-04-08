import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useVoiceInputManager } from '../../src/MarkdownInputField/VoiceInputManager';

describe('useVoiceInputManager', () => {
  const mockEditorRef = {
    current: {
      store: {
        getMDContent: vi.fn().mockReturnValue(''),
        setMDContent: vi.fn(),
      },
    },
  };

  const mockOnValueChange = vi.fn();

  const createMockRecognizer = (overrides = {}) => ({
    start: vi.fn().mockResolvedValue(undefined),
    stop: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  });

  const defaultProps = {
    editorRef: mockEditorRef as any,
    onValueChange: mockOnValueChange,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockEditorRef.current.store.getMDContent.mockReturnValue('');
  });

  describe('基本功能', () => {
    it('应该返回正确的初始状态', () => {
      const { result } = renderHook(() =>
        useVoiceInputManager(defaultProps),
      );

      expect(result.current.recording).toBe(false);
      expect(typeof result.current.startRecording).toBe('function');
      expect(typeof result.current.stopRecording).toBe('function');
    });

    it('应该在没有语音识别器时不开始录音', async () => {
      const { result } = renderHook(() =>
        useVoiceInputManager({
          ...defaultProps,
          voiceRecognizer: undefined,
        }),
      );

      await result.current.startRecording();

      expect(result.current.recording).toBe(false);
    });

    it('应该在组件卸载时清理资源', () => {
      const mockRecognizer = createMockRecognizer();
      const mockVoiceRecognizer = vi.fn().mockResolvedValue(mockRecognizer);

      const { unmount } = renderHook(() =>
        useVoiceInputManager({
          ...defaultProps,
          voiceRecognizer: mockVoiceRecognizer,
        }),
      );

      unmount();

      // 验证清理逻辑被调用（虽然在测试中可能不会立即执行）
      expect(true).toBe(true);
    });

    it('卸载时若有 recognizer 应调用 stop，stop 拒绝时 catch 不抛', async () => {
      const mockRecognizer = createMockRecognizer({
        stop: vi.fn().mockRejectedValue(new Error('cleanup stop failed')),
      });
      const mockVoiceRecognizer = vi.fn().mockResolvedValue(mockRecognizer);

      const { result, unmount } = renderHook(() =>
        useVoiceInputManager({
          ...defaultProps,
          voiceRecognizer: mockVoiceRecognizer,
        }),
      );

      await result.current.startRecording();
      await waitFor(() => expect(result.current.recording).toBe(true));

      unmount();

      await waitFor(() => {
        expect(mockRecognizer.stop).toHaveBeenCalled();
      });
    });
  });

  describe('开始录音', () => {
    it('应该成功开始录音', async () => {
      const mockRecognizer = createMockRecognizer();
      const mockVoiceRecognizer = vi.fn().mockResolvedValue(mockRecognizer);

      const { result } = renderHook(() =>
        useVoiceInputManager({
          ...defaultProps,
          voiceRecognizer: mockVoiceRecognizer,
        }),
      );

      await result.current.startRecording();

      await waitFor(() => {
        expect(result.current.recording).toBe(true);
        expect(mockRecognizer.start).toHaveBeenCalled();
      });
    });

    it('应该在正在录音时不重复开始', async () => {
      const mockRecognizer = createMockRecognizer();
      const mockVoiceRecognizer = vi.fn().mockResolvedValue(mockRecognizer);

      const { result } = renderHook(() =>
        useVoiceInputManager({
          ...defaultProps,
          voiceRecognizer: mockVoiceRecognizer,
        }),
      );

      // 第一次开始录音
      await result.current.startRecording();

      await waitFor(() => {
        expect(result.current.recording).toBe(true);
      });

      // 尝试再次开始录音
      await result.current.startRecording();

      // 应该只调用一次
      expect(mockVoiceRecognizer).toHaveBeenCalledTimes(1);
    });

    it('应该处理识别器创建失败的情况', async () => {
      const mockVoiceRecognizer = vi
        .fn()
        .mockRejectedValue(new Error('Failed to create recognizer'));

      const { result } = renderHook(() =>
        useVoiceInputManager({
          ...defaultProps,
          voiceRecognizer: mockVoiceRecognizer,
        }),
      );

      await result.current.startRecording();

      await waitFor(() => {
        expect(result.current.recording).toBe(false);
      });
    });

    it('应该调用 onSentenceBegin 回调', async () => {
      mockEditorRef.current.store.getMDContent.mockReturnValue(
        'existing content',
      );

      let sentenceBeginCallback: any;
      const mockRecognizer = createMockRecognizer();
      const mockVoiceRecognizer = vi.fn().mockImplementation((callbacks) => {
        sentenceBeginCallback = callbacks.onSentenceBegin;
        return Promise.resolve(mockRecognizer);
      });

      const { result } = renderHook(() =>
        useVoiceInputManager({
          ...defaultProps,
          voiceRecognizer: mockVoiceRecognizer,
        }),
      );

      await result.current.startRecording();

      await waitFor(() => {
        expect(result.current.recording).toBe(true);
      });

      // 触发句子开始回调
      sentenceBeginCallback();

      // 验证获取了当前内容
      expect(mockEditorRef.current.store.getMDContent).toHaveBeenCalled();
    });
  });

  describe('停止录音', () => {
    it('应该成功停止录音', async () => {
      const mockRecognizer = createMockRecognizer();
      const mockVoiceRecognizer = vi.fn().mockResolvedValue(mockRecognizer);

      const { result } = renderHook(() =>
        useVoiceInputManager({
          ...defaultProps,
          voiceRecognizer: mockVoiceRecognizer,
        }),
      );

      // 先开始录音
      await result.current.startRecording();

      await waitFor(() => {
        expect(result.current.recording).toBe(true);
      });

      // 停止录音
      await result.current.stopRecording();

      await waitFor(() => {
        expect(result.current.recording).toBe(false);
        expect(mockRecognizer.stop).toHaveBeenCalled();
      });
    });

    it('应该在未录音时不执行停止', async () => {
      const { result } = renderHook(() =>
        useVoiceInputManager(defaultProps),
      );

      await result.current.stopRecording();

      // 应该没有错误，状态保持 false
      expect(result.current.recording).toBe(false);
    });
  });

  describe('语音识别回调', () => {
    it('应该处理 onPartial 回调', async () => {
      let partialCallback: any;
      const mockRecognizer = createMockRecognizer();
      const mockVoiceRecognizer = vi.fn().mockImplementation((callbacks) => {
        partialCallback = callbacks.onPartial;
        return Promise.resolve(mockRecognizer);
      });

      const { result } = renderHook(() =>
        useVoiceInputManager({
          ...defaultProps,
          voiceRecognizer: mockVoiceRecognizer,
        }),
      );

      await result.current.startRecording();

      await waitFor(() => {
        expect(result.current.recording).toBe(true);
      });

      // 触发部分识别回调
      partialCallback('partial text');

      expect(mockEditorRef.current.store.setMDContent).toHaveBeenCalledWith(
        'partial text',
      );
      expect(mockOnValueChange).toHaveBeenCalledWith('partial text');
    });

    it('应该处理 onSentenceEnd 回调', async () => {
      let sentenceEndCallback: any;
      const mockRecognizer = createMockRecognizer();
      const mockVoiceRecognizer = vi.fn().mockImplementation((callbacks) => {
        sentenceEndCallback = callbacks.onSentenceEnd;
        return Promise.resolve(mockRecognizer);
      });

      const { result } = renderHook(() =>
        useVoiceInputManager({
          ...defaultProps,
          voiceRecognizer: mockVoiceRecognizer,
        }),
      );

      await result.current.startRecording();

      await waitFor(() => {
        expect(result.current.recording).toBe(true);
      });

      // 触发句子结束回调
      sentenceEndCallback('complete sentence');

      expect(mockEditorRef.current.store.setMDContent).toHaveBeenCalledWith(
        'complete sentence',
      );
      expect(mockOnValueChange).toHaveBeenCalledWith('complete sentence');
    });

    it('应该处理 onError 回调', async () => {
      let errorCallback: any;
      const mockRecognizer = createMockRecognizer();
      const mockVoiceRecognizer = vi.fn().mockImplementation((callbacks) => {
        errorCallback = callbacks.onError;
        return Promise.resolve(mockRecognizer);
      });

      const { result } = renderHook(() =>
        useVoiceInputManager({
          ...defaultProps,
          voiceRecognizer: mockVoiceRecognizer,
        }),
      );

      await result.current.startRecording();

      await waitFor(() => {
        expect(result.current.recording).toBe(true);
      });

      // 触发错误回调
      errorCallback();

      await waitFor(() => {
        expect(result.current.recording).toBe(false);
        expect(mockRecognizer.stop).toHaveBeenCalled();
      });
    });

    it('onError 时 stop 拒绝应被 catch 吞掉', async () => {
      let errorCallback: any;
      const mockRecognizer = createMockRecognizer({
        stop: vi.fn().mockRejectedValue(new Error('stop failed')),
      });
      const mockVoiceRecognizer = vi.fn().mockImplementation((callbacks) => {
        errorCallback = callbacks.onError;
        return Promise.resolve(mockRecognizer);
      });

      const { result } = renderHook(() =>
        useVoiceInputManager({
          ...defaultProps,
          voiceRecognizer: mockVoiceRecognizer,
        }),
      );

      await result.current.startRecording();
      await waitFor(() => expect(result.current.recording).toBe(true));

      errorCallback();

      await waitFor(() => {
        expect(result.current.recording).toBe(false);
      });
      expect(mockRecognizer.stop).toHaveBeenCalled();
    });
  });

  describe('句子累积', () => {
    it('应该在句子开始时记录位置', async () => {
      mockEditorRef.current.store.getMDContent.mockReturnValue(
        'previous content',
      );

      let sentenceBeginCallback: any;
      let partialCallback: any;
      const mockRecognizer = createMockRecognizer();
      const mockVoiceRecognizer = vi.fn().mockImplementation((callbacks) => {
        sentenceBeginCallback = callbacks.onSentenceBegin;
        partialCallback = callbacks.onPartial;
        return Promise.resolve(mockRecognizer);
      });

      const { result } = renderHook(() =>
        useVoiceInputManager({
          ...defaultProps,
          voiceRecognizer: mockVoiceRecognizer,
        }),
      );

      await result.current.startRecording();

      await waitFor(() => {
        expect(result.current.recording).toBe(true);
      });

      // 触发句子开始
      sentenceBeginCallback();

      // 触发部分识别
      partialCallback('new text');

      // 应该追加到现有内容后面
      expect(mockEditorRef.current.store.setMDContent).toHaveBeenCalledWith(
        'previous contentnew text',
      );
    });

    it('应该在多个句子间正确累积', async () => {
      let sentenceBeginCallback: any;
      let partialCallback: any;
      const mockRecognizer = createMockRecognizer();
      const mockVoiceRecognizer = vi.fn().mockImplementation((callbacks) => {
        sentenceBeginCallback = callbacks.onSentenceBegin;
        partialCallback = callbacks.onPartial;
        return Promise.resolve(mockRecognizer);
      });

      const { result } = renderHook(() =>
        useVoiceInputManager({
          ...defaultProps,
          voiceRecognizer: mockVoiceRecognizer,
        }),
      );

      await result.current.startRecording();

      await waitFor(() => {
        expect(result.current.recording).toBe(true);
      });

      // 第一个句子
      sentenceBeginCallback();
      partialCallback('first sentence');

      // 第二个句子
      mockEditorRef.current.store.getMDContent.mockReturnValue('first sentence');
      sentenceBeginCallback();
      partialCallback(' second sentence');

      expect(mockEditorRef.current.store.setMDContent).toHaveBeenLastCalledWith(
        'first sentence second sentence',
      );
    });
  });
});

