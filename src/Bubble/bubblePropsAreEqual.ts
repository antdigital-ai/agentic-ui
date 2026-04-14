/**
 * Bubble 自定义 memo 比较（见 Bubble.tsx）。
 *
 * 维护约定：
 * - 在 BubbleProps 上新增「会影响渲染」的字段时，必须在此补充比较逻辑，否则可能漏更新。
 * - `markdownRenderConfig` / `bubbleRenderConfig` / `docListProps` / `customConfig`：按**顶层键**浅比较；
 *   顶层值为普通对象时再浅比较一层；数组与函数仍按引用比较。父组件用 `useMemo` 稳定子对象引用更佳。
 * - `originData`：按列出的标量与引用字段比较；`meta` 顶层浅比较；`meta.metadata` 再浅比较一层。
 *   对 `extra` 等对象请勿原地 mutate，应替换引用，否则可能与 `extra !==` 不一致（若仅改嵌套且未换引用会漏更新）。
 */
import type { BubbleMetaData, BubbleProps, MessageBubbleData } from './type';

export const shallowEqualRecord = (
  a: Record<string, unknown> | undefined | null,
  b: Record<string, unknown> | undefined | null,
): boolean => {
  if (a === b) return true;
  if (!a || !b) return !a && !b;
  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  if (keysA.length !== keysB.length) return false;
  for (const k of keysA) {
    if ((a as Record<string, unknown>)[k] !== (b as Record<string, unknown>)[k]) {
      return false;
    }
  }
  return true;
};

export const shallowEqualStyles = (
  a: BubbleProps['styles'] | undefined,
  b: BubbleProps['styles'] | undefined,
): boolean => {
  if (a === b) return true;
  if (!a || !b) return !a && !b;
  const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
  for (const k of keys) {
    const va = (a as Record<string, unknown>)[k];
    const vb = (b as Record<string, unknown>)[k];
    if (va === vb) continue;
    if (
      va &&
      vb &&
      typeof va === 'object' &&
      typeof vb === 'object' &&
      !Array.isArray(va) &&
      !Array.isArray(vb)
    ) {
      if (!shallowEqualRecord(va as Record<string, unknown>, vb as Record<string, unknown>)) {
        return false;
      }
    } else {
      return false;
    }
  }
  return true;
};

const shallowEqualClassNames = (
  a: BubbleProps['classNames'] | undefined,
  b: BubbleProps['classNames'] | undefined,
): boolean => {
  if (a === b) return true;
  if (!a || !b) return !a && !b;
  const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
  for (const k of keys) {
    if ((a as Record<string, unknown>)[k] !== (b as Record<string, unknown>)[k]) {
      return false;
    }
  }
  return true;
};

/** 配置型 props：顶层浅比较；顶层值为非数组对象时再浅比较一层 */
const shallowEqualConfigObject = (
  a: object | undefined | null,
  b: object | undefined | null,
): boolean => {
  if (a === b) return true;
  if (!a || !b) return !a && !b;
  const ra = a as Record<string, unknown>;
  const rb = b as Record<string, unknown>;
  const keys = new Set([...Object.keys(ra), ...Object.keys(rb)]);
  for (const k of keys) {
    if (!(k in ra) || !(k in rb)) return false;
    const va = ra[k];
    const vb = rb[k];
    if (va === vb) continue;
    if (
      va &&
      vb &&
      typeof va === 'object' &&
      typeof vb === 'object' &&
      !Array.isArray(va) &&
      !Array.isArray(vb)
    ) {
      if (!shallowEqualRecord(va as Record<string, unknown>, vb as Record<string, unknown>)) {
        return false;
      }
    } else {
      return false;
    }
  }
  return true;
};

const metaAffectsBubble = (m: BubbleMetaData | undefined): boolean =>
  Boolean(
    m?.avatar ||
      m?.title ||
      m?.name ||
      m?.description ||
      m?.backgroundColor ||
      (m?.metadata && Object.keys(m.metadata).length > 0),
  );

const metaEqualForMemo = (a: BubbleMetaData | undefined, b: BubbleMetaData | undefined): boolean => {
  if (a === b) return true;
  if (!shallowEqualRecord((a || {}) as Record<string, unknown>, (b || {}) as Record<string, unknown>)) {
    return false;
  }
  const ma = a?.metadata;
  const mb = b?.metadata;
  if (ma === mb) return true;
  if (!ma || !mb) return !ma && !mb;
  return shallowEqualRecord(ma as Record<string, unknown>, mb as Record<string, unknown>);
};

