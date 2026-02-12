import { describe, expect, it, vi } from 'vitest';
import {
  applyInlineFormatting,
  handleList,
  handleListItem,
  handleTextAndInlineElements,
} from '../parse/parseBlockElements';

describe('parseBlockElements', () => {
  describe('handleList', () => {
    it('should set el.start when ordered list has start attribute', () => {
      const parseNodes = vi.fn((nodes: any[]) =>
        nodes.map(() => ({ type: 'paragraph', children: [{ text: 'item' }] })),
      );
      const currentElement = {
        ordered: true,
        start: 5,
        children: [{ type: 'listItem', children: [] }],
      };

      const result = handleList(currentElement, parseNodes);

      expect(result.type).toBe('numbered-list');
      expect(result.start).toBe(5);
    });

    it('should set el.task when list has task item', () => {
      const parseNodes = vi.fn((nodes: any[]) =>
        nodes.map(() => ({
          type: 'list-item',
          checked: true,
          children: [{ type: 'paragraph', children: [{ text: 'task' }] }],
        })),
      );
      const currentElement = {
        ordered: false,
        children: [{ type: 'listItem', checked: true, children: [] }],
      };

      const result = handleList(currentElement, parseNodes);

      expect(result.task).toBe(true);
    });
  });

  describe('handleListItem', () => {
    it('should extract mentions when first child of paragraph is link with multiple children', () => {
      const parseNodes = vi.fn(
        // eslint-disable-next-line @typescript-eslint/no-unused-vars -- 签名需与 parseNodes 一致
        (nodes: any[], _top: boolean, _parent: any) => {
          if (!nodes?.length) return [{ type: 'paragraph', children: [{ text: '' }] }];
          const first = nodes[0];
          if (first.type === 'paragraph' && first.children?.length > 1 && first.children[0]?.type === 'link') {
            const link = first.children[0];
            return [
              {
                type: 'paragraph',
                children: [
                  { url: link.url, text: link.text },
                  { text: (first.children[1] as any)?.value ?? '' },
                ],
              },
            ];
          }
          return [{ type: 'paragraph', children: [{ text: '' }] }];
        },
      );

      const currentElement = {
        checked: null,
        children: [
          {
            type: 'paragraph',
            children: [
              { type: 'link', url: 'https://example.com/avatar?id=99', text: 'Bob' },
              { type: 'text', value: ' 回复' },
            ],
          },
        ],
      };

      const result = handleListItem(currentElement, parseNodes);

      expect(result.type).toBe('list-item');
      expect(result.mentions).toHaveLength(1);
      expect(result.mentions![0]).toMatchObject({
        avatar: 'https://example.com/avatar?id=99',
        name: 'Bob',
        id: '99',
      });
    });
  });

  describe('applyInlineFormatting', () => {
    it('should set url and otherProps.target/rel when config.openLinksInNewTab is true', () => {
      const leaf = { text: 'link' };
      const linkElement = { type: 'link', url: 'https://x.com' };
      const config = { openLinksInNewTab: true };

      const result = applyInlineFormatting(leaf as any, linkElement, config);

      expect(result.url).toBe('https://x.com');
      expect(result.otherProps).toEqual({
        target: '_blank',
        rel: 'noopener noreferrer',
      });
    });

    it('should set otherProps.finished when link element has finished === false', () => {
      const leaf = { text: 'link' };
      const linkElement = { type: 'link', url: 'https://x.com', finished: false };

      const result = applyInlineFormatting(leaf as any, linkElement);

      expect(result.url).toBe('https://x.com');
      expect(result.otherProps).toBeDefined();
      expect(result.otherProps!.target).toBe('_blank');
      expect(result.otherProps!.finished).toBe(false);
    });

    it('should set url in catch when try throws', () => {
      const leaf = { text: 'link' };
      const linkElement = { type: 'link', url: 'https://fallback.com' };
      const config = {
        get openLinksInNewTab() {
          throw new Error('config access');
        },
      };

      const result = applyInlineFormatting(leaf as any, linkElement, config as any);

      expect(result.url).toBe('https://fallback.com');
    });
  });

  describe('handleTextAndInlineElements', () => {
    it('should pass config to applyInlineFormatting for link element', () => {
      const currentElement = {
        type: 'link',
        url: 'https://config-test.com',
        children: [{ type: 'text', value: 'link' }],
      };
      const htmlTag: any[] = [];
      const parseNodes = vi.fn((children: any[]) =>
        children.map((c: any) => ({ text: c.value || '' })),
      );
      const config = { openLinksInNewTab: true };

      const result = handleTextAndInlineElements(
        currentElement,
        htmlTag,
        parseNodes,
        config,
      );

      expect(result).toBeDefined();
      const leaves = Array.isArray(result) ? result : [result];
      const linkLeaf = leaves.find((l: any) => l.url);
      expect(linkLeaf).toBeDefined();
      expect(linkLeaf!.url).toBe('https://config-test.com');
      expect((linkLeaf as any).otherProps?.target).toBe('_blank');
    });
  });
});
