import type { RootContent } from 'mdast';
import { CustomLeaf } from '../../../el';
import { handleInlineCode } from './parseElements';
import { shouldTreatInlineMathAsText } from './parseMath';

/**
 * 设置节点的 finished 属性
 */
export const setFinishedProp = (
  leaf: CustomLeaf,
  finished: any,
): CustomLeaf => {
  if (finished !== false) {
    return leaf;
  }

  return {
    ...leaf,
    otherProps: {
      ...leaf.otherProps,
      finished,
    },
  };
};

/**
 * 检查 leaf 是否有格式属性需要保留
 */
const hasFormattingProps = (leaf: CustomLeaf): boolean => {
  return !!(
    leaf.bold ||
    leaf.italic ||
    leaf.strikethrough ||
    leaf.url ||
    leaf.code ||
    leaf.otherProps?.finished === false
  );
};

/**
 * 解析文本节点和内联元素
 */
export const parseText = (
  els: RootContent[],
  leaf: CustomLeaf = {
    data: {},
  },
): CustomLeaf[] => {
  let leafs: CustomLeaf[] = [];
  for (let n of els) {
    if (n.type === 'strong') {
      const strongLeaf = setFinishedProp(
        { ...leaf, bold: true },
        (n as any).finished,
      );
      const strongResult = parseText(n.children, strongLeaf);
      leafs = leafs.concat(strongResult);
      // 如果处理完嵌套节点后没有生成任何节点，且 leaf 有格式属性，生成空文本节点以保留格式
      if (strongResult.length === 0 && hasFormattingProps(strongLeaf)) {
        leafs.push({ ...strongLeaf, text: '' });
      }
      continue;
    }

    if (n.type === 'emphasis') {
      const emphasisLeaf = setFinishedProp(
        { ...leaf, italic: true },
        (n as any).finished,
      );
      const emphasisResult = parseText(n.children, emphasisLeaf);
      leafs = leafs.concat(emphasisResult);
      // 如果处理完嵌套节点后没有生成任何节点，且 leaf 有格式属性，生成空文本节点以保留格式
      if (emphasisResult.length === 0 && hasFormattingProps(emphasisLeaf)) {
        leafs.push({ ...emphasisLeaf, text: '' });
      }
      continue;
    }

    if (n.type === 'delete') {
      const deleteLeaf = { ...leaf, strikethrough: true };
      const deleteResult = parseText(n.children, deleteLeaf);
      leafs = leafs.concat(deleteResult);
      // 如果处理完嵌套节点后没有生成任何节点，且 leaf 有格式属性，生成空文本节点以保留格式
      if (deleteResult.length === 0 && hasFormattingProps(deleteLeaf)) {
        leafs.push({ ...deleteLeaf, text: '' });
      }
      continue;
    }

    if (n.type === 'link') {
      // 只有当 link 节点有 URL 时才处理为链接，否则按普通文本处理
      if (n?.url) {
        const linkLeaf = { ...leaf, url: n?.url };
        const linkResult = parseText(n.children, linkLeaf);
        leafs = leafs.concat(linkResult);
        // 如果处理完嵌套节点后没有生成任何节点，且 leaf 有格式属性，生成空文本节点以保留格式
        if (linkResult.length === 0 && hasFormattingProps(linkLeaf)) {
          leafs.push({ ...linkLeaf, text: '' });
        }
      } else {
        // 没有 URL，按普通文本处理
        const textResult = parseText(n.children, leaf);
        leafs = leafs.concat(textResult);
      }
      continue;
    }

    if (n.type === 'inlineCode') {
      const inlineCodeResult = handleInlineCode(n as any);
      leafs.push({ ...leaf, ...inlineCodeResult });
      continue;
    }

    if (n.type === 'inlineMath') {
      const inlineMathValue =
        typeof (n as any).value === 'string' ? (n as any).value : '';
      if (shouldTreatInlineMathAsText(inlineMathValue)) {
        leafs.push({ ...leaf, text: `$${inlineMathValue}$` });
      } else {
        leafs.push({
          ...leaf,
          type: 'inline-katex',
          children: [{ text: inlineMathValue }],
        } as any);
      }
      continue;
    }

    // @ts-ignore
    leafs.push({ ...leaf, text: (n as any).value || '' });
  }
  return leafs;
};

