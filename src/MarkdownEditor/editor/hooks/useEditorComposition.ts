import { useEffect, useState } from 'react';
import { useEditorStore } from '../store';

/** 监听编辑器容器 IME 组合输入状态，用于空态占位符隐藏 */
export function useEditorComposition(): boolean {
  const { markdownContainerRef } = useEditorStore();
  const [isComposing, setIsComposing] = useState(false);

  useEffect(() => {
    const container = markdownContainerRef.current;
    if (!container) return;

    const onStart = () => setIsComposing(true);
    const onEnd = () => setIsComposing(false);
    container.addEventListener('compositionstart', onStart);
    container.addEventListener('compositionend', onEnd);
    return () => {
      container.removeEventListener('compositionstart', onStart);
      container.removeEventListener('compositionend', onEnd);
    };
  }, [markdownContainerRef]);

  return isComposing;
}
