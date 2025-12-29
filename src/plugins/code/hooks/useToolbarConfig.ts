/**
 * @fileoverview 工具栏配置Hook
 * 负责组装工具栏的属性和事件处理
 */

import { useCallback } from 'react';
import { CodeNode } from '../../../MarkdownEditor/el';
import { LanguageSelectorProps } from '../components';

interface UseToolbarConfigProps {
  element: CodeNode;
  readonly: boolean;
  onCloseClick: () => void;
  setLanguage: (lang: string) => void;
  isSelected?: boolean;
  onSelectionChange?: (selected: boolean) => void;
  onViewModeToggle?: () => void;
  viewMode?: 'preview' | 'code';
}

export function useToolbarConfig({
  element,
  readonly,
  onCloseClick,
  setLanguage,
  isSelected,
  onSelectionChange,
  onViewModeToggle,
  viewMode,
}: UseToolbarConfigProps) {
  // 组装语言选择器属性
  const languageSelectorProps: LanguageSelectorProps = useCallback(
    () => ({
      element,
      containerRef: { current: null },
      setLanguage,
    }),
    [element, setLanguage],
  )();

  // 组装工具栏属性
  const toolbarProps = useCallback(
    () => ({
      element,
      readonly,
      onCloseClick,
      languageSelectorProps,
      isSelected,
      onSelectionChange,
      onViewModeToggle,
      viewMode,
    }),
    [
      element,
      readonly,
      onCloseClick,
      languageSelectorProps,
      isSelected,
      onSelectionChange,
      onViewModeToggle,
      viewMode,
    ],
  )();

  return { toolbarProps };
}
