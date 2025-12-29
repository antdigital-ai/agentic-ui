import { useEffect, useRef, useState } from 'react';
import { useRefFunction } from '../../hooks/useRefFunction';
import type { MarkdownEditorInstance } from '../../MarkdownEditor';
import type { CreateRecognizer, VoiceRecognizer } from '../VoiceInput';

export interface VoiceInputManagerProps {
  /** 语音识别器创建函数 */
  voiceRecognizer?: CreateRecognizer;

  /** Markdown 编辑器实例 */
  editorRef?: React.MutableRefObject<MarkdownEditorInstance | undefined>;

  /** 值变化回调 */
  onValueChange?: (value: string) => void;
}

export interface VoiceInputManagerReturn {
  /** 是否正在录音 */
  recording: boolean;

  /** 开始录音 */
  startRecording: () => Promise<void>;

  /** 停止录音 */
  stopRecording: () => Promise<void>;
}

/**
 * 语音输入管理器
 *
 * @description 封装语音输入相关的逻辑，包括录音控制、语音识别等
 */
export const useVoiceInputManager = ({
  voiceRecognizer,
  editorRef,
  onValueChange,
}: VoiceInputManagerProps): VoiceInputManagerReturn => {
  const [recording, setRecording] = useState(false);
  const recognizerRef = useRef<VoiceRecognizer | null>(null);
  const pendingRef = useRef(false);
  // 句子开始索引
  const sentenceStartIndexRef = useRef<number>(0);

  /**
   * 更新当前句子
   */
  const updateCurrentSentence = useRefFunction((text: string) => {
    const currentAll = editorRef?.current?.store?.getMDContent() || '';
    const prefix = currentAll.slice(0, sentenceStartIndexRef.current);
    const next = `${prefix}${text}`;
    editorRef?.current?.store?.setMDContent(next);
    onValueChange?.(next);
  });

  /**
   * 开始录音
   */
  const startRecording = useRefFunction(async () => {
    if (!voiceRecognizer) return;
    if (recording || pendingRef.current) return;
    pendingRef.current = true;
    try {
      const recognizer = await voiceRecognizer({
        onSentenceBegin: () => {
          // 记录当前内容位置，重置本句累积
          const current = editorRef?.current?.store?.getMDContent() || '';
          sentenceStartIndexRef.current = current.length;
        },
        onPartial: updateCurrentSentence,
        onSentenceEnd: updateCurrentSentence,
        onError: () => {
          setRecording(false);
          recognizerRef.current?.stop?.().catch(() => void 0);
          recognizerRef.current = null;
          pendingRef.current = false;
        },
      });
      recognizerRef.current = recognizer;
      await recognizerRef.current.start();
      setRecording(true);
    } catch (e) {
      recognizerRef.current = null;
    } finally {
      pendingRef.current = false;
    }
  });

  /**
   * 停止录音
   */
  const stopRecording = useRefFunction(async () => {
    if (!recording || pendingRef.current) return;
    pendingRef.current = true;
    try {
      await recognizerRef.current?.stop();
    } finally {
      setRecording(false);
      recognizerRef.current = null;
      pendingRef.current = false;
    }
  });

  // 清理函数
  useEffect(() => {
    return () => {
      recognizerRef.current?.stop().catch(() => void 0);
    };
  }, []);

  return {
    recording,
    startRecording,
    stopRecording,
  };
};
