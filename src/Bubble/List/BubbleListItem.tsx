import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { MessageBubbleData } from '../type';
import type { BubbleListProps } from './index';

interface BubbleListItemProps {
  children: React.ReactNode;
  className?: string;
  lazy?: BubbleListProps['lazy'];
  shouldLazyLoad: boolean;
  index: number;
  total: number;
  role: MessageBubbleData['role'];
  isLast: boolean;
}

interface RowObserver {
  observer: IntersectionObserver;
  callbacks: Map<Element, () => void>;
}

// All rows use the viewport as their observer root. Share observers with the
// same margin instead of allocating one observer per message.
const rowObservers = new Map<string, RowObserver>();

function observeRow(
  element: Element,
  rootMargin: string,
  onVisible: () => void,
) {
  let group = rowObservers.get(rootMargin);
  if (!group) {
    const callbacks = new Map<Element, () => void>();
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) callbacks.get(entry.target)?.();
        });
      },
      { rootMargin, threshold: 0 },
    );
    group = { observer, callbacks };
    rowObservers.set(rootMargin, group);
  }

  const { observer, callbacks } = group;
  let active = true;
  const stopObserving = () => {
    if (!active) return;
    active = false;
    callbacks.delete(element);
    observer.unobserve(element);
    if (!callbacks.size) {
      observer.disconnect();
      rowObservers.delete(rootMargin);
    }
  };
  callbacks.set(element, () => {
    stopObserving();
    onVisible();
  });
  observer.observe(element);
  return stopObserving;
}

/** Keep one row and one message instance when the lazy policy changes. */
export function BubbleListItem({
  children,
  className,
  lazy,
  shouldLazyLoad,
  index,
  total,
  role,
  isLast,
}: BubbleListItemProps) {
  const rowRef = useRef<HTMLDivElement>(null);
  const [hasRendered, setHasRendered] = useState(!shouldLazyLoad);
  const isVisible = hasRendered || !shouldLazyLoad;
  const rootMargin = lazy?.rootMargin ?? '200px';

  // Record only committed eager renders. A later index/policy change must not
  // replace an already mounted editor with a placeholder and discard its draft.
  useLayoutEffect(() => {
    if (isVisible && !hasRendered) setHasRendered(true);
  }, [isVisible, hasRendered]);

  useEffect(() => {
    if (isVisible || !rowRef.current) return;
    if (typeof IntersectionObserver === 'undefined') {
      setHasRendered(true);
      return;
    }
    return observeRow(rowRef.current, rootMargin, () => setHasRendered(true));
  }, [isVisible, rootMargin]);

  const height = lazy?.placeholderHeight ?? 100;
  const placeholderStyle: React.CSSProperties = { minHeight: height };

  return (
    <div
      ref={rowRef}
      className={className}
      style={{
        minWidth: 0,
        width: '100%',
        ...(!isVisible && !lazy?.renderPlaceholder ? placeholderStyle : {}),
      }}
      data-bubble-list-item
      data-is-last={isLast ? 'true' : 'false'}
      aria-hidden={!isVisible || undefined}
    >
      {isVisible
        ? children
        : lazy?.renderPlaceholder?.({
            height,
            style: placeholderStyle,
            isIntersecting: false,
            elementInfo: { type: 'bubble', index, total, role },
          })}
    </div>
  );
}
