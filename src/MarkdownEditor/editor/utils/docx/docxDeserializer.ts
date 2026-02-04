import { jsx } from 'slate-hyperscript';
import { makeDeserializer } from './module';
import { imagePastingListener } from './utils';
/* eslint-disable no-param-reassign */
import { Node } from 'slate';
import { EditorUtils } from '../../utils';

const isMarkdownLink = (text: string) => {
  const markdownLinkRegex = /\[([^\]]+)\]\(([^)]+)\)/;
  return markdownLinkRegex.test(text);
};

export const docxDeserializer = (rtf: string, html: string): any[] => {
  const deserialize = makeDeserializer(jsx);
  // image tags have to be cleaned out and converted
  const imageTags = imagePastingListener(rtf, html);
  if (html) {
    const parsed_html = new DOMParser().parseFromString(html, 'text/html');
    const fragmentList = deserialize(
      parsed_html.body,
      imageTags || [],
    ) as any[];

    return fragmentList
      .filter((item) => {
        if (
          item.type === 'paragraph' &&
          !Node.string(item).trim() &&
          !item?.children?.at(0)?.type
        ) {
          return false;
        }
        return true;
      })
      .map((fragment) => {
        if (fragment.type === 'table') {
          return EditorUtils.wrapperCardNode(fragment);
        }
        if (fragment.type === '"paragraph"' && fragment.children.length === 1) {
          return {
            type: 'paragraph',
            children: fragment.children,
          };
        }
        if (fragment.type === 'head') {
          if (
            fragment?.children?.at(0)?.text &&
            isMarkdownLink(fragment.children.at(0).text)
          ) {
            const linkText = fragment.children.at(0).text;
            fragment.children[0] = {
              text: linkText?.replace(/\[([^\]]+)\]\(([^)]+)\)/, '$1'),
              url: linkText?.replace(/\[([^\]]+)\]\(([^)]+)\)/, '$2'),
              originalText: linkText,
            };
          }
        }
        return fragment;
      });
  }
  return [];
};
