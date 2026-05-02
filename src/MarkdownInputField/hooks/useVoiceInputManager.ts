import { useEffect, useRef, useState } from 'react';
import { useRefFunction } from '../../Hooks/useRefFunction';
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
 * @description 封装语音输入相关的逻辑，包括录音控制、语音识别等。
 * 历史位置 `src/MarkdownInputField/VoiceInputManager/index.tsx` 现仅作为
 * re-export 兼容层；新代码请直接从本文件导入。
 */
export const useVoiceInputManager = ({
  voiceRecognizer,
  editorRef,
  onValueChange,
}: VoiceInputManagerProps): VoiceInputManagerReturn => {
  const [recording, setRecording] = useState(false);
  const recognizerRef = useRef<VoiceRecognizer | null>(null);
  // 标记是否处于「正在启动」状态：start 已发起、recognizer 尚未完成 await
  const startingRef = useRef(false);
  // 取消标志：start 进行中收到 stop 请求时置为 true，start 完成后立即 stop 并不进入录音态
  const cancelStartRef = useRef(false);
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
   *
   * 关键保证：start 期间若外部调用了 stopRecording，会通过 cancelStartRef
   * 通知本函数在 recognizer 创建完成后立即停止并清理，不进入 recording=true，
   * 避免「start 还在 await，stop 直接被忽略」造成的 recognizer 泄漏。
   */
  const startRecording = useRefFunction(async () => {
    if (!voiceRecognizer) return;
    if (recording || startingRef.current) return;
    startingRef.current = true;
    cancelStartRef.current = false;
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
        },
      });
      recognizerRef.current = recognizer;
      // 若 await 期间被 cancel，立即停止并清理，不进入录音态
      if (cancelStartRef.current) {
        await recognizer.stop?.().catch(() => void 0);
        recognizerRef.current = null;
        return;
      }
      await recognizer.start();
      // start 也可能耗时；再次检查取消标志
      if (cancelStartRef.current) {
        await recognizer.stop?.().catch(() => void 0);
        recognizerRef.current = null;
        return;
      }
      setRecording(true);
    } catch (e) {
      recognizerRef.current = null;
    } finally {
      startingRef.current = false;
      cancelStartRef.current = false;
    }
  });

  /**
   * 停止录音
   *
   * 兼容三种状态：
   * 1. recording=true：正常停止；
   * 2. recording=false 且 startingRef=true：start 还在 await，置 cancelStartRef，
   *    交由 startRecording 在 await 完成后立即清理；
   * 3. 其他：no-op。
   */
  const stopRecording = useRefFunction(async () => {
    if (startingRef.current) {
      cancelStartRef.current = true;
      return;
    }
    if (!recording) return;
    try {
      await recognizerRef.current?.stop();
    } finally {
      setRecording(false);
      recognizerRef.current = null;
    }
  });

  // 清理函数
  useEffect(() => {
    return () => {
      cancelStartRef.current = true;
      recognizerRef.current?.stop().catch(() => void 0);
    };
  }, []);

  return {
    recording,
    startRecording,
    stopRecording,
  };
};
