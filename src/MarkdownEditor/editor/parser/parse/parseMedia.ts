import { debugInfo } from '../../../../Utils/debugUtils';
import { EditorUtils } from '../../utils';
import { decodeURIComponentUrl, findAttachment } from './parseHtml';

/**
 * 处理图片节点
 * @param currentElement - 当前处理的图片元素，包含url和alt属性
 * @returns 返回格式化的图片节点对象
 */
export const handleImage = (currentElement: any) => {
  debugInfo('handleImage - 处理图片', {
    url: currentElement?.url,
    alt: currentElement?.alt,
    finished: currentElement?.finished,
  });
  const result = EditorUtils.createMediaNode(
    decodeURIComponentUrl(currentElement?.url),
    'image',
    {
      alt: currentElement.alt,
      finished: currentElement.finished,
    },
  );
  debugInfo('handleImage - 图片处理完成', {
    type: (currentElement as any)?.type,
    url: (currentElement as any)?.url,
  });
  return result;
};

/**
 * 处理附件链接
 */
export const handleAttachmentLink = (currentElement: any) => {
  debugInfo('handleAttachmentLink - 处理附件链接', {
    childrenCount: currentElement.children?.length,
  });
  const text = currentElement.children
    .map((n: any) => (n as any).value || '')
    .join('');
  const attach = findAttachment(text);

  if (!attach) {
    debugInfo('handleAttachmentLink - 未找到附件');
    return null;
  }

  const name = text.match(/>(.*)<\/a>/);
  const result = {
    type: 'attach',
    url: decodeURIComponentUrl(attach?.url),
    size: attach.size,
    children: [
      {
        type: 'card-before',
        children: [{ text: '' }],
      },
      {
        type: 'card-after',
        children: [{ text: '' }],
      },
    ],
    name: name ? name[1] : attach?.url,
  };
  debugInfo('handleAttachmentLink - 附件链接处理完成', {
    type: result.type,
    url: result.url,
    size: result.size,
    name: result.name,
  });
  return result;
};

/**
 * 处理链接卡片
 */
export const handleLinkCard = (currentElement: any, config: any) => {
  debugInfo('handleLinkCard - 处理链接卡片', {
    childrenCount: currentElement?.children?.length,
    configType: config?.type,
  });
  const link = currentElement?.children?.at(0) as {
    type: 'link';
    url: string;
    title: string;
  };

  const result = {
    ...config,
    type: 'link-card',
    url: decodeURIComponentUrl(link?.url),
    children: [
      {
        type: 'card-before',
        children: [{ text: '' }],
      },
      {
        type: 'card-after',
        children: [{ text: '' }],
      },
    ],
    name: link.title,
  };
  debugInfo('handleLinkCard - 链接卡片处理完成', {
    type: result.type,
    url: result.url,
    name: result.name,
  });
  return result;
};
