import { debugInfo } from '../../../../Utils/debugUtils';
import { CustomLeaf, Elements } from '../../../el';
import { EditorUtils } from '../../utils';
import type { ParserMarkdownToSlateNodeConfig } from '../parserMarkdownToSlateNode';
import {
  createMediaNodeFromElement,
  decodeURIComponentUrl,
  findImageElement,
} from './parseHtml';
import { handleAttachmentLink, handleLinkCard } from './parseMedia';
import { handleTextAndInlineElementsPure, setFinishedProp } from './parseText';

type ParseNodesFn = (
  nodes: any[],
  top: boolean,
  parent: any,
) => (Elements | any)[];

/**
 * 处理标题节点
 */
export const handleHeading = (
  currentElement: any,
  parseNodes: ParseNodesFn,
) => {
  debugInfo('handleHeading - 处理标题', {
    depth: currentElement.depth,
    childrenCount: currentElement.children?.length,
  });
  const result = {
    type: 'head',
    level: currentElement.depth,
    children: currentElement.children?.length
      ? parseNodes(currentElement.children, false, currentElement)
      : [{ text: '' }],
  };
  debugInfo('handleHeading - 标题处理完成', {
    level: result.level,
    childrenCount: result.children?.length,
  });
  return result;
};

/**
 * 处理列表节点
 */
export const handleList = (currentElement: any, parseNodes: ParseNodesFn) => {
  debugInfo('handleList - 处理列表', {
    ordered: currentElement.ordered,
    start: currentElement.start,
    finished: currentElement.finished,
    childrenCount: currentElement.children?.length,
  });
  
  const isOrdered = currentElement.ordered;
  const listType = isOrdered ? 'numbered-list' : 'bulleted-list';
  const children = parseNodes(currentElement.children, false, currentElement);
  const hasTask = children?.some((s: any) => typeof s.checked === 'boolean');
  
  const el: any = {
    type: listType,
    ...(currentElement.finished !== undefined && {
      finished: currentElement.finished,
    }),
    children,
  };
  
  // 有序列表需要 start 属性
  if (isOrdered && currentElement.start) {
    el.start = currentElement.start;
  }
  
  // 任务列表需要 task 属性
  if (hasTask) {
    el.task = true;
  }
  
  debugInfo('handleList - 列表处理完成', {
    type: el.type,
    start: el.start,
    task: el.task,
    childrenCount: el.children?.length,
  });
  return el;
};

/**
 * 处理脚注定义节点
 */
export const handleFootnoteDefinition = (
  currentElement: any,
  parseNodes: ParseNodesFn,
) => {
  const linkNode = parseNodes(
    currentElement.children,
    false,
    currentElement,
  )?.at(0) as any;

  const cellNode = linkNode?.children?.at(0) as any;

  return {
    value: cellNode?.text,
    url: cellNode?.url,
    type: 'footnoteDefinition',
    identifier: currentElement.identifier,
    children: [cellNode],
  };
};

/**
 * 处理列表项节点
 */
export const handleListItem = (
  currentElement: any,
  parseNodes: ParseNodesFn,
) => {
  debugInfo('handleListItem - 处理列表项', {
    checked: currentElement.checked,
    childrenCount: currentElement.children?.length,
  });
  const children = currentElement.children?.length
    ? parseNodes(currentElement.children, false, currentElement)
    : ([{ type: 'paragraph', children: [{ text: '' }] }] as any);

  let mentions = undefined;
  if (
    currentElement.children?.[0]?.children?.[0]?.type === 'link' &&
    currentElement.children?.[0]?.children?.length > 1
  ) {
    const item = children?.[0]?.children?.[0] as any;
    const label = item?.text;
    if (label) {
      mentions = [
        {
          avatar: item?.url,
          name: label,
          id:
            new URLSearchParams('?' + item?.url?.split('?')[1]).get('id') ||
            undefined,
        },
      ];
      delete children?.[0]?.children?.[0];
      debugInfo('handleListItem - 提取 mentions', { mentions });
    }
  }

  const result = {
    type: 'list-item',
    checked: currentElement.checked,
    children,
    mentions,
  };
  debugInfo('handleListItem - 列表项处理完成', {
    type: result.type,
    checked: result.checked,
    childrenCount: result.children?.length,
    hasMentions: !!result.mentions,
  });
  return result;
};

/**
 * 处理段落子节点
 */
