import React, { useMemo } from 'react';
import { RenderLeafProps } from 'slate-react';

import { debugInfo } from '../../../../Utils/debugUtils';
import { MarkdownEditorProps } from '../../../types';
import { useEditorStore } from '../../store';
import { CommentView } from '../Comment';

interface CommentLeafProps {
  children: React.ReactNode;
  leaf: RenderLeafProps['leaf'];
  comment: MarkdownEditorProps['comment'];
}

/**
 * 比较函数，用于优化 CommentLeaf 组件的渲染性能
 */
const areCommentLeafPropsEqual = (
  prevProps: CommentLeafProps,
  nextProps: CommentLeafProps,
) => {
  // 首先进行快速引用比较
  if (
    prevProps.leaf === nextProps.leaf &&
    prevProps.children === nextProps.children &&
    prevProps.comment === nextProps.comment
  ) {
    return true;
  }

  // 比较基本 props
  if (
    prevProps.children !== nextProps.children ||
    prevProps.comment !== nextProps.comment
  ) {
    return false;
  }

  // 比较 leaf 对象的关键属性
  if (prevProps.leaf !== nextProps.leaf) {
    const prevLeaf = prevProps.leaf;
    const nextLeaf = nextProps.leaf;

    // 比较 comment 相关的关键属性
    if (
      prevLeaf.comment !== nextLeaf.comment ||
      prevLeaf.id !== nextLeaf.id ||
      prevLeaf.selection !== nextLeaf.selection ||
      prevLeaf.data !== nextLeaf.data
    ) {
      return false;
    }
  }

  return true;
};

/**
 * CommentLeaf 组件：专门处理 comment（评论）类型的叶子节点
 * 这是一个包装器组件，用于包裹需要显示评论的 DOM 元素
 */
const CommentLeafComponent = ({
  children,
  leaf,
  comment,
}: CommentLeafProps) => {
  const { setShowComment } = useEditorStore();

  // 使用 useMemo 优化计算逻辑（必须在所有条件返回之前调用）
  const commentId = useMemo(() => `comment-${leaf?.id}`, [leaf?.id]);
  const commentItem = useMemo(
    () => (leaf?.comment ? (leaf.data as any) : null),
    [leaf?.comment, leaf?.data],
  );

  // 如果没有评论，直接返回子元素
  if (!leaf.comment) {
    return <>{children}</>;
  }

  debugInfo('CommentLeaf - 返回带评论的 DOM', {
    commentId: leaf?.id,
    hasCommentItem: !!leaf?.comment,
  });

  // 如果有评论，用 CommentView 包裹
  return (
    <CommentView
      id={commentId}
      comment={comment}
      selection={leaf?.selection}
      commentItem={commentItem}
      setShowComment={setShowComment}
    >
      {children}
    </CommentView>
  );
};

// 使用 React.memo 优化 CommentLeaf 组件的性能
export const CommentLeaf = React.memo(
  CommentLeafComponent,
  areCommentLeafPropsEqual,
);
