/* eslint-disable @typescript-eslint/no-use-before-define */
import { message } from 'antd';
import { CardNode } from '../../../el';
import { ELEMENT_TAGS } from '../../plugins/insertParsedHtmlNodes';

export const TEXT_TAGS = {
  CODE: () => ({ code: true }),
  DEL: () => ({ strikethrough: true }),
  EM: () => ({ italic: true }),
  I: () => ({ italic: true }),
  S: () => ({ strikethrough: true }),
  B: () => ({ bold: true }),
  U: () => ({ underline: true }),
};
export const makeDeserializer = (jsx: any) => {
  const deserialize = (el: any, imageTags: any): any => {
    if (
      el.attributes &&
      el.attributes.getNamedItem('class') &&
      el.attributes.getNamedItem('class').value.match(/done/g)
    ) {
      return null;
    }

    if (isList(el)) {
      return deserializeList(el, imageTags);
    }
    return deserializeElement(el, imageTags);
  };

  function deserializeList(el: any, imageTags: any) {
    const siblings = getSiblings(el);
    const type = 'UL';
    const list_wrapper = document.createElement(type);
    for (let i = 0; i < siblings.length; i++) {
      list_wrapper.appendChild(siblings[i] as any);
    }

    const attrs = ELEMENT_TAGS[type]();
    const children = Array.from(list_wrapper.childNodes)
      .map((child) => {
        return deserializeListItem(child, imageTags);
      })
      .flat();

    return jsx('element', attrs, children);
  }
  function deserializeElement(
    el: {
      nodeType?: any;
      parentNode?: any;
      textContent?: any;
      nodeName: any;
      childNodes?: any;
      getAttribute?: any;
      setAttribute?: any;
    },
    imageTags: { [x: string]: any },
  ) {
    if (el.nodeType === 3) {
      if (el.parentNode.nodeName === 'O:P') {
        if (el.parentNode.parentNode.nodeName === 'P') {
          return el.textContent;
        }
      }

      if (el.textContent.match(/^[\s]*$/gm)) {
        return el.textContent?.trim() || null;
      } else {
        // sometimes work adds line breaks when pasting
        const regex = /\n(?!\n)/g;
        el.textContent = el.textContent.replace(regex, ' ');
        return el.textContent;
      }
    } else if (el.nodeType !== 1) {
      return null;
    } else if (el.nodeName === 'BR') {
      return '\n';
    }

    const { nodeName } = el;

    let parent = el;

    if (
      nodeName === 'PRE' &&
      el.childNodes?.[0] &&
      el.childNodes?.[0]?.nodeName === 'CODE'
    ) {
      parent = el.childNodes?.[0];
    }

    let children = Array.from(parent.childNodes)
      .map((child) => {
        return deserialize(child, imageTags);
      })
      .flat();

    if (el.nodeName === 'BODY') {
      const filler = jsx('element', { type: 'paragraph', className: 'P' }, [
        { text: ' ' },
      ]);
      children.unshift(filler);
      return jsx('fragment', {}, children);
    }

    if (ELEMENT_TAGS[nodeName as keyof typeof ELEMENT_TAGS]) {
      if (nodeName === 'IMG') {
        const src = el.getAttribute('src');
        if (imageTags[src]) {
          el.setAttribute('src', imageTags[src]);
          children = [
            {
              text: '',
            },
          ];
        }
        const attrs = ELEMENT_TAGS[nodeName as keyof typeof ELEMENT_TAGS](
          el as any,
        );

        return jsx('element', attrs, (attrs as CardNode)?.children || children);
      }
      if (nodeName === 'H3' || nodeName === 'H2' || nodeName === 'H1') {
        const attrs = ELEMENT_TAGS[nodeName as keyof typeof ELEMENT_TAGS]?.(
          el as any,
        );
        return jsx(
          'element',
          {
            type: 'head',
            className: nodeName,
            level: (attrs as any)?.level || Number(nodeName?.replace('H', '')),
            align: (attrs as any)?.align,
          },
          children,
        );
      }
      const attrs = ELEMENT_TAGS[nodeName as keyof typeof ELEMENT_TAGS]?.(
        el as any,
      );
      return jsx('element', attrs, children);
    }

    if (TEXT_TAGS[nodeName as keyof typeof TEXT_TAGS]) {
      const attrs = TEXT_TAGS[nodeName as keyof typeof TEXT_TAGS]?.();
      try {
        return children.filter(Boolean).map((child: any) => {
          if (typeof child === 'string') {
            return jsx('text', attrs, child);
          }
          return jsx('element', ELEMENT_TAGS.P(), child);
        });
      } catch (error) {
        console.error(error);
      }
    }

    return children;
  }

  function deserializeListItem(el: any, imageTags: any) {
    const level = el.getAttribute('style');
    const content = extractTextFromNodes(el)
      .map((c) => {
        try {
          return deserializeElement(c as any, imageTags);
        } catch (error) {
          message.error(
            'Error deserializing list item:' + (c as HTMLElement).innerHTML,
          );
          console.error(error);
        }
        return jsx('element', { type: 'paragraph' }, [
          { text: (c as HTMLElement).innerHTML },
        ]);
      })
      .flat();
    return jsx(
      'element',
      { type: 'list-item', className: 'level'.concat(level) },
      content,
    );
  }

  return deserialize;
};

// gets ALL the
function getSiblings(el: {
  attributes: {
    getNamedItem: (arg0: string) => {
      (): any;
      new (): any;
      value: {
        (): any;
        new (): any;
        match: { (arg0: RegExp): any[]; new (): any };
      };
    };
  };
  setAttribute: (arg0: string, arg1: string) => void;
  nextElementSibling: any;
}) {
  // const level = el.attributes.getNamedItem('style').value.match(/level(\d+)/)[1]
  const siblings = [];
  while (
    el &&
    el.attributes.getNamedItem('class') &&
    el.attributes.getNamedItem('class').value.match(/MsoListParagraph/g)
  ) {
    const level =
      el?.attributes?.getNamedItem('style')?.value?.match(/level(\d+)/)?.[1] ||
      '4';

    el.setAttribute('class', 'done'); // we set this attribute to avoid getting stuck in an infinite loop
    el.setAttribute('style', level);
    siblings.push(el);
    // eslint-disable-next-line no-param-reassign
    el = el.nextElementSibling as any;
  }

  return siblings;
}

// Docx lists begin with "MsoListParagraph".
function isList(el: {
  attributes: {
    getNamedItem: (arg0: string) => { (): any; new (): any; value: string };
  };
}) {
  if (
    el.attributes &&
    el.attributes.getNamedItem('class') &&
    el.attributes.getNamedItem('class').value.match(/MsoListParagraph/g)
  ) {
    return true;
  }
  return false;
}

// receives a list item and returns the text inside it
// sometimes the text will be inside a text tag or inside a span tag.
// when it is inside a text tag, the span is irrelevant, but it contains empty text inside
function extractTextFromNodes(el: {
  childNodes: Iterable<unknown> | ArrayLike<unknown>;
}) {
  const children = Array.from(el.childNodes);
  const result: unknown[] = [];
  children.forEach((child: any) => {
    if (child.nodeName in TEXT_TAGS || child.nodeName === '#text') {
      result.push(child);
    } else if (child.nodeName === 'SPAN') {
      child.textContent = child.textContent.replace(
        /(^(\W)(?=\s)*)|(o\s)(?!\w)/gm,
        '',
      );
      result.push(child);
    }
  });
  return result;
}
