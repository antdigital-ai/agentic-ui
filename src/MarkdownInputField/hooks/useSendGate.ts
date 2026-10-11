import React from 'react';
import type { MarkdownEditorInstance } from '../../MarkdownEditor';
import type { ComposerSlashChip } from '../../MarkdownEditor/editor/elements/ComposerChip/types';
import { findUnconfiguredSlashChips } from '../../MarkdownEditor/editor/plugins/withComposerChips';
import type { MarkdownInputFieldProps } from '../types/MarkdownInputFieldProps';

interface UseSendGateParams {
  props: Pick<MarkdownInputFieldProps, 'composerChips'>;
  markdownEditorRef: React.MutableRefObject<
    MarkdownEditorInstance | null | undefined
  >;
}

export interface SendGateResult {
  /**
   * 发送前 gate 检查。
   * 返回 true = 拦截（存在未配置 chip 且宿主未允许直接发送）。
   */
  shouldBlockSend: () => boolean;
  /** 当前未配置的 slash chip 列表（gate 拦截时宿主可用于提示） */
  getUnconfiguredChips: () => ComposerSlashChip[];
}

/**
 * 发送前 gate（对齐 dtcoder-ide guiSlashSendGate）。
 *
 * 输入内容中存在「未配置参数」的结构化 slash chip 时阻止发送，
 * 交由宿主通过 onSlashChipGate 回调提示用户配置（如打开配置浮层）。
 * 未启用 composerChips 或未传 onSlashChipGate 时 gate 不生效。
 */
export const useSendGate = ({
  props,
  markdownEditorRef,
}: UseSendGateParams): SendGateResult => {
  const chipsEnabled = props.composerChips?.enable === true;
  const gateEnabled = chipsEnabled && !!props.composerChips?.onSlashChipGate;

  const getUnconfiguredChips = (): ComposerSlashChip[] => {
    if (!gateEnabled) return [];
    try {
      const editor = markdownEditorRef.current?.markdownEditorRef?.current;
      const nodes = editor?.children;
      if (!nodes) return [];
      return findUnconfiguredSlashChips(nodes as any);
    } catch {
      return [];
    }
  };

  const shouldBlockSend = (): boolean => {
    if (!gateEnabled) return false;
    const unconfigured = getUnconfiguredChips();
    if (unconfigured.length === 0) return false;
    // 宿主接管拦截决策：返回 false 表示放行
    const blocked =
      props.composerChips!.onSlashChipGate!(unconfigured) !== false;
    return blocked;
  };

  return { shouldBlockSend, getUnconfiguredChips };
};
