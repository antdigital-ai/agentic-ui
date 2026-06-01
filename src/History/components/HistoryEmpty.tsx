import React, { useContext } from 'react';
import { I18nContext } from '../../I18n';
import { HistoryEmptyIcon } from './HistoryEmptyIcon';

/** 空状态语义类型：会拼到 i18n key 中（`chat.history.empty.${type}.title`） */
export type HistoryEmptyType = 'chat' | 'task';

export interface HistoryEmptyProps {
  /**
   * 业务语义：决定使用 `chat.history.empty.chat.*` 还是 `chat.history.empty.task.*`。
   * 默认 `chat`，保持向后兼容。
   */
  type?: HistoryEmptyType;
}

/** 默认中文 fallback：当 i18n locale 缺该 key 时的兜底文案 */
const DEFAULT_FALLBACK: Record<
  HistoryEmptyType,
  { title: string; description: string }
> = {
  chat: { title: '找不到相关结果', description: '换个关键词试试吧' },
  task: { title: '暂无历史任务', description: '完成的任务会出现在这里' },
};

/**
 * HistoryEmpty 组件 - 历史记录空状态展示
 *
 * 当历史记录列表为空时显示的占位组件，提供友好的空状态提示。
 * 支持 `chat` / `task` 两种业务语义，分别对应不同的 i18n key 与默认文案。
 *
 * @component
 *
 * @example
 * ```tsx
 * // 默认对话场景
 * <HistoryEmpty />
 *
 * // 任务场景
 * <HistoryEmpty type="task" />
 * ```
 *
 * @returns {React.ReactElement} 渲染的空状态组件
 */
export const HistoryEmpty: React.FC<HistoryEmptyProps> = ({
  type = 'chat',
}) => {
  const { locale } = useContext(I18nContext);

  const fallback = DEFAULT_FALLBACK[type];

  // 之前 key 写死 `chat.history.empty.chat.*`，task 模式无法被覆盖。
  // 现在按 type 动态拼，让 i18n 文案能跟随业务语义切换。
  const titleKey = `chat.history.empty.${type}.title` as const;
  const descriptionKey = `chat.history.empty.${type}.description` as const;

  const defaultTitle = locale?.[titleKey] || fallback.title;
  const defaultDescription = locale?.[descriptionKey] || fallback.description;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px 24px',
        textAlign: 'center',
        marginTop: 12,
      }}
    >
      <HistoryEmptyIcon />
      <div
        style={{
          font: 'var(--font-text-h6-base)',
          color: 'var(--color-gray-text-secondary)',
          letterSpacing: 'var(--letter-spacing-h6-base, normal)',
          marginBottom: 2,
        }}
      >
        {defaultTitle}
      </div>
      <div
        style={{
          font: 'var(--font-text-body-base)',
          letterSpacing: 'var(--letter-spacing-body-base, normal)',
          color: 'var(--color-gray-text-light)',
        }}
      >
        {defaultDescription}
      </div>
    </div>
  );
};
