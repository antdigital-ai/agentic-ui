import { EditorUtils } from '../../utils';
import { decodeURIComponentUrl, findAttachment } from './parseHtml';

/**
 * 处理图片节点
 * @param currentElement - 当前处理的图片元素，包含url和alt属性
 * @returns 返回格式化的图片节点对象
 */
export const handleImage = (currentElement: any) => {
  return EditorUtils.createMediaNode(
    decodeURIComponentUrl(currentElement?.url),
    'image',
    {
      alt: currentElement.alt,
      finished: currentElement.finished,
    },
  );
};

/**
 * 处理附件链接
 */
export const handleAttachmentLink = (currentElement: any) => {
  const text = currentElement.children
    .map((n: any) => (n as any).value || '')
    .join('');
  const attach = findAttachment(text);

  if (!attach) return null;

  const name = text.match(/>(.*)<\/a>/);
  return {
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
};

/**
 * 处理链接卡片
 */
export const handleLinkCard = (currentElement: any, config: any) => {
  const link = currentElement?.children?.at(0) as {
    type: 'link';
    url: string;
    title: string;
  };

  return {
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
};
