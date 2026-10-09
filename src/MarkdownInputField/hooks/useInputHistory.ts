import React from 'react';
import type { MarkdownEditorInstance } from '../../MarkdownEditor';

/**
 * 输入历史单条记录
 */
export interface InputHistoryEntry {
  /** 用户输入的文本内容 */
  value: string;
  /** 发送时间戳 */
  timestamp: number;
}

interface UseInputHistoryParams {
  markdownEditorRef: React.MutableRefObject<
    MarkdownEditorInstance | null | undefined
  >;
  /** 同步外部受控值 */
  setValue: (value: string) => void;
  /** 历史记录上限，超过后移除最旧一条 */
  maxLength?: number;
}

/** 默认历史条数上限，与 VS Code chat widget 常用量级对齐 */
const DEFAULT_HISTORY_MAX_LENGTH = 100;

/**
 * 输入历史导航 Hook（对齐 dtcoder-ide 的 ChatHistoryNavigator）。
 *
 * 行为约定：
 * - 发送成功后自动 push 当前文本；
 * - 光标在文本起点时按 ↑ 回溯历史、按 ↓ 前进；
 * - 回溯前将当前未发送的编辑内容覆盖到"overlay"槽位，按 ↓ 可找回；
 * - 历史仅保存在内存（组件实例级），不跨会话持久化。
 */
export const useInputHistory = ({
  markdownEditorRef,
  setValue,
  maxLength = DEFAULT_HISTORY_MAX_LENGTH,
}: UseInputHistoryParams) => {
  // 历史栈：旧 → 新。用 ref 避免导航过程触发组件 re-render 导致编辑器选区抖动
  const historyRef = React.useRef<InputHistoryEntry[]>([]);
  // 当前索引，等于 history.length 时表示位于"新建输入"槽位
  const indexRef = React.useRef(0);
  // overlay 槽位：回溯历史时暂存当前编辑中的内容
  const overlayRef = React.useRef<string | null>(null);

  /** 是否已回溯到最新（即回到 overlay / 新建输入状态） */
  const isAtEnd = () => indexRef.current >= historyRef.current.length;

  /** 将当前编辑器内容写入 overlay 槽位（仅在回溯起点调用一次） */
  const saveCurrentAsOverlay = () => {
    const mdValue = markdownEditorRef.current?.store?.getMDContent() ?? '';
    if (mdValue) {
      overlayRef.current = mdValue;
    }
  };

  /** 把指定文本回填到编辑器，并同步受控状态 */
  const restoreValue = (value: string) => {
    markdownEditorRef.current?.store?.setMDContent(value);
    setValue(value);
  };

  /** 发送成功后记录一条历史，并重置导航游标 */
  const push = React.useCallback(
    (value: string) => {
      const trimmed = value.trim();
      if (!trimmed) return;
      // 与最近一条相同则不重复记录
      const last = historyRef.current[historyRef.current.length - 1];
      if (last?.value === trimmed) {
        indexRef.current = historyRef.current.length;
        overlayRef.current = null;
        return;
      }
      historyRef.current.push({
        value: trimmed,
        timestamp: Date.now(),
      });
      if (historyRef.current.length > maxLength) {
        historyRef.current.shift();
      }
      indexRef.current = historyRef.current.length;
      overlayRef.current = null;
    },
    [maxLength],
  );

  /**
   * 回溯上一条历史（↑）。
   * @returns 命中的历史文本；已在栈底或空历史时返回 undefined（调用方放行默认行为）
   */
  const previous = React.useCallback((): string | undefined => {
    if (historyRef.current.length === 0) return undefined;
    if (indexRef.current > 0) {
      // 首次回溯时暂存当前编辑内容
      if (isAtEnd()) {
        saveCurrentAsOverlay();
      }
      indexRef.current -= 1;
    } else {
      // 已在栈底：返回当前条且不移动，让调用方拦截换行
      return historyRef.current[0]?.value;
    }
    return historyRef.current[indexRef.current]?.value;
  }, []);

  /**
   * 前进到下一条历史（↓）。
   * @returns 命中的文本（可能是 overlay 暂存内容）；已在栈顶时返回 undefined
   */
  const next = React.useCallback((): string | undefined => {
    if (isAtEnd()) return undefined;
    indexRef.current += 1;
    if (isAtEnd()) {
      return overlayRef.current ?? '';
    }
    return historyRef.current[indexRef.current]?.value;
  }, []);

  /** 恢复 overlay / 清空导航状态（发送或外部清空内容时调用） */
  const reset = React.useCallback(() => {
    indexRef.current = historyRef.current.length;
    overlayRef.current = null;
  }, []);

  /** 把历史文本回填编辑器（键盘导航命中后调用） */
  const restore = React.useCallback(
    (value: string) => {
      restoreValue(value);
    },
    // restoreValue 依赖闭包内 refs 与外部回调，均通过闭包读取最新值
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [setValue],
  );

  /** 清空全部历史 */
  const clear = React.useCallback(() => {
    historyRef.current = [];
    indexRef.current = 0;
    overlayRef.current = null;
  }, []);

  return {
    push,
    previous,
    next,
    reset,
    restore,
    clear,
    isAtEnd,
  };
};
