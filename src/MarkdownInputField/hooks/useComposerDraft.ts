import { useCallback, useEffect, useRef } from 'react';
import type { MarkdownEditorInstance } from '../../MarkdownEditor';

/**
 * 草稿提交原因（对齐 dtcoder-ide IDtcoderGlassDraftCommitReason）
 */
export type DraftCommitReason = 'idle' | 'blur' | 'send' | 'switch' | 'unmount';

export interface UseComposerDraftOptions {
  /**
   * 草稿身份 key（如 sessionId / conversationId）。
   * 变化时触发一次 'switch' commit + 新 key 的恢复。
   */
  draftKey?: string;
  /** 草稿持久化，默认 localStorage */
  storage?: Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;
  /** 存储 namespace，默认 'agentic-ui-composer-draft' */
  storageKeyPrefix?: string;
  /** idle 提交延时（ms），默认 180（对齐 IDLE_COMMIT_DELAY_MS） */
  idleDelay?: number;
  /**
   * 草稿提交回调（value 为当前 markdown 文本）。
   * 返回 false 表示宿主放弃本次草稿（如空内容）。
   */
  onDraftCommit?: (value: string, reason: DraftCommitReason) => boolean | void;
  /** 草稿恢复回调：返回 true 表示已由宿主恢复（hook 不再写入编辑器） */
  onDraftRestore?: (value: string) => boolean;
  /** 编辑器实例 ref */
  markdownEditorRef: React.MutableRefObject<
    MarkdownEditorInstance | null | undefined
  >;
}

const DEFAULT_PREFIX = 'agentic-ui-composer-draft';
const DEFAULT_IDLE_DELAY = 180;

const buildStorageKey = (prefix: string, draftKey: string) =>
  `${prefix}:${draftKey}`;

/** 最小存储接口（localStorage 满足；宿主可注入内存 map / sessionStorage 等） */
type DraftStorage = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

const readDraft = (
  storage: DraftStorage | undefined,
  key: string,
): string | null => {
  if (!storage || !key) return null;
  try {
    return storage.getItem(key);
  } catch {
    return null;
  }
};

const writeDraft = (
  storage: DraftStorage | undefined,
  key: string,
  value: string,
): void => {
  if (!storage || !key) return;
  try {
    if (value) {
      storage.setItem(key, value);
    } else {
      storage.removeItem(key);
    }
  } catch {
    // 写入失败（隐私模式 / 配额满）静默，草稿是尽力而为的增强能力
  }
};

/**
 * fragment 级草稿恢复（对齐 dtcoder-ide GlassComposerEditor draftRecovery）。
 *
 * 行为：
 * - 输入停顿 idleDelay 后自动 commit（reason: 'idle'），保证崩溃 / 刷新可恢复。
 * - blur / send / draftKey 切换 / unmount 时同步 commit。
 * - draftKey 变化时从 storage 读取新 key 的草稿并恢复到编辑器
 *   （编辑器当前非空则不覆盖，交由宿主 onDraftRestore 决策）。
 * - 显式 enable: false 时 hook 不做任何事。
 */
export const useComposerDraft = (options: UseComposerDraftOptions) => {
  const {
    draftKey,
    storage,
    storageKeyPrefix = DEFAULT_PREFIX,
    idleDelay = DEFAULT_IDLE_DELAY,
    onDraftCommit,
    onDraftRestore,
    markdownEditorRef,
  } = options;

  const enabled = !!draftKey;
  const resolvedStorage: DraftStorage | undefined =
    storage ?? (typeof localStorage !== 'undefined' ? localStorage : undefined);

  // ref 桥接回调，避免 timer 重建
  const commitRef = useRef(onDraftCommit);
  commitRef.current = onDraftCommit;
  const restoreRef = useRef(onDraftRestore);
  restoreRef.current = onDraftRestore;
  const editorRef = useRef(markdownEditorRef);
  editorRef.current = markdownEditorRef;

  const readCurrentMd = useCallback((): string => {
    try {
      return editorRef.current?.current?.store?.getMDContent?.() ?? '';
    } catch {
      return '';
    }
  }, []);

  const commit = useCallback(
    (reason: DraftCommitReason) => {
      if (!enabled || !draftKey) return;
      const value = readCurrentMd();
      const handled = commitRef.current?.(value, reason);
      // 宿主返回 false 表示自行接管持久化
      if (handled !== false) {
        writeDraft(
          resolvedStorage,
          buildStorageKey(storageKeyPrefix, draftKey),
          value,
        );
      }
    },
    [enabled, draftKey, readCurrentMd, resolvedStorage, storageKeyPrefix],
  );

  // idle 自动 commit：以「提交节流」实现，输入期间每帧重置
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scheduleIdleCommit = useCallback(() => {
    if (!enabled || idleDelay <= 0) return;
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    idleTimerRef.current = setTimeout(() => {
      idleTimerRef.current = null;
      commit('idle');
    }, idleDelay);
  }, [enabled, idleDelay, commit]);

  const flushIdle = useCallback(
    (reason: DraftCommitReason) => {
      if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current);
        idleTimerRef.current = null;
      }
      commit(reason);
    },
    [commit],
  );

  // draftKey 切换：commit 旧 key + 恢复新 key
  const prevKeyRef = useRef(draftKey);
  useEffect(() => {
    if (!enabled) return;
    const prevKey = prevKeyRef.current;
    prevKeyRef.current = draftKey;

    if (prevKey && prevKey !== draftKey) {
      // 先把旧 key 的内容落盘（用当前编辑器内容，unmount 场景下也是新值）
      commit('switch');
    }

    // 恢复新 key 的草稿
    if (draftKey) {
      const saved = readDraft(
        resolvedStorage,
        buildStorageKey(storageKeyPrefix, draftKey),
      );
      if (saved) {
        const current = readCurrentMd();
        const handledByHost = restoreRef.current?.(saved);
        if (!handledByHost && !current) {
          editorRef.current?.current?.store?.setMDContent(saved);
        }
      }
    }
    // 仅在 draftKey 变化时执行；commit 内部依赖经 ref 桥接保持最新
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draftKey, enabled]);

  // unmount：确保最后状态落盘
  useEffect(() => {
    if (!enabled) return;
    const keyRef = prevKeyRef;
    return () => {
      if (keyRef.current) {
        // unmount 时 commitRef / editorRef 仍是闭包初始引用，但 ref.current 可变，可读到最新
        const value = readCurrentMd();
        const handled = commitRef.current?.(value, 'unmount');
        if (handled !== false) {
          writeDraft(
            resolvedStorage,
            buildStorageKey(storageKeyPrefix, keyRef.current),
            value,
          );
        }
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);

  return {
    /** 通知草稿系统内容发生变化（输入 onChange 后调用），重排 idle timer */
    notifyInput: scheduleIdleCommit,
    /** 立即以指定原因提交草稿（send 前 / blur 时调用） */
    commitDraft: flushIdle,
  };
};
