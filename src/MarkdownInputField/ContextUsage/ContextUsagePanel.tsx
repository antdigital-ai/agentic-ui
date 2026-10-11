import { ConfigProvider } from 'antd';
import classNames from 'clsx';
import React, { useCallback, useContext, useMemo, useState } from 'react';
import type { ContextUsageCategory } from './ContextUsageIndicator';
import { HIGH_USAGE_THRESHOLD_PERCENT } from './ContextUsageIndicator';

export interface ContextUsageBarSegment {
  /** 分段 key（分类 key 或 `__residual` / `__aggregate`） */
  key: string;
  /** 分段色（CSS color） */
  color: string;
  /** 分段宽度百分比（0-100） */
  widthPercent: number;
}

export interface ContextUsagePanelLabels {
  /** 面板标题 */
  title: React.ReactNode;
  /** 关闭按钮 aria-label */
  close: string;
  /** 占用文案（如「上下文占用 42%」） */
  occupancy: React.ReactNode;
  /** token 摘要（如「53.2K / 128K」） */
  tokenSummary: React.ReactNode;
  /** 压缩按钮文案 */
  compact: React.ReactNode;
  /** 压缩中文案 */
  compacting: React.ReactNode;
  /** 压缩禁用原因（title 提示） */
  compactDisabledReason?: string;
}

export interface ContextUsagePanelProps {
  /** 分类明细行 */
  categories?: ContextUsageCategory[];
  /** 已占用 token 数 */
  usedTokens: number;
  /** 上下文窗口总量 */
  contextWindow: number;
  /** 分段色板；未传时按分类序取默认色板 */
  segmentColors?: string[];
  /** 高用量阈值百分比，达到时显示警告行 */
  highUsageThreshold?: number;
  /** 高用量警告文案 */
  warning?: React.ReactNode;
  /** 压缩按钮禁用（会话处理中等场景） */
  compactDisabled?: boolean;
  /** 压缩中 */
  compacting?: boolean;
  /** 面板文案 */
  labels: ContextUsagePanelLabels;
  /** 关闭回调 */
  onClose: () => void;
  /** 压缩回调（对齐 IDE composerService.compact） */
  onCompact?: () => void;
  prefixCls?: string;
  className?: string;
  testId?: string;
}

/** 极低占用时条形图仍保留可见宽度（对齐 MIN_VISIBLE_BAR_PERCENT） */
const MIN_VISIBLE_BAR_PERCENT = 0.45;
/** 残差分段色（对齐 AGGREGATE_USAGE_COLOR） */
const AGGREGATE_COLOR = 'var(--ant-color-primary, #1677ff)';

const DEFAULT_SEGMENT_COLORS = [
  'var(--ant-color-primary, #1677ff)',
  'var(--ant-purple, #722ed1)',
  'var(--ant-green, #52c41a)',
  'var(--ant-gold, #faad14)',
  'var(--ant-magenta, #eb2f96)',
  'var(--ant-orange, #fa8c16)',
  'var(--ant-cyan, #13c2c2)',
  'var(--ant-geekblue, #2f54eb)',
];

const formatTokenNumber = (value: number): string => {
  if (value >= 1_000_000)
    return `${parseFloat((value / 1_000_000).toFixed(1))}M`;
  if (value >= 1_000) return `${parseFloat((value / 1_000).toFixed(1))}K`;
  return `${value}`;
};

/**
 * 计算分段条形图（对齐 dtcoder-ide computeBarSegments）：
 * - 分类宽度 = tokenCount / contextWindow；
 * - 分类合计超过总占用时按比例缩回（保证条宽与百分比一致）；
 * - 不足时补残差分段；仅残差时保证最小可见宽度。
 */
export const computeBarSegments = (
  categories: ContextUsageCategory[],
  contextWindow: number,
  totalTokens: number,
  segmentColors?: string[],
): ContextUsageBarSegment[] => {
  if (totalTokens <= 0) return [];

  const segments: ContextUsageBarSegment[] = [];
  let segmentedTotal = 0;

  categories.forEach((category, index) => {
    if (category.tokenCount <= 0) return;
    const widthPercent =
      contextWindow > 0 ? (category.tokenCount / contextWindow) * 100 : 0;
    if (widthPercent > 0) {
      segments.push({
        key: category.key,
        color:
          category.color ??
          segmentColors?.[index] ??
          DEFAULT_SEGMENT_COLORS[index % DEFAULT_SEGMENT_COLORS.length],
        widthPercent,
      });
      segmentedTotal += category.tokenCount;
    }
  });

  // 分类合计超出总占用 → 等比缩回，保持相对占比
  if (segmentedTotal > totalTokens && segmentedTotal > 0) {
    const scale = totalTokens / segmentedTotal;
    for (const segment of segments) {
      segment.widthPercent *= scale;
    }
    return segments;
  }

  // 分类覆盖不足 → 补残差分段
  const residual = totalTokens - segmentedTotal;
  if (residual > 0 && contextWindow > 0) {
    let widthPercent = (residual / contextWindow) * 100;
    if (segments.length === 0) {
      widthPercent = Math.max(widthPercent, MIN_VISIBLE_BAR_PERCENT);
    }
    if (widthPercent > 0) {
      segments.push({
        key: segments.length === 0 ? '__aggregate' : '__residual',
        color: AGGREGATE_COLOR,
        widthPercent,
      });
    }
  }

  return segments;
};

