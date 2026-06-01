import {
  CloseOutlined,
  DeleteFilled,
  EditOutlined,
  ExportOutlined,
} from '@ant-design/icons';
import { Avatar, ConfigProvider, Popconfirm, Tooltip } from 'antd';
import classNames from 'clsx';
import dayjs from 'dayjs';
import React, { useContext } from 'react';
import { Transforms } from 'slate';
import {
  CommentDataType,
  MarkdownEditorProps,
} from '../../../BaseMarkdownEditor';

import { I18nContext } from '../../../../I18n';
import { EditorStoreContext, useEditorStore } from '../../store';
import { useStyle } from './style';

/**
 * 列表项 stagger 入场延迟（秒），与 framer-motion 时代的
 * `staggerChildren: 0.07, delayChildren: 0.2` 等价。
 *
 * 不再依赖 framer-motion，由 CSS keyframes + 每项 inline animation-delay 实现。
 */
const COMMENT_ITEM_BASE_DELAY_S = 0.2;
const COMMENT_ITEM_STEP_DELAY_S = 0.07;

/**
 * CommentList 组件 - 评论列表组件
 *
 * 该组件用于显示文档中的评论列表，支持评论的查看、编辑、删除和跳转功能。
 * 使用 Framer Motion 提供流畅的动画效果，集成 Ant Design 组件。
 *
 * @component
 * @description 评论列表组件，显示文档评论并提供交互功能
 * @param {Object} props - 组件属性
 * @param {CommentDataType[]} props.commentList - 评论数据列表
 * @param {MarkdownEditorProps['comment']} props.comment - 评论配置对象
 * @param {React.CSSProperties} [props.style] - 自定义样式
 * @param {string} [props.className] - 自定义CSS类名
 *
 * @example
 * ```tsx
 * <CommentList
 *   commentList={comments}
 *   comment={{
 *     onClick: (id, comment) => console.log('点击评论', id),
 *     onEdit: (id, comment) => console.log('编辑评论', id),
 *     onDelete: (id, comment) => console.log('删除评论', id)
 *   }}
 * />
 * ```
 *
 * @returns {React.ReactElement} 渲染的评论列表组件
 *
 * @remarks
 * - 支持评论的查看、编辑、删除操作
 * - 提供评论位置跳转功能
 * - 使用 Framer Motion 实现动画效果
 * - 集成 Ant Design 组件（Avatar、Tooltip、Popconfirm）
 * - 支持用户头像和名称显示
 * - 显示评论时间戳
 * - 响应式布局设计
 * - 支持自定义样式和类名
 */
export const CommentList: React.FC<{
  commentList: CommentDataType[];
  comment: MarkdownEditorProps['comment'];
  style?: React.CSSProperties;
  className?: string;
  pure?: boolean;
}> = (props) => {
  const { markdownEditorRef } = useEditorStore();
  const { locale } = useContext(I18nContext);
  const context = useContext(ConfigProvider.ConfigContext);
  const { setShowComment } = useContext(EditorStoreContext) || {};
  const baseCls = context?.getPrefixCls('agentic-md-editor-comment-view');
  const { hashId } = useStyle(baseCls);
  return (
    <>
      {!props.pure ? (
        <div
          style={{
            width: '300px',
          }}
        />
      ) : null}
      {/* 入场滑入与列表项 stagger/hover 全部由 CSS 控制（参见 style.ts） */}
      <div
        style={props.style}
        className={classNames(hashId, props.className, baseCls)}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            padding: '8px 12px',
            cursor: 'pointer',
          }}
        >
          划词评论 ({props.commentList?.length})
          <CloseOutlined
            onClick={() => {
              setShowComment?.([]);
            }}
          />
        </div>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
          }}
        >
          {props.commentList?.map((item, index) => {
            return (
              <div
                key={index}
                onClick={async (e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  await props.comment?.onClick?.(item.id, item);
                }}
                className={classNames(`${baseCls}-item`, hashId)}
                style={
                  {
                    '--comment-item-delay': `${
                      COMMENT_ITEM_BASE_DELAY_S +
                      index * COMMENT_ITEM_STEP_DELAY_S
                    }s`,
                  } as React.CSSProperties
                }
              >
                <div className={classNames(`${baseCls}-item-header`, hashId)}>
                  <div
                    className={classNames(
                      `${baseCls}-item-header-title`,
                      hashId,
                    )}
                  >
                    <div>
                      <div
                        className={classNames(
                          `${baseCls}-item-header-name`,
                          hashId,
                        )}
                      >
                        <Avatar src={item.user?.avatar} size={14}>
                          {item.user?.name
                            ?.split(' ')
                            ?.map((item) =>
                              item?.split('').at(0)?.toUpperCase(),
                            )
                            ?.join('') || ''}
                        </Avatar>
                        {item.user?.name}
                      </div>
                      <div
                        className={classNames(
                          `${baseCls}-item-header-time`,
                          hashId,
                        )}
                      >
                        {dayjs(item.time).format('YYYY-MM-DD HH:mm:ss')}
                      </div>
                    </div>
                  </div>
                  {
                    <div
                      className={classNames(
                        `${baseCls}-item-header-action`,
                        hashId,
                      )}
                    >
                      {props.comment?.onDelete ? (
                        <Popconfirm
                          title={
                            props.comment?.deleteConfirmText ||
                            'Are you sure to delete this comment?'
                          }
                          onConfirm={async (e) => {
                            e?.stopPropagation();
                            e?.preventDefault();
                            try {
                              await props.comment?.onDelete?.(item.id, item);
                              // 更新时间戳,触发一下dom的rerender，不然不给我更新
                              Transforms.setNodes(
                                markdownEditorRef.current,
                                {
                                  updateTimestamp: Date.now(),
                                },
                                {
                                  at: item.path,
                                },
                              );
                            } catch (error) {}
                          }}
                        >
                          <Tooltip
                            title={locale?.['comment.delete'] || '删除评论'}
                          >
                            <span
                              className={classNames(
                                `${baseCls}-item-header-action-item`,
                                hashId,
                              )}
                            >
                              <DeleteFilled />
                            </span>
                          </Tooltip>
                        </Popconfirm>
                      ) : null}
                      {props.comment?.onEdit ? (
                        <Tooltip title={locale?.['comment.edit'] || '编辑评论'}>
                          <span
                            className={classNames(
                              `${baseCls}-item-header-action-item`,
                              hashId,
                            )}
                            onClick={async (e) => {
                              e.stopPropagation();
                              e.preventDefault();
                              await props.comment?.onEdit?.(item.id, item);
                            }}
                          >
                            <EditOutlined />
                          </span>
                        </Tooltip>
                      ) : null}
                      <Tooltip
                        title={locale?.['comment.jumpTo'] || '跳转到评论位置'}
                      >
                        <span
                          className={classNames(
                            `${baseCls}-item-header-action-item`,
                            hashId,
                          )}
                          onClick={async (e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            const element = document.getElementById(
                              `comment-${item.id}`,
                            );
                            if (element) {
                              element.scrollIntoView({
                                behavior: 'smooth',
                                block: 'start',
                              });
                              window.scrollBy(0, -40);
                            }
                            await props.comment?.onClick?.(item.id, item);
                          }}
                        >
                          <ExportOutlined />
                        </span>
                      </Tooltip>
                    </div>
                  }
                </div>
                <div className={classNames(`${baseCls}-item-content`, hashId)}>
                  {item.content}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};