/**
 * 应用HTML标签样式到元素（纯函数版本）
 * @param el - 目标元素对象
 * @param htmlTag - HTML标签数组，包含样式信息
 * @returns 返回应用了样式的新元素对象
 */
export const applyHtmlTagsToElement = (el: any, htmlTag: any[]): any => {
  if (!htmlTag.length) {
    return el;
  }

  const result = { ...el };

  for (let t of htmlTag) {
    if (t.tag === 'font') {
      result.color = t.color;
    }
    if (t.tag === 'sup') result.identifier = el.text;
    if (t.tag === 'sub') result.identifier = el.text;
    if (t.tag === 'code') result.code = true;
    if (t.tag === 'i') result.italic = true;
    if (t.tag === 'b' || t.tag === 'strong') result.bold = true;
    if (t.tag === 'del') result.strikethrough = true;
    if ((t.tag === 'span' || t.tag === 'font') && t.color) {
      result.highColor = t.color;
    }
    if (t.tag === 'a' && t?.url) {
      result.url = t?.url;
    }
  }

  return result;
};

/**
 * 处理文本和内联元素节点（纯函数版本）
 * @param currentElement - 当前处理的元素
 * @param htmlTag - HTML标签数组
 * @param applyInlineFormattingFn - 应用内联格式的函数
 * @param parseNodesFn - 解析节点的函数
 * @returns 处理后的元素对象
 */
export const handleTextAndInlineElementsPure = (
  currentElement: any,
  htmlTag: any[],
  applyInlineFormattingFn: (leaf: CustomLeaf, element: any) => CustomLeaf,
  parseNodesFn: (children: any[], top: boolean, parent: any) => any[],
): any => {
  const elementType = currentElement.type;

  // 处理文本节点
  if (elementType === 'text') {
    const el = { text: currentElement.value };
    return htmlTag.length > 0 && currentElement.value
      ? applyHtmlTagsToElement(el, htmlTag)
      : el;
  }

  // 处理换行
  if (elementType === 'break') {
    return { text: '\n' };
  }

  // 处理内联代码（特殊处理，因为它没有 children）
  if (elementType === 'inlineCode') {
    const finished = (currentElement as any).finished;
    const leaf: CustomLeaf = {
      ...(finished === false && {
        otherProps: {
          finished,
        },
      }),
    };
    const formattedLeaf = applyInlineFormattingFn(leaf, currentElement);
    const leafWithHtmlTags = applyHtmlTagsToElement(formattedLeaf, htmlTag);
    const inlineCodeResult = handleInlineCode(currentElement);
    return { ...leafWithHtmlTags, ...inlineCodeResult };
  }

  // 处理内联元素（strong, link, emphasis, delete）
  const inlineElementTypes = ['strong', 'link', 'emphasis', 'delete'];
  if (inlineElementTypes.includes(elementType)) {
    const finished = (currentElement as any).finished;
    const leaf: CustomLeaf = {
      ...(finished === false && {
        otherProps: {
          finished,
        },
      }),
    };
    const formattedLeaf = applyInlineFormattingFn(leaf, currentElement);
    const leafWithHtmlTags = applyHtmlTagsToElement(formattedLeaf, htmlTag);

    const hasHtmlChildren = (currentElement as any)?.children?.some(
      (n: any) => n.type === 'html',
    );

    return hasHtmlChildren
      ? {
          ...parseNodesFn(
            (currentElement as any)?.children,
            false,
            currentElement,
          )?.at(0),
          url: leafWithHtmlTags.url,
        }
      : parseText(
          currentElement.children?.length
            ? currentElement.children
            : [{ value: leafWithHtmlTags?.url || '' }],
          leafWithHtmlTags,
        );
  }
  // 默认返回空文本
  return { text: '' };
};