export const processParagraphChildren = (
  currentElement: any,
  parseNodes: ParseNodesFn,
) => {
  const elements = [];
  let textNodes: any[] = [];

  for (let currentChild of currentElement.children || []) {
    if (currentChild.type === 'image') {
      // 将累积的文本节点生成段落
      if (textNodes.length) {
        elements.push({
          type: 'paragraph',
          children: parseNodes(textNodes, false, currentElement),
        });
        textNodes = [];
      }
      // 添加图片节点
      elements.push(
        EditorUtils.createMediaNode(
          decodeURIComponentUrl(currentChild?.url),
          'image',
          {
            alt: currentChild.alt,
            ...(currentChild.finished !== undefined && {
              finished: currentChild.finished,
            }),
          },
        ),
      );
    } else if (currentChild.type === 'html') {
      // 跳过媒体标签的结束标签
      if (currentChild.value.match(/^<\/(img|video|iframe)>/)) {
        continue;
      }

      const mediaElement = findImageElement(currentChild.value);
      if (mediaElement) {
        const node = createMediaNodeFromElement(mediaElement);
        if (node) {
          elements.push(node);
        }
      } else {
        textNodes.push({ type: 'html', value: currentChild.value });
      }
    } else {
      textNodes.push(currentChild);
    }
  }

  // 处理剩余的文本节点
  if (textNodes.length) {
    elements.push({
      type: 'paragraph',
      children: parseNodes(textNodes, false, currentElement),
    });
  }

  return elements;
};

/**
 * 处理段落节点
 */
export const handleParagraph = (
  currentElement: any,
  config: any,
  parseNodes: ParseNodesFn,
) => {
  debugInfo('handleParagraph - 处理段落', {
    childrenCount: currentElement.children?.length,
    firstChildType: currentElement.children?.[0]?.type,
    configType: config?.type,
  });
  // 检查是否是附件链接
  if (
    currentElement.children?.[0].type === 'html' &&
    currentElement.children[0].value.startsWith('<a')
  ) {
    debugInfo('handleParagraph - 检测到附件链接');
    const attachNode = handleAttachmentLink(currentElement);
    if (attachNode) {
      debugInfo('handleParagraph - 返回附件节点', { type: attachNode?.type });
      return attachNode;
    }
  }

  // 检查是否是链接卡片
  if (
    currentElement?.children?.at(0)?.type === 'link' &&
    config.type === 'card'
  ) {
    debugInfo('handleParagraph - 检测到链接卡片');
    const linkCard = handleLinkCard(currentElement, config);
    debugInfo('handleParagraph - 返回链接卡片', { type: linkCard?.type });
    return linkCard;
  }

  // 处理混合内容段落
  debugInfo('handleParagraph - 处理混合内容段落');
  const result = processParagraphChildren(currentElement, parseNodes);
  debugInfo('handleParagraph - 段落处理完成', {
    resultType: Array.isArray(result) ? 'array' : (result as any)?.type,
    resultLength: Array.isArray(result) ? result.length : 1,
  });
  return result;
};

/**
 * 处理引用块节点
 */
export const handleBlockquote = (
  currentElement: any,
  parseNodes: ParseNodesFn,
) => {
  debugInfo('handleBlockquote - 处理引用块', {
    childrenCount: currentElement.children?.length,
  });
  const result = {
    type: 'blockquote',
    children: currentElement.children?.length
      ? parseNodes(currentElement.children, false, currentElement)
      : [{ type: 'paragraph', children: [{ text: '' }] }],
  };
  debugInfo('handleBlockquote - 引用块处理完成', {
    type: result.type,
    childrenCount: result.children?.length,
  });
  return result;
};

/**
 * 应用内联格式到叶子节点
 */
export const applyInlineFormatting = (
  leaf: CustomLeaf,
  currentElement: any,
  config?: ParserMarkdownToSlateNodeConfig,
): CustomLeaf => {
  const result: CustomLeaf = { ...leaf };
  const elementType = currentElement.type;
  const finished = (currentElement as any).finished;

  if (elementType === 'strong') {
    return setFinishedProp({ ...result, bold: true }, finished);
  }

  if (elementType === 'emphasis') {
    return setFinishedProp({ ...result, italic: true }, finished);
  }

  if (elementType === 'delete') {
    result.strikethrough = true;
    return result;
  }

  if (elementType === 'link') {
    try {
      result.url = currentElement?.url;
      const shouldOpenInNewTab =
        config?.openLinksInNewTab || finished === false;
      if (shouldOpenInNewTab) {
        if (!result.otherProps) {
          result.otherProps = {};
        }
        (result.otherProps as any).target = '_blank';
        (result.otherProps as any).rel = 'noopener noreferrer';
        if (finished === false) {
          (result.otherProps as any).finished = finished;
        }
      }
    } catch {
      result.url = currentElement?.url;
    }
    return result;
  }

  return result;
};

/**
 * 处理文本和内联元素节点
 */
export const handleTextAndInlineElements = (
  currentElement: any,
  htmlTag: any[],
  parseNodes: ParseNodesFn,
  config?: ParserMarkdownToSlateNodeConfig,
) => {
  return handleTextAndInlineElementsPure(
    currentElement,
    htmlTag,
    (leaf, element) => applyInlineFormatting(leaf, element, config),
    parseNodes,
  );
};
