import type { CommentDataType } from '../types';
import {
  findTextInReadonlyMarkdownDom,
  getReadonlyMarkdownBlocks,
} from './findTextInReadonlyMarkdownDom';

const READONLY_COMMENT_ATTR = 'data-readonly-comment';

const filterCommentsWithContent = (commentList: CommentDataType[]) =>
  commentList.filter((item) => Boolean(item.content));

export const clearReadonlyCommentHighlights = (root: HTMLElement | null) => {
  if (!root) {
    return;
  }
  root.querySelectorAll(`[${READONLY_COMMENT_ATTR}="true"]`).forEach((node) => {
    const parent = node.parentNode;
    if (!parent) {
      return;
    }
    while (node.firstChild) {
      parent.insertBefore(node.firstChild, node);
    }
    parent.removeChild(node);
  });
  root.normalize();
};

const shouldSkipTextNode = (node: globalThis.Node): boolean => {
  const parent = node.parentElement;
  if (!parent) {
    return true;
  }
  return (
    parent.closest(`[${READONLY_COMMENT_ATTR}="true"],pre,code,script,style`) !==
    null
  );
};

const findCommentMatch = (root: HTMLElement, comment: CommentDataType) => {
  const searchText = comment.refContent?.trim();
  if (!searchText) {
    return null;
  }

  const path = comment.path?.length ? [comment.path[0]] : [];
  const options = { maxResults: 1, includeMarkdownVariants: true as const };
  const match = findTextInReadonlyMarkdownDom(
    root,
    path,
    searchText,
    options,
  ).at(0);
  if (match || !path.length) {
    return match ?? null;
  }
  return (
    findTextInReadonlyMarkdownDom(root, [], searchText, options).at(0) ?? null
  );
};

const wrapMatchedText = (
  block: HTMLElement,
  offset: { start: number; end: number },
  comment: CommentDataType,
  contentPrefixCls: string,
): boolean => {
  const walker = document.createTreeWalker(block, NodeFilter.SHOW_TEXT, {
    acceptNode: (node) =>
      shouldSkipTextNode(node)
        ? NodeFilter.FILTER_REJECT
        : NodeFilter.FILTER_ACCEPT,
  });

  let consumed = 0;
  for (
    let textNode = walker.nextNode() as Text | null;
    textNode;
    textNode = walker.nextNode() as Text | null
  ) {
    const nodeStart = consumed;
    const nodeEnd = consumed + textNode.data.length;
    if (nodeEnd <= offset.start || nodeStart >= offset.end) {
      consumed = nodeEnd;
      continue;
    }

    const localStart = Math.max(0, offset.start - nodeStart);
    const localEnd = Math.min(textNode.data.length, offset.end - nodeStart);
    const text = textNode.data;
    const before = text.slice(0, localStart);
    const middle = text.slice(localStart, localEnd);
    const after = text.slice(localEnd);
    const parent = textNode.parentNode;
    if (!parent || !middle) {
      return false;
    }

    const fragment = document.createDocumentFragment();
    if (before) {
      fragment.appendChild(document.createTextNode(before));
    }

    const mark = document.createElement('mark');
    mark.id = `comment-${comment.id}`;
    mark.setAttribute('data-be', 'comment-text');
    mark.setAttribute(READONLY_COMMENT_ATTR, 'true');
    mark.className = `${contentPrefixCls}-comment-${comment.commentType || 'highlight'}`;
    mark.textContent = middle;
    fragment.appendChild(mark);

    if (after) {
      fragment.appendChild(document.createTextNode(after));
    }

    parent.replaceChild(fragment, textNode);
    return true;
  }

  return false;
};

const highlightComment = (
  root: HTMLElement,
  comment: CommentDataType,
  contentPrefixCls: string,
) => {
  const match = findCommentMatch(root, comment);
  if (!match) {
    return;
  }

  const block = getReadonlyMarkdownBlocks(root, match.path[0])[0];
  if (!block) {
    return;
  }

  wrapMatchedText(block, match.offset, comment, contentPrefixCls);
};

/** 在 markdown 只读 DOM 中按 refContent 包裹 `<mark>`，样式由 CSS 类控制。 */
export const applyReadonlyCommentHighlights = (
  root: HTMLElement | null,
  commentList: CommentDataType[] | undefined,
  contentPrefixCls: string,
) => {
  if (!root || !commentList?.length) {
    return;
  }

  clearReadonlyCommentHighlights(root);
  commentList.forEach((comment) => {
    if (comment.refContent?.trim()) {
      highlightComment(root, comment, contentPrefixCls);
    }
  });
};

export const bindReadonlyCommentClick = (
  root: HTMLElement | null,
  onShowComments: (comments: CommentDataType[]) => void,
  commentList: CommentDataType[],
) => {
  if (!root) {
    return () => {};
  }

  const handler = (event: MouseEvent) => {
    const mark = (event.target as HTMLElement | null)?.closest(
      '[data-be="comment-text"]',
    );
    if (!mark || !root.contains(mark)) {
      return;
    }
    event.stopPropagation();
    onShowComments(filterCommentsWithContent(commentList));
  };

  root.addEventListener('click', handler);
  return () => root.removeEventListener('click', handler);
};
