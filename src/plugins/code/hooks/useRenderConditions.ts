/**
 * @fileoverview 代码块渲染条件Hook
 * 处理不同类型代码块的渲染逻辑
 */

import { useMemo } from 'react';
import { CodeNode } from '../../../MarkdownEditor/el';

export function useRenderConditions(element: CodeNode, readonly: boolean) {
  // 是否隐藏配置型HTML代码块
  const shouldHideConfigHtml = useMemo(
    () => element.language === 'html' && element?.isConfig,
    [element.language, element?.isConfig],
  );

  // 是否渲染为思考块（仅 think）
  const shouldRenderAsThinkBlock = useMemo(
    () => element.language === 'think' && readonly,
    [element.language, readonly],
  );

  // 是否渲染为普通代码编辑器
  const shouldRenderAsCodeEditor = useMemo(
    () => !shouldHideConfigHtml && !shouldRenderAsThinkBlock,
    [shouldHideConfigHtml, shouldRenderAsThinkBlock],
  );

  return {
    shouldHideConfigHtml,
    shouldRenderAsThinkBlock,
    shouldRenderAsCodeEditor,
  };
}
