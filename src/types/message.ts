import React from 'react';
import { AttachmentFile } from '../MarkdownInputField/AttachmentButton/types';
import { WhiteBoxProcessInterface } from '../ThoughtChainList/types';
import { FeedbackType, RoleType } from './common';

/**
 * 气泡元数据
 */
export interface BubbleMetaData {
  /**
   * 角色头像
   */
  avatar?: string;

  /**
   * 背景色
   */
  backgroundColor?: string;

  /**
   * 名称
   */
  title?: string;

  /**
   * 其他元数据
   */
  [key: string]: any;
}

/**
 * 消息数据
 * @description 聊天消息的完整数据结构
 */
export interface MessageBubbleData<
  T extends Record<string, any> = Record<string, any>,
> {
  /**
   * @title 内容
   * @description 消息的显示内容，可以是React元素
   * @example <div>Hello, world!</div>
   */
  content?: React.ReactNode;

  /**
   * @title 原始内容
   * @description 消息的原始文本内容，通常用于存储未经处理的文本
   * @example "Hello, world!"
   */
  originContent?: string;

  /**
   * @title 错误信息
   * @description 消息处理过程中可能出现的错误
   * @example { code: "ERROR_CODE", message: "发生了错误" }
   */
  error?: any;

  /**
   * @title 模型标识
   * @description 生成此消息的AI模型标识符
   * @example "gpt-4"
   */
  model?: string;

  /**
   * @title 名称
   * @description 消息发送者的名称
   * @example "用户小明"
   */
  name?: string;

  /**
   * @title 父消息ID
   * @description 当前消息回复的消息ID，用于构建消息树结构
   * @example "msg_123456"
   */
  parentId?: string;

  /**
   * @title 角色
   * @description 消息发送者的角色，如用户、助手等
   * @example "user" 或 "assistant"
   */
  role: RoleType;

  /**
   * @title 创建时间
   * @description 消息创建的时间戳（毫秒）
   * @example 1625097600000
   */
  createAt: number;

  /**
   * @title 消息结束时间
   * @description 消息生成或接收完成的时间戳（毫秒）
   * @example 1625097605000
   */
  endTime?: number;

  /**
   * @title 唯一标识
   * @description 消息的唯一标识符
   * @example "msg_abcdef123456"
   */
  id: string;

  /**
   * @title 修改时间
   * @description 消息最后修改的时间戳（毫秒）
   * @example 1625097610000
   */
  updateAt: number;

  /**
   * @title 附加数据
   * @description 消息的额外信息，可以包含多种自定义数据
   */
  extra?: T & {
    /**
     * @title 白盒处理过程
     * @description 模型处理过程的可解释性数据
     */
    white_box_process?: WhiteBoxProcessInterface[] | WhiteBoxProcessInterface;

    /**
     * @title 聊天跟踪ID
     * @description 用于追踪整个对话流程的ID
     * @example "trace_xyz789"
     */
    chat_trace_id?: string;

    /**
     * @title 会话ID
     * @description 当前会话的唯一标识符
     * @example "session_123abc"
     */
    sessionId?: string;

    /**
     * @title 消息UUID
     * @description 消息的全局唯一标识符
     * @example "uuid_456def"
     */
    uuid?: string;

    /**
     * @title 客户端ID
     * @description 问答对的客户端标识符
     * @example "client_789ghi"
     */
    clientId?: string;

    /**
     * @title 标签列表
     * @description 消息的分类标签
     * @example ["NORMAL", "ABOUT_YOU"]
     */
    tags?: ('REJECT_TO_ANSWER' | 'ABOUT_YOU' | 'NORMAL')[];
  };

  /**
   * @title 模型元数据
   * @description 有关生成此消息的模型的额外信息
   * @example { model: "gpt-4", temperature: 0.7, tokens: { total: 150, prompt: 50, completion: 100 } }
   */
  meta?: BubbleMetaData;

  /**
   * @title 是否完成
   * @description 标识消息是否已完全生成或接收完成
   * @example true
   */
  isFinished?: boolean;

  /**
   * @title 是否被终止
   * @description 标识消息生成是否被中途终止
   * @example false
   */
  isAborted?: boolean;

  /**
   * @title 用户反馈
   * @description 用户对消息的评价反馈
   * - thumbsUp: 点赞，表示满意
   * - thumbsDown: 点踩，表示不满意
   * - none: 无反馈
   * @example "thumbsUp"
   */
  feedback?: FeedbackType;

  /**
   * @title 是否重试
   * @description 标识当前消息是否是之前消息的重试
   * @example false
   */
  isRetry?: boolean;

  /**
   * @title 文件映射
   * @description 消息相关的附件文件映射
   * @example new Map([["file1", { name: "示例.pdf", size: 1024, type: "application/pdf" }]])
   */
  fileMap?: Map<string, AttachmentFile>;

  /**
   * @deprecated 已废弃，请使用 isLast 代替
   * @description 已废弃，请使用 isLast 代替
   * @example true
   */
  isLatest?: boolean;

  /**
   * @title 是否为最后一个节点
   * @description 用于标识当前消息是否为对话中的最新消息
   * @default false
   * @optional
   */
  isLast?: boolean;
}
