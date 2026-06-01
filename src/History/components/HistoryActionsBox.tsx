import { Star, StarFill, Trash2 } from '@sofa-design/icons';
import { Popconfirm, Space } from 'antd';
import React, { useContext, useState } from 'react';
import { ActionIconBox } from '../../Components/ActionIconBox';
import { I18nContext } from '../../I18n';
import { HistoryActionsBoxProps } from '../types';

/**
 * HistoryActionsBox 组件 - 历史记录操作按钮容器组件
 *
 * 该组件提供一个操作按钮容器，支持收藏、删除等操作。
 * 在悬停时显示操作按钮，提供良好的用户体验。
 *
 * @component
 * @description 历史记录操作按钮容器组件，提供收藏、删除等操作功能
 * @param {HistoryActionsBoxProps} props - 组件属性
 * @param {React.ReactNode} props.children - 子组件，通常是时间显示
 * @param {() => void} [props.onDeleteItem] - 删除操作回调
 * @param {Object} [props.agent] - Agent配置
 * @param {boolean} [props.agent.enabled] - 是否启用agent模式
 * @param {HistoryDataType} [props.item] - 历史数据项
 * @param {(sessionId: string, isFavorite: boolean) => void} [props.onFavorite] - 收藏操作回调
 *
 * @example
 * ```tsx
 * <HistoryActionsBox
 *   onDeleteItem={() => handleDelete(item.sessionId)}
 *   onFavorite={(sessionId, isFavorite) => handleFavorite(sessionId, isFavorite)}
 *   item={historyItem}
 *   agent={{ enabled: true }}
 * >
 *   <span>2024-01-01 12:00</span>
 * </HistoryActionsBox>
 * ```
 *
 * @returns {React.ReactElement} 渲染的历史记录操作按钮容器组件
 *
 * @remarks
 * - 支持悬停显示操作按钮
 * - 提供收藏和删除功能
 * - 集成确认对话框
 * - 支持加载状态显示
 * - 响应式布局
 * - 国际化支持
 */
export const HistoryActionsBox: React.FC<HistoryActionsBoxProps> = (props) => {
  const { locale: i18nLocale } = useContext(I18nContext);
  const [isHover, setIsHover] = useState(false);
  const [open, setOpen] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [isFavorite, setIsFavorite] = useState(props.item?.isFavorite);

  return (
    <div
      onMouseEnter={() => {
        setIsHover(true);
      }}
      onMouseLeave={() => {
        if (!open) {
          setIsHover(false);
        }
      }}
      style={{
        color: 'var(--color-gray-text-light)',
        font: 'var(--font-text-body-sm)',
        lineHeight: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 'max-content',
        maxWidth: 'min(860px,100%)',
        position: 'relative',
      }}
    >
      <div
        style={{
          position: 'absolute',
          right: 0,
          top: '50%',
          transform: 'translateY(-50%)',
          opacity: isHover || props.agent?.enabled ? 1 : 0,
          transition: 'opacity 0.2s ease',
          pointerEvents: isHover || props.agent?.enabled ? 'auto' : 'none',
          display: 'flex',
          alignItems: 'center',
          background: 'transparent',
          zIndex: 1,
        }}
      >
        <Space size={4}>
          {props.agent?.enabled && props.item && props?.agent?.onFavorite && (
            <ActionIconBox
              loading={favoriteLoading}
              onClick={async (e) => {
                e.stopPropagation();
                e.preventDefault();
                try {
                  setFavoriteLoading(true);
                  await props.onFavorite?.(props.item!.sessionId!, !isFavorite);
                  setIsFavorite(!isFavorite);
                } catch (error) {
                  // 处理错误
                } finally {
                  setFavoriteLoading(false);
                }
              }}
              title={
                isFavorite
                  ? i18nLocale?.['chat.history.favorited'] || '已收藏'
                  : i18nLocale?.['chat.history.favorite'] || '收藏'
              }
              style={{
                width: 20,
                height: 20,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 'var(--radius-control-sm)',
              }}
            >
              {isFavorite ? (
                <StarFill
                  style={{
                    fontSize: 14,
                    color: 'var(--color-primary-control-fill-primary)',
                  }}
                />
              ) : (
                <Star
                  style={{
                    fontSize: 14,
                    color: 'var(--color-gray-text-secondary)',
                  }}
                />
              )}
            </ActionIconBox>
          )}
          {props?.onDeleteItem && props.item && (
            <Popconfirm
              open={open}
              onOpenChange={(visible) => {
                setOpen(visible);
              }}
              // 之前硬编码 `agent-chat` / `agent-chat-history-menu` 业务容器查找，
              // 在其它容器中使用 History 时会失效。这里直接交给 antd 默认行为
              // (挂到 document.body)，避免反向耦合外层业务类名。
              placement="left"
              title={
                i18nLocale?.['chat.history.delete.popconfirm'] ||
                '确定删除该消息吗？'
              }
              onConfirm={async (e) => {
                e?.stopPropagation();
                e?.preventDefault();
                try {
                  setDeleteLoading(true);
                  await props?.onDeleteItem?.();
                } catch (error) {
                  // 处理错误
                } finally {
                  setDeleteLoading(false);
                }
              }}
              onCancel={(e) => {
                e?.stopPropagation();
                e?.preventDefault();
              }}
            >
              <ActionIconBox
                loading={deleteLoading}
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                }}
                title={i18nLocale?.['chat.history.delete'] || '删除'}
                style={{
                  width: 20,
                  height: 20,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 'var(--radius-control-sm)',
                }}
              >
                <Trash2
                  style={{
                    fontSize: 14,
                    color: 'var(--color-gray-text-secondary)',
                  }}
                />
              </ActionIconBox>
            </Popconfirm>
          )}
        </Space>
      </div>
      <div
        style={{
          opacity:
            !(isHover && props?.onDeleteItem) || props.agent?.enabled ? 1 : 0,
          transition: 'opacity 0.2s ease',
        }}
      >
        {!props.agent?.enabled ? (
          props.children
        ) : (
          <span style={{ width: 20, height: 20 }}></span>
        )}
      </div>
    </div>
  );
};