/**
 * ContextUsagePanel — 上下文用量详情面板（对齐 dtcoder-ide ComposerContextUsagePanel）。
 *
 * 展示：占用百分比 + token 摘要、分类分段条形图、分类明细行（含展开明细）、
 * 高用量警告、压缩（compact）操作。分类行展开态由组件自持；
 * token 统计与压缩请求由宿主提供。
 */
export const ContextUsagePanel: React.FC<ContextUsagePanelProps> = ({
  categories,
  usedTokens,
  contextWindow,
  segmentColors,
  highUsageThreshold = HIGH_USAGE_THRESHOLD_PERCENT,
  warning,
  compactDisabled = false,
  compacting = false,
  labels,
  onClose,
  onCompact,
  prefixCls,
  className,
  testId,
}) => {
  const antdContext = useContext(ConfigProvider.ConfigContext);
  const baseCls =
    prefixCls ?? antdContext?.getPrefixCls('agentic-ctx-usage-panel');

  const [expandedKeys, setExpandedKeys] = useState<ReadonlySet<string>>(
    () => new Set(),
  );

  const toggleExpanded = useCallback((key: string) => {
    setExpandedKeys((previous) => {
      const next = new Set(previous);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }, []);

  const percent =
    contextWindow > 0 ? Math.min(100, (usedTokens / contextWindow) * 100) : 0;

  const barSegments = useMemo(
    () =>
      computeBarSegments(
        categories ?? [],
        contextWindow,
        usedTokens,
        segmentColors,
      ),
    [categories, contextWindow, usedTokens, segmentColors],
  );

  const showBreakdown = (categories ?? []).some((row) => row.tokenCount > 0);
  const showWarning = warning ?? percent >= highUsageThreshold;

  return (
    <div
      className={classNames(baseCls, className)}
      data-testid={testId ?? 'context-usage-panel'}
    >
      {/* 标题 + 关闭 */}
      <div className={`${baseCls}-header`}>
        <span className={`${baseCls}-title`}>{labels.title}</span>
        <button
          type="button"
          className={`${baseCls}-close`}
          aria-label={labels.close}
          onClick={onClose}
        >
          ×
        </button>
      </div>

      {/* 占用 + token 摘要 */}
      <div className={`${baseCls}-summary`}>
        <span>{labels.occupancy}</span>
        <span className={`${baseCls}-token-summary`}>
          {labels.tokenSummary}
        </span>
      </div>

      {/* 分段条形图 */}
      {barSegments.length > 0 ? (
        <div
          className={`${baseCls}-meter`}
          data-testid={`${testId ?? 'context-usage-panel'}-meter`}
        >
          {barSegments.map((segment) => (
            <div
              key={segment.key}
              className={`${baseCls}-meter-segment`}
              style={{
                width: `${segment.widthPercent}%`,
                backgroundColor: segment.color,
              }}
            />
          ))}
        </div>
      ) : null}

      {/* 高用量警告 */}
      {showWarning ? (
        <div
          className={`${baseCls}-warning`}
          data-testid={`${testId ?? 'context-usage-panel'}-warning`}
        >
          ⚠ {formatTokenNumber(usedTokens)} / {formatTokenNumber(contextWindow)}{' '}
          ({Math.round(percent)}%)
        </div>
      ) : null}

      {/* 分类明细 */}
      {showBreakdown ? (
        <div className={`${baseCls}-breakdown`}>
          {(categories ?? []).map((row) => {
            const expandable = (row.items?.length ?? 0) > 0;
            const expanded = expandedKeys.has(row.key);
            return (
              <div key={row.key} className={`${baseCls}-row`}>
                <button
                  type="button"
                  className={`${baseCls}-row-toggle`}
                  onClick={() => expandable && toggleExpanded(row.key)}
                  aria-expanded={expandable ? expanded : undefined}
                >
                  <span
                    className={`${baseCls}-row-color`}
                    style={{ backgroundColor: row.color ?? 'currentColor' }}
                  />
                  {expandable ? (
                    <span className={`${baseCls}-row-chevron`}>
                      {expanded ? '▾' : '▸'}
                    </span>
                  ) : null}
                  <span className={`${baseCls}-row-name`} title={row.name}>
                    {row.name}
                  </span>
                  <span className={`${baseCls}-row-value`}>
                    {formatTokenNumber(row.tokenCount)}
                  </span>
                </button>
                {expandable && expanded ? (
                  <div className={`${baseCls}-row-items`}>
                    {(row.items ?? []).map((item, index) => (
                      <div
                        key={`${row.key}-${index}`}
                        className={`${baseCls}-row-item`}
                      >
                        <span
                          className={`${baseCls}-row-item-label`}
                          title={item.label}
                        >
                          {item.label}
                        </span>
                        <span className={`${baseCls}-row-item-value`}>
                          {formatTokenNumber(item.estimatedTokens)}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      ) : null}

      {/* 压缩操作 */}
      {onCompact ? (
        <button
          type="button"
          className={`${baseCls}-compact`}
          disabled={compactDisabled || compacting}
          title={compactDisabled ? labels.compactDisabledReason : undefined}
          onClick={onCompact}
          data-testid={`${testId ?? 'context-usage-panel'}-compact`}
        >
          {compacting ? labels.compacting : labels.compact}
        </button>
      ) : null}
    </div>
  );
};
