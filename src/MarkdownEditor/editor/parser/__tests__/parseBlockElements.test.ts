import { describe, expect, it, vi } from 'vitest';
import {
  applyInlineFormatting,
  handleBlockquote,
  handleContainerDirective,
  handleHeading,
  handleList,
  handleListItem,
  handleParagraph,
  handleTextAndInlineElements,
  processParagraphChildren,
} from '../parse/parseBlockElements';

const identity = vi.fn((nodes: any[]) =>
  nodes.map((n: any) => ({
    type: 'paragraph',
    children: [{ text: n.value || n.text || '' }],
  })),
);

describe('parseBlockElements', () => {
  describe('handleHeading', () => {
    it('returns empty text child when heading has no children', () => {
      const el = { depth: 2, children: [] };
      const result = handleHeading(el, identity);
      expect(result.type).toBe('head');
      expect(result.level).toBe(2);
      expect(result.children).toEqual([{ text: '' }]);
    });

    it('parses heading children when present', () => {
      const el = { depth: 1, children: [{ type: 'text', value: 'Title' }] };
      const result = handleHeading(el, identity);
      expect(result.level).toBe(1);
      expect(result.children.length).toBe(1);
    });
  });

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

    it('includes finished prop when defined on element', () => {
      const parseNodes = vi.fn((nodes: any[]) =>
        nodes.map(() => ({ type: 'paragraph', children: [{ text: '' }] })),
      );
      const el = {
        ordered: false,
        finished: false,
        children: [{ type: 'listItem' }],
      };
      const result = handleList(el, parseNodes);
      expect(result.finished).toBe(false);
    });

    it('omits start when ordered list has no start', () => {
      const parseNodes = vi.fn((nodes: any[]) =>
        nodes.map(() => ({ type: 'paragraph', children: [{ text: '' }] })),
      );
      const el = { ordered: true, children: [{ type: 'listItem' }] };
      const result = handleList(el, parseNodes);
      expect(result.type).toBe('numbered-list');
      expect(result.start).toBeUndefined();
    });
  });

  describe('handleListItem', () => {
    it('should extract mentions when first child of paragraph is link with multiple children', () => {
      const parseNodes = vi.fn(
        (nodes: any[], _top: boolean, _parent: any) => {
          if (!nodes?.length)
            return [{ type: 'paragraph', children: [{ text: '' }] }];
          const first = nodes[0];
          if (
            first.type === 'paragraph' &&
            first.children?.length > 1 &&
            first.children[0]?.type === 'link'
          ) {
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
              {
                type: 'link',
                url: 'https://example.com/avatar?id=99',
                text: 'Bob',
              },
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

    it('returns default children when element has no children', () => {
      const parseNodes = vi.fn();
      const el = { checked: false, children: [] };
      const result = handleListItem(el, parseNodes);
      expect(result.type).toBe('list-item');
      expect(result.children).toEqual([
        { type: 'paragraph', children: [{ text: '' }] },
      ]);
      expect(parseNodes).not.toHaveBeenCalled();
    });

    it('handles mention link url without query params', () => {
      const parseNodes = vi.fn(
        (nodes: any[]) => {
          const first = nodes[0];
          if (first?.children?.[0]?.type === 'link') {
            return [
              {
                type: 'paragraph',
                children: [
                  { url: first.children[0].url, text: first.children[0].text },
                  { text: 'rest' },
                ],
              },
            ];
          }
          return [{ type: 'paragraph', children: [{ text: '' }] }];
        },
      );
      const el = {
        checked: null,
        children: [
          {
            type: 'paragraph',
            children: [
              { type: 'link', url: 'https://example.com/avatar', text: 'Alice' },
              { type: 'text', value: ' text' },
            ],
          },
        ],
      };
      const result = handleListItem(el, parseNodes);
      expect(result.mentions).toHaveLength(1);
      expect(result.mentions![0].id).toBeUndefined();
    });
  });

  describe('processParagraphChildren', () => {
    it('handles html closing tags by skipping them', () => {
      const parseNodes = vi.fn((nodes: any[]) =>
        nodes.map((n: any) => ({ text: n.value || '' })),
      );
      const el = {
        children: [
          { type: 'html', value: '</img>' },
          { type: 'text', value: 'hello' },
        ],
      };
      const result = processParagraphChildren(el, parseNodes);
      expect(result.length).toBe(1);
      expect(result[0].type).toBe('paragraph');
    });

    it('handles html media element creating a media node', () => {
      const parseNodes = vi.fn((nodes: any[]) =>
        nodes.map((n: any) => ({ text: n.value || '' })),
      );
      const el = {
        children: [
          { type: 'html', value: '<img src="http://example.com/img.png" />' },
        ],
      };
      const result = processParagraphChildren(el, parseNodes);
      expect(result.length).toBeGreaterThanOrEqual(1);
    });

    it('handles html non-media tag as text node', () => {
      const parseNodes = vi.fn((nodes: any[]) =>
        nodes.map((n: any) => ({ text: n.value || '' })),
      );
      const el = {
        children: [{ type: 'html', value: '<div>text</div>' }],
      };
      const result = processParagraphChildren(el, parseNodes);
      expect(result.length).toBe(1);
      expect(result[0].type).toBe('paragraph');
    });

    it('handles image with finished property', () => {
      const parseNodes = vi.fn((nodes: any[]) =>
        nodes.map(() => ({ text: '' })),
      );
      const el = {
        children: [
          { type: 'image', url: 'http://example.com/img.png', alt: 'pic', finished: false },
        ],
      };
      const result = processParagraphChildren(el, parseNodes);
      expect(result.length).toBeGreaterThanOrEqual(1);
    });

    it('flushes accumulated text before image', () => {
      const parseNodes = vi.fn((nodes: any[]) =>
        nodes.map((n: any) => ({ text: n.value || '' })),
      );
      const el = {
        children: [
          { type: 'text', value: 'before' },
          { type: 'image', url: 'http://example.com/img.png', alt: 'pic' },
          { type: 'text', value: 'after' },
        ],
      };
      const result = processParagraphChildren(el, parseNodes);
      expect(result.length).toBe(3);
    });

    it('handles empty children array', () => {
      const parseNodes = vi.fn();
      const el = { children: [] };
      const result = processParagraphChildren(el, parseNodes);
      expect(result).toEqual([]);
    });
  });

  describe('handleParagraph', () => {
    it('handles attachment link html child', () => {
      const parseNodes = vi.fn((nodes: any[]) =>
        nodes.map((n: any) => ({ text: n.value || '' })),
      );
      const el = {
        children: [
          { type: 'html', value: '<a href="file.pdf" download>file.pdf</a>' },
        ],
      };
      const result = handleParagraph(el, {}, parseNodes);
      expect(result).toBeDefined();
    });

    it('handles link card when config.type is card', () => {
      const parseNodes = vi.fn((nodes: any[]) =>
        nodes.map((n: any) => ({ text: n.value || '' })),
      );
      const el = {
        children: [
          { type: 'link', url: 'https://example.com', children: [{ type: 'text', value: 'Link' }] },
        ],
      };
      const result = handleParagraph(el, { type: 'card' }, parseNodes);
      expect(result).toBeDefined();
    });

    it('falls through to processParagraphChildren for normal paragraph', () => {
      const parseNodes = vi.fn((nodes: any[]) =>
        nodes.map((n: any) => ({ text: n.value || '' })),
      );
      const el = {
        children: [{ type: 'text', value: 'just text' }],
      };
      const result = handleParagraph(el, {}, parseNodes);
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('handleBlockquote', () => {
    it('returns empty paragraph child when blockquote has no children', () => {
      const parseNodes = vi.fn();
      const el = { children: [] };
      const result = handleBlockquote(el, parseNodes);
      expect(result.type).toBe('blockquote');
      expect(result.children).toEqual([
        { type: 'paragraph', children: [{ text: '' }] },
      ]);
    });

    it('parses children when present', () => {
      const parseNodes = vi.fn((nodes: any[]) =>
        nodes.map(() => ({ type: 'paragraph', children: [{ text: 'quoted' }] })),
      );
      const el = { children: [{ type: 'paragraph', children: [{ type: 'text', value: 'quoted' }] }] };
      const result = handleBlockquote(el, parseNodes);
      expect(result.type).toBe('blockquote');
      expect(result.children.length).toBe(1);
    });
  });

  describe('handleContainerDirective', () => {
    it('creates blockquote with markdownContainerType from name', () => {
      const parseNodes = vi.fn((nodes: any[]) =>
        nodes.map(() => ({ type: 'paragraph', children: [{ text: 'content' }] })),
      );
      const el = {
        name: 'INFO',
        attributes: {},
        children: [{ type: 'paragraph', children: [{ type: 'text', value: 'content' }] }],
      };
      const result = handleContainerDirective(el, parseNodes);
      expect(result.type).toBe('blockquote');
      expect(result.otherProps.markdownContainerType).toBe('info');
    });

    it('includes title when attributes.title is a string', () => {
      const parseNodes = vi.fn((nodes: any[]) =>
        nodes.map(() => ({ type: 'paragraph', children: [{ text: '' }] })),
      );
      const el = {
        name: 'tip',
        attributes: { title: 'My Title' },
        children: [{ type: 'paragraph', children: [{ type: 'text', value: 'body' }] }],
      };
      const result = handleContainerDirective(el, parseNodes);
      expect(result.otherProps.markdownContainerTitle).toBe('My Title');
    });

    it('converts non-string title to string', () => {
      const parseNodes = vi.fn((nodes: any[]) =>
        nodes.map(() => ({ type: 'paragraph', children: [{ text: '' }] })),
      );
      const el = {
        name: 'note',
        attributes: { title: 123 },
        children: [{ type: 'text', value: 'body' }],
      };
      const result = handleContainerDirective(el, parseNodes);
      expect(result.otherProps.markdownContainerTitle).toBe('123');
    });

    it('omits title when it is null/undefined', () => {
      const parseNodes = vi.fn((nodes: any[]) =>
        nodes.map(() => ({ type: 'paragraph', children: [{ text: '' }] })),
      );
      const el = {
        name: 'note',
        attributes: { title: null },
        children: [{ type: 'text', value: 'body' }],
      };
      const result = handleContainerDirective(el, parseNodes);
      expect(result.otherProps.markdownContainerTitle).toBeUndefined();
    });

    it('omits title when it is empty after trim', () => {
      const parseNodes = vi.fn((nodes: any[]) =>
        nodes.map(() => ({ type: 'paragraph', children: [{ text: '' }] })),
      );
      const el = {
        name: 'note',
        attributes: { title: '   ' },
        children: [{ type: 'text', value: 'body' }],
      };
      const result = handleContainerDirective(el, parseNodes);
      expect(result.otherProps.markdownContainerTitle).toBeUndefined();
    });

    it('filters out closing ::: paragraph from children', () => {
      const parseNodes = vi.fn((nodes: any[]) =>
        nodes.map(() => ({ type: 'paragraph', children: [{ text: 'content' }] })),
      );
      const el = {
        name: 'info',
        children: [
          { type: 'paragraph', children: [{ type: 'text', value: 'content' }] },
          { type: 'paragraph', children: [{ type: 'text', value: ':::' }] },
        ],
      };
      const result = handleContainerDirective(el, parseNodes);
      expect(result.children.length).toBe(1);
    });

    it('returns empty paragraph when all children are filtered', () => {
      const parseNodes = vi.fn();
      const el = {
        name: 'info',
        children: [
          { type: 'paragraph', children: [{ type: 'text', value: ':::' }] },
        ],
      };
      const result = handleContainerDirective(el, parseNodes);
      expect(result.children).toEqual([
        { type: 'paragraph', children: [{ text: '' }] },
      ]);
    });

    it('uses defaults when name and attributes are missing', () => {
      const parseNodes = vi.fn((nodes: any[]) =>
        nodes.map(() => ({ type: 'paragraph', children: [{ text: '' }] })),
      );
      const el = { children: [{ type: 'text', value: 'body' }] };
      const result = handleContainerDirective(el, parseNodes);
      expect(result.otherProps.markdownContainerType).toBe('note');
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
      const linkElement = {
        type: 'link',
        url: 'https://x.com',
        finished: false,
      };

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

      const result = applyInlineFormatting(
        leaf as any,
        linkElement,
        config as any,
      );

      expect(result.url).toBe('https://fallback.com');
    });

    it('applies bold for strong element', () => {
      const leaf = { text: 'bold' } as any;
      const result = applyInlineFormatting(leaf, { type: 'strong' });
      expect(result.bold).toBe(true);
    });

    it('applies italic for emphasis element', () => {
      const leaf = { text: 'italic' } as any;
      const result = applyInlineFormatting(leaf, { type: 'emphasis' });
      expect(result.italic).toBe(true);
    });

    it('applies strikethrough for delete element', () => {
      const leaf = { text: 'deleted' } as any;
      const result = applyInlineFormatting(leaf, { type: 'delete' });
      expect(result.strikethrough).toBe(true);
    });

    it('returns leaf unchanged for unknown element types', () => {
      const leaf = { text: 'unknown' } as any;
      const result = applyInlineFormatting(leaf, { type: 'superscript' });
      expect(result.text).toBe('unknown');
      expect(result.bold).toBeUndefined();
    });

    it('sets link url without new tab when no config', () => {
      const leaf = { text: 'link' } as any;
      const el = { type: 'link', url: 'https://safe.com' };
      const result = applyInlineFormatting(leaf, el);
      expect(result.url).toBe('https://safe.com');
      expect(result.otherProps).toBeUndefined();
    });

    it('handles link with existing otherProps', () => {
      const leaf = { text: 'link', otherProps: { custom: true } } as any;
      const el = { type: 'link', url: 'https://x.com', finished: false };
      const result = applyInlineFormatting(leaf, el);
      expect(result.otherProps?.target).toBe('_blank');
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
