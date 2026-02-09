import {
  CloseOutlined,
  DeleteFilled,
  EditOutlined,
  ExportOutlined,
} from '@ant-design/icons';
import { Avatar, ConfigProvider, Popconfirm, Tooltip } from 'antd';
import classNames from 'clsx';
import dayjs from 'dayjs';
import { motion } from 'framer-motion';
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
 * 导航动画变体配置
 * 定义评论列表的展开和收起动画效果
 */
const navVariants = {
  open: {
    transition: { staggerChildren: 0.07, delayChildren: 0.2 },
  },
  closed: {
    transition: { staggerChildren: 0.05, staggerDirection: -1 },
  },
};

/**
 * 项目动画变体配置
 * 定义单个评论项的动画效果
 */
const itemVariants = {
  open: {
    y: 0,
    opacity: 1,
    transition: {
      y: { stiffness: 1000, velocity: -100 },
    },
  },
  closed: {
    y: 50,
    opacity: 0,
    transition: {
      y: { stiffness: 1000 },
    },
  },
};

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
  const { wrapSSR, hashId } = useStyle(baseCls);
  return wrapSSR(
    <>
      {!props.pure ? (
        <div
          style={{
            width: '300px',
          }}
        />
      ) : null}
      <motion.div
        style={props.style}
        className={classNames(hashId, props.className, baseCls)}
        initial={{ transform: 'translateX(100%)', opacity: 0 }}
        animate={{ transform: 'translateX(0)', opacity: 1 }}
        exit={{ transform: 'translateX(100%)', opacity: 0 }}
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
        <motion.div
          variants={navVariants}
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
          }}
          initial="closed"
          whileInView="open"
        >
          {props.commentList?.map((item, index) => {
            return (
              <motion.div
                key={index}
                whileHover={{ scale: 1.04 }}
                variants={itemVariants}
                onClick={async (e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  await props.comment?.onClick?.(item.id, item);
                }}
                className={classNames(`${baseCls}-item`, hashId)}
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
                          <Tooltip title={locale?.['comment.delete'] || '删除评论'}>
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
                      <Tooltip title={locale?.['comment.jumpTo'] || '跳转到评论位置'}>
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
              </motion.div>
            );
          })}
        </motion.div>
      </motion.div>
    </>,
  );
};
