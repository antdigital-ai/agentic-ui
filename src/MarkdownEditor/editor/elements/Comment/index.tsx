import { ConfigProvider } from 'antd';
import classNames from 'classnames';
import React, { useContext, useMemo } from 'react';
import { BaseRange } from 'slate';
import { CommentDataType, MarkdownEditorProps } from '../../../types';

/**
 * 评论视图组件的属性接口
 */
interface CommentViewProps {
  /** 子元素 */
  children: React.ReactNode;
  /** 评论配置对象 */
  comment: MarkdownEditorProps['comment'];
  /** 评论数据列表 */
  commentItem: CommentDataType[];
  /** 评论的唯一标识符 */
  id: string;
  /** Slate.js 选择范围 */
  selection?: BaseRange;
  /** 设置显示评论的回调函数 */
  setShowComment?: (comments: CommentDataType[]) => void;
}

/**
 * 评论视图组件 - 显示和管理 Markdown 编辑器中的评论
 *
 * 功能特性：
 * - 显示评论标记和高亮
 * - 支持点击查看评论详情
 *
 * @param props - 组件属性
 * @returns 渲染的评论视图组件
 */
export const CommentView = (props: CommentViewProps) => {
  const { setShowComment } = props;
  const context = useContext(ConfigProvider.ConfigContext);
  const mdEditorBaseClass = context?.getPrefixCls('agentic-md-editor-content');

  /**
   * 查找当前评论数据
   * 通过解析 props.id 来匹配对应的评论项
   */
  const thisComment = useMemo(() => {
    return props.commentItem?.find?.(
      (c) => `${c.id}` === props.id.split('-').at(-1),
    );
  }, [props.id]);

  if (!props.commentItem?.length) {
    return <>{props.children}</>;
  }

  const type = thisComment?.commentType || 'comment';

  return (
    <span
      data-be="comment-text"
      data-testid="comment-view"
      id={props.id}
      className={classNames({
        [`${mdEditorBaseClass}-comment-${type}`]: type,
      })}
      style={{
        position: 'relative',
      }}
      onClick={(e) => {
        e.stopPropagation();
        setShowComment?.(
          props.commentItem?.filter((item: any) => Boolean(item.content)),
        );
      }}
    >
      {props.children}
    </span>
  );
};

/**
 * 评论创建组件的属性接口
 */
interface CommentCreateProps {
  /** 评论配置对象 */
  comment: MarkdownEditorProps['comment'];
}

/**
 * 评论创建组件 - 提供创建新评论的界面
 *
 * 功能说明：
 * - 如果提供了自定义的编辑器渲染器，则使用自定义渲染
 * - 否则渲染默认的空白创建界面
 * - 支持测试标识符以便于测试
 *
 * @param props - 组件属性
 * @returns 渲染的评论创建组件
 */
export const CommentCreate = (props: CommentCreateProps) => {
  const dom = <div data-testid="comment-create-default"></div>;
  if (props.comment?.editorRender) {
    return props.comment.editorRender(dom);
  }
  return <div data-testid="comment-create-default"></div>;
};