const originDataEqualForMemo = (
  a: MessageBubbleData | undefined,
  b: MessageBubbleData | undefined,
): boolean => {
  if (a === b) return true;
  if (!a || !b) return false;
  if (
    a.id !== b.id ||
    a.role !== b.role ||
    a.content !== b.content ||
    a.isFinished !== b.isFinished ||
    a.isAborted !== b.isAborted ||
    a.isLast !== b.isLast ||
    a.isLatest !== b.isLatest ||
    a.updateAt !== b.updateAt ||
    a.createAt !== b.createAt ||
    a.feedback !== b.feedback ||
    a.originContent !== b.originContent ||
    a.fileMap !== b.fileMap ||
    a.extra !== b.extra ||
    a.error !== b.error
  ) {
    return false;
  }
  if (a.meta === b.meta) return true;
  if (!metaAffectsBubble(a.meta) && !metaAffectsBubble(b.meta)) return true;
  return metaEqualForMemo(a.meta, b.meta);
};

const preMessageEqualForMemo = (
  a: MessageBubbleData | undefined,
  b: MessageBubbleData | undefined,
): boolean => {
  if (a === b) return true;
  if (!a || !b) return false;
  return a.id === b.id && a.role === b.role;
};

const depsArrayEqual = (a: unknown[] | undefined, b: unknown[] | undefined): boolean => {
  if (a === b) return true;
  if (!a || !b) return !a && !b;
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
};

/**
 * Custom props comparator for Bubble memo.
 * BubbleList (and callers) often pass fresh object references for styles / classNames / avatar
 * while message data is unchanged; default shallow compare would still re-render every parent tick.
 */
export const bubblePropsAreEqual = (
  prev: BubbleProps & { deps?: unknown[] },
  next: BubbleProps & { deps?: unknown[] },
): boolean => {
  if (prev === next) return true;

  if (prev.id !== next.id) return false;
  if (prev.placement !== next.placement) return false;
  if (prev.pure !== next.pure) return false;
  if (prev.readonly !== next.readonly) return false;
  if (prev.time !== next.time) return false;
  if (prev.shouldShowVoice !== next.shouldShowVoice) return false;
  if (prev.renderMode !== next.renderMode) return false;
  if (prev.renderType !== next.renderType) return false;

  if (prev.shouldShowCopy !== next.shouldShowCopy) return false;
  if (typeof prev.shouldShowCopy === 'function' || typeof next.shouldShowCopy === 'function') {
    if (prev.shouldShowCopy !== next.shouldShowCopy) return false;
  }

  if (!originDataEqualForMemo(prev.originData, next.originData)) return false;
  if (!preMessageEqualForMemo(prev.preMessage, next.preMessage)) return false;

  if (
    !shallowEqualConfigObject(
      prev.markdownRenderConfig as object | undefined,
      next.markdownRenderConfig as object | undefined,
    )
  ) {
    return false;
  }
  if (
    !shallowEqualConfigObject(
      prev.bubbleRenderConfig as object | undefined,
      next.bubbleRenderConfig as object | undefined,
    )
  ) {
    return false;
  }
  if (!shallowEqualConfigObject(prev.docListProps as object | undefined, next.docListProps as object | undefined)) {
    return false;
  }
  if (!shallowEqualConfigObject(prev.customConfig as object | undefined, next.customConfig as object | undefined)) {
    return false;
  }
  if (prev.bubbleListRef !== next.bubbleListRef) return false;
  if (prev.bubbleRef !== next.bubbleRef) return false;

  if (prev.avatar === next.avatar) {
    // ok
  } else if (!shallowEqualRecord(prev.avatar as any, next.avatar as any)) {
    return false;
  }

  if (!shallowEqualStyles(prev.styles, next.styles)) return false;
  if (!shallowEqualClassNames(prev.classNames, next.classNames)) return false;

  if (prev.style !== next.style) {
    if (
      !shallowEqualRecord(
        (prev.style || {}) as Record<string, unknown>,
        (next.style || {}) as Record<string, unknown>,
      )
    ) {
      return false;
    }
  }
  if (prev.className !== next.className) return false;

  if (prev.onReply !== next.onReply) return false;
  if (prev.onDisLike !== next.onDisLike) return false;
  if (prev.onDislike !== next.onDislike) return false;
  if (prev.onLike !== next.onLike) return false;
  if (prev.onCancelLike !== next.onCancelLike) return false;
  if (prev.onLikeCancel !== next.onLikeCancel) return false;
  if (prev.onAvatarClick !== next.onAvatarClick) return false;
  if (prev.onDoubleClick !== next.onDoubleClick) return false;

  if (prev.useSpeech !== next.useSpeech) return false;
  if (prev.fileViewEvents !== next.fileViewEvents) return false;
  if (prev.fileViewConfig !== next.fileViewConfig) return false;
  if (prev.renderFileMoreAction !== next.renderFileMoreAction) return false;

  if (prev.userBubbleProps !== next.userBubbleProps) return false;
  if (prev.aiBubbleProps !== next.aiBubbleProps) return false;
  if (prev.aIBubbleProps !== next.aIBubbleProps) return false;

  if (!depsArrayEqual(prev.deps, next.deps)) return false;

  return true;
};
