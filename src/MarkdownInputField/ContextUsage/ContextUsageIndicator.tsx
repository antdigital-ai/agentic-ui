import { ConfigProvider, Popover, Progress, Tooltip } from 'antd';
import classNames from 'clsx';
import React, { useContext, useMemo, useRef, useState } from 'react';
import type { ContextUsagePanelLabels } from './ContextUsagePanel';
import { ContextUsagePanel } from './ContextUsagePanel';

/**
 * 上下文用量分档阈值（对齐 dtcoder-ide HIGH_USAGE_THRESHOLD_PERCENT）
 */
export const HIGH_USAGE_THRESHOLD_PERCENT = 80;

/** 圆环在极低占用时仍保留可见弧长（对齐 MIN_VISIBLE_RING_PERCENT） */
export const MIN_VISIBLE_RING_PERCENT = 1.5;

export interface ContextUsageCategory {
  /** 分类 key */
  key: string;
  /** 分类名（如「系统」「工具」「消息」） */
  name: string;
  /** 估算 token 数 */
  tokenCount: number;
  /** 分类色（CSS color） */
  color?: string;
  /** 展开明细 */
  items?: Array<{ label: string; estimatedTokens: number }>;
}

export interface ContextUsageIndicatorProps {
  /** 已占用 token 数；<= 0 时组件不渲染（对齐 IDE 行为） */
  usedTokens: number;
  /** 上下文窗口总量 */
  contextWindow: number;
  /** 分类明细（可选，面板展示） */
  categories?: ContextUsageCategory[];
  /** 高用量阈值百分比，默认 80 */
  highUsageThreshold?: number;
  /**
   * 点击指示器回调。
   * 传入后不渲染内置面板（宿主自行打开详情）；未传入且提供 categories 时渲染内置面板。
   */
  onClick?: (info: {
    usedTokens: number;
    contextWindow: number;
    percent: number;
  }) => void;
  /** 内置面板文案（未传 onClick 且有 categories 时生效） */
  panelLabels?: Partial<ContextUsagePanelLabels>;
  /** 压缩回调（内置面板底部 compact 按钮） */
  onCompact?: () => void;
  /** 压缩禁用（会话处理中等场景） */
  compactDisabled?: boolean;
  /** 压缩中 */
  compacting?: boolean;
  prefixCls?: string;
  className?: string;
  testId?: string;
}

const formatTokenNumber = (value: number): string => {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return `${value}`;
};

/**
 * ContextUsageIndicator — 输入框工具栏中的上下文用量环形指示器。
 *
 * 对齐 dtcoder-ide ContextUsageIndicator 的核心形态：
 * - 16px 环形进度（CircularProgress → antd Progress type="circle"），
 *   极低占用保留最小可见弧长。
 * - 颜色分档：<50% info 蓝，>=50% 黄，>=80%（高用量）深黄，溢出红。
 * - 悬浮 Tooltip 展示 `used / window (percent%)`。
 * - 点击触发 onClick（宿主自管面板）；或未传 onClick 时渲染内置
 *   ContextUsagePanel（分类分段条形图 + 明细 + compact 操作）。
 */
export const ContextUsageIndicator: React.FC<ContextUsageIndicatorProps> = ({
  usedTokens,
  contextWindow,
  categories,
  highUsageThreshold = HIGH_USAGE_THRESHOLD_PERCENT,
  onClick,
  panelLabels,
  onCompact,
  compactDisabled,
  compacting,
  prefixCls,
  className,
  testId,
}) => {
  const antdContext = useContext(ConfigProvider.ConfigContext);
  const baseCls = prefixCls ?? antdContext?.getPrefixCls('agentic-ctx-usage');
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [panelOpen, setPanelOpen] = useState(false);

  const percent = useMemo(() => {
    if (contextWindow <= 0) return 0;
    return Math.min(100, Math.round((usedTokens / contextWindow) * 100));
  }, [usedTokens, contextWindow]);

  const overflow = contextWindow > 0 && usedTokens > contextWindow;

  const strokeColor = useMemo(() => {
    if (overflow) return 'var(--ant-color-error, #ff4d4f)';
    if (percent >= highUsageThreshold)
      return 'var(--ant-color-warning, #faad14)';
    if (percent < 50) return 'var(--ant-color-text-tertiary, #8c8c8c)';
    return 'var(--ant-color-warning, #faad14)';
  }, [overflow, percent, highUsageThreshold]);

  if (usedTokens <= 0 || contextWindow <= 0) return null;

  const summary = `${formatTokenNumber(usedTokens)} / ${formatTokenNumber(
    contextWindow,
  )} (${percent}%)`;

  // 圆环弧长：极低占用保留最小可见弧
  const ringPercent =
    percent > 0 && percent < MIN_VISIBLE_RING_PERCENT
      ? MIN_VISIBLE_RING_PERCENT
      : Math.min(100, percent);

  const triggerButton = (
    <button
      ref={triggerRef}
      type="button"
      className={classNames(baseCls, className)}
      data-testid={testId ?? 'context-usage-indicator'}
      aria-label={`context usage ${percent}%`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 24,
        height: 24,
        padding: 0,
        border: 'none',
        background: 'transparent',
        cursor: 'pointer',
      }}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.({ usedTokens, contextWindow, percent });
      }}
    >
      <Progress
        type="circle"
        percent={ringPercent}
        size={16}
        strokeWidth={14}
        showInfo={false}
        strokeColor={strokeColor}
        trailColor="var(--ant-color-fill-secondary, rgba(0,0,0,0.06))"
      />
    </button>
  );

  const triggerWithTooltip = (
    <Tooltip
      title={
        <div className={`${baseCls}-tip`}>
          <div>{summary}</div>
          {percent >= highUsageThreshold ? (
            <div className={`${baseCls}-tip-warning`}>
              {`⚠ ${percent}% · high usage`}
            </div>
          ) : null}
        </div>
      }
    >
      {triggerButton}
    </Tooltip>
  );

  // 宿主自管面板（传 onClick）或无分类数据 → 仅触发器
  const useBuiltInPanel = !onClick && (categories?.length ?? 0) > 0;
  if (!useBuiltInPanel) {
    return triggerWithTooltip;
  }

  const mergedPanelLabels: ContextUsagePanelLabels = {
    title: 'Context Usage',
    close: 'Close',
    occupancy: `Context occupancy ${percent}%`,
    tokenSummary: summary,
    compact: 'Compact session',
    compacting: 'Compacting…',
    ...panelLabels,
  };

  return (
    <Popover
      open={panelOpen}
      trigger="click"
      placement="topLeft"
      onOpenChange={setPanelOpen}
      content={
        <ContextUsagePanel
          categories={categories}
          usedTokens={usedTokens}
          contextWindow={contextWindow}
          highUsageThreshold={highUsageThreshold}
          labels={mergedPanelLabels}
          onClose={() => setPanelOpen(false)}
          onCompact={onCompact}
          compactDisabled={compactDisabled}
          compacting={compacting}
        />
      }
    >
      {triggerWithTooltip}
    </Popover>
  );
};
