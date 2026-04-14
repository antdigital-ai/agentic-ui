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

const metaAffectsBubble = (m: BubbleMetaData | undefined): boolean =>
  Boolean(m?.avatar || m?.title || m?.name || m?.description || m?.backgroundColor);

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
  return shallowEqualRecord(
    (a.meta || {}) as Record<string, unknown>,
    (b.meta || {}) as Record<string, unknown>,
  );
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

  if (prev.markdownRenderConfig !== next.markdownRenderConfig) return false;
  if (prev.bubbleRenderConfig !== next.bubbleRenderConfig) return false;
  if (prev.docListProps !== next.docListProps) return false;
  if (prev.customConfig !== next.customConfig) return false;
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
