import classNames from 'clsx';
import React from 'react';
import type { SuggestionItem } from '../../Components/SuggestionList';
import { useLocale } from '../../I18n';

export interface FollowupItem {
  /** 展示与发送的文本 */
  text: string;
  /** 可选：点击后填入输入框而不直接发送 */
  fillOnly?: boolean;
  /** 前缀图标 / emoji */
  icon?: React.ReactNode;
  /** 覆盖展示文案（默认取 text） */
  title?: string;
}

export interface FollowupsProps {
  /** 建议问题列表 */
  items?: FollowupItem[];
  /** 点击建议：默认发送该文本 */
  onSelect?: (item: FollowupItem) => void;
  /** Prevent suggestion submission and draft changes while input is unavailable. */
  disabled?: boolean;
  /** 自定义类名 */
  className?: string;
  /** 自定义样式 */
  style?: React.CSSProperties;
}

/**
 * Followups 组件 - 输入框下方 / 上方的建议问题区（对齐 dtcoder-ide ChatFollowups）。
 *
 * 与通用 SuggestionList 的差异：交互语义面向"输入框联动"——
 * 点击即发送（默认）或回填输入框（fillOnly），样式与输入框宽度对齐。
 */
export const Followups: React.FC<FollowupsProps> = ({
  items,
  onSelect,
  disabled,
  className,
  style,
}) => {
  const locale = useLocale();

  if (!items || items.length === 0) return null;

  return (
    <div
      className={classNames('agentic-md-input-field-followups', className)}
      style={style}
      role="group"
      aria-label={locale['suggestion.area']}
      data-testid="markdown-input-field-followups"
    >
      {items.map((item, index) => (
        <button
          key={item.text + index}
          type="button"
          disabled={disabled}
          className="agentic-md-input-field-followups-item"
          onClick={() => onSelect?.(item)}
        >
          {item.icon ? (
            <span className="agentic-md-input-field-followups-item-icon">
              {item.icon}
            </span>
          ) : null}
          <span className="agentic-md-input-field-followups-item-text">
            {item.title ?? item.text}
          </span>
        </button>
      ))}
    </div>
  );
};

export type { SuggestionItem };
