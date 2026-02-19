import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  createMediaNodeFromElement,
  decodeURIComponentUrl,
  findAttachment,
  findImageElement,
  handleHtml,
  isStandardHtmlElement,
  preprocessNonStandardHtmlTags,
  preprocessSpecialTags,
  preprocessThinkTags,
  STANDARD_HTML_ELEMENTS,
} from '../../../../src/MarkdownEditor/editor/parser/parse/parseHtml';

vi.mock('../../../../src/MarkdownEditor/editor/utils', () => ({
  EditorUtils: {
    createMediaNode: vi.fn(
      (url: string, type: string, opts?: any) => ({
        type: 'media',
        src: url,
        mediaType: type,
        ...opts,
      }),
    ),
  },
}));

vi.mock('../../../../src/MarkdownEditor/editor/plugins/insertParsedHtmlNodes', () => ({
  htmlToFragmentList: vi.fn((_html: string) => [{ type: 'paragraph', children: [{ text: '' }] }]),
}));

describe('parseHtml', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('decodeURIComponentUrl', () => {
    it('应正确解码合法 URI', () => {
      expect(decodeURIComponentUrl('hello%20world')).toBe('hello world');
    });

    it('解码失败时应返回原串并打印错误', () => {
      const bad = '%E0%A4%A'; // 非法 UTF-8 序列
      expect(decodeURIComponentUrl(bad)).toBe(bad);
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('findImageElement', () => {
    it('应解析带 src 的 img', () => {
      const r = findImageElement('<img src="https://a.com/x.png" />');
      expect(r).not.toBeNull();
      expect(r?.url).toBe('https://a.com/x.png');
      expect(r?.tagName).toBe('img');
    });

    it('应解析 video 内 source 的 src', () => {
      const html =
        '<video><source src="https://a.com/v.mp4"/></video>';
      const r = findImageElement(html);
      expect(r).not.toBeNull();
      expect(r?.url).toBe('https://a.com/v.mp4');
      expect(r?.tagName).toBe('video');
    });

    it('应解析带 height/width/align 等属性的媒体', () => {
      const html =
        '<img src="https://a.com/x.png" height="100" width="200" data-align="center" alt="alt" controls poster="https://a.com/p.jpg" />';
      const r = findImageElement(html);
      expect(r).not.toBeNull();
      expect(r?.height).toBe(100);
      expect(r?.width).toBe(200);
      expect(r?.align).toBe('center');
      expect(r?.alt).toBe('alt');
      expect(r?.poster).toBe('https://a.com/p.jpg');
    });

    it('解析异常时应返回 null 并打印错误', () => {
      const r = findImageElement(null as any);
      expect(r).toBeNull();
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('createMediaNodeFromElement', () => {
    it('mediaElement 为 null 时返回 null', () => {
      expect(createMediaNodeFromElement(null)).toBeNull();
    });

    it('应根据 tagName 生成 media 节点', () => {
      const el = {
        url: 'https://a.com/x.png',
        tagName: 'img',
        align: undefined,
        alt: undefined,
        height: undefined,
        width: undefined,
        controls: false,
        autoplay: false,
        loop: false,
        muted: false,
        poster: undefined,
      };
      const node = createMediaNodeFromElement(el);
      expect(node).not.toBeNull();
      expect((node as any).mediaType).toBe('image');
    });

    it('tagName 不在 map 时使用 image 类型', () => {
      const el = {
        url: 'x',
        tagName: 'unknown' as any,
        align: undefined,
        alt: undefined,
        height: undefined,
        width: undefined,
        controls: false,
        autoplay: false,
        loop: false,
        muted: false,
        poster: undefined,
      };
      const node = createMediaNodeFromElement(el);
      expect(node).not.toBeNull();
      expect((node as any).mediaType).toBe('image');
    });
  });

  describe('isStandardHtmlElement', () => {
    it('应识别标准标签', () => {
      expect(isStandardHtmlElement('<div>')).toBe(true);
      expect(isStandardHtmlElement('</p>')).toBe(true);
    });

    it('无标签匹配时返回 false', () => {
      expect(isStandardHtmlElement('plain text')).toBe(false);
      expect(isStandardHtmlElement('')).toBe(false);
    });
  });

  describe('handleHtml', () => {
    it('块级：<think> 应转为 code think', () => {
      const el = { value: ' <think> think content </think> ' };
      const r = handleHtml(el, null, [], undefined);
      expect(r.el).toMatchObject({
        type: 'code',
        language: 'think',
        value: 'think content',
      });
    });

    it('块级：<answer> 应转为 text', () => {
      const el = { value: ' <answer> answer content </answer> ' };
      const r = handleHtml(el, null, [], undefined);
      expect(r.el).toEqual({ text: 'answer content' });
    });

    it('块级：<br/> 应转为空段落', () => {
      const el = { value: '<br/>' };
      const r = handleHtml(el, null, [], undefined);
      expect(r.el).toMatchObject({ type: 'paragraph', children: [{ text: '' }] });
    });

    it('块级：</img> 应返回 null', () => {
      const el = { value: '</img>' };
      const r = handleHtml(el, null, [], undefined);
      expect(r.el).toBeNull();
    });

    it('块级：JSON 注释非对象/数组开头时 parseCommentContextProps 返回空', () => {
      const el = { value: '<!-- just text -->' };
      const r = handleHtml(el, null, [], undefined);
      expect(r.contextProps).toEqual({});
    });

    it('块级：注释为非法 JSON 时 parseCommentContextProps 走 catch 并返回空', () => {
      const el = { value: '<!-- { invalid json -->' };
      const r = handleHtml(el, null, [], undefined);
      expect(r.contextProps).toEqual({});
    });

    it('块级：注释为类 JSON 但解析失败时应返回空 contextProps', () => {
      const el = { value: '<!-- { -->' };
      const r = handleHtml(el, null, [], undefined);
      expect(r.contextProps).toEqual({});
    });

    it('块级：注释为 otherProps 对象（无 chartType）时应返回空文本', () => {
      const el = { value: '<!-- {"foo":1} -->' };
      const r = handleHtml(el, null, [], undefined);
      expect(r.el).toEqual({ text: '' });
    });

    it('块级：<p align="center"> 配合 parseMarkdownFn 应返回带 align 的段落', () => {
      const el = { value: '<!-- <p align="center">hello</p> -->' };
      const parseMarkdownFn = (md: string) => ({
        schema: [{ type: 'paragraph', children: [{ text: md }] }],
      });
      const r = handleHtml(el, null, [], parseMarkdownFn);
      expect(r.el).toMatchObject({
        type: 'paragraph',
        align: 'center',
        children: [{ text: 'hello' }],
        otherProps: { align: 'center' },
      });
    });

    it('块级：<p align> 内 parseMarkdownFn 返回非 paragraph 首节点时用 first.children', () => {
      const el = { value: '<!-- <p align="right">**bold**</p> -->' };
      const parseMarkdownFn = () => ({
        schema: [{ type: 'paragraph', children: [{ text: 'bold', bold: true }] }],
      });
      const r = handleHtml(el, null, [], parseMarkdownFn);
      expect(r.el.align).toBe('right');
      expect(r.el.children).toBeDefined();
    });

    it('块级：<p align> parseMarkdownFn 返回空 schema 时用 trim 文本段落', () => {
      const el = { value: '<!-- <p align="left">only text</p> -->' };
      const parseMarkdownFn = () => ({ schema: [] });
      const r = handleHtml(el, null, [], parseMarkdownFn);
      expect(r.el).toMatchObject({
        type: 'paragraph',
        align: 'left',
        children: [{ text: 'only text' }],
      });
    });

    it('块级：匹配 table/div/ul 等时应调用 htmlToFragmentList', () => {
      const el = { value: '<!-- <table><tr><td>a</td></tr></table> -->' };
      const r = handleHtml(el, null, [], undefined);
      expect(r.el).toBeDefined();
      expect(Array.isArray(r.el) || r.el?.type).toBeTruthy();
    });

    it('块级：标准 HTML 且非 table/div/ul 等时应返回 code html 节点', () => {
      const el = { value: '<!-- <span>x</span> -->' };
      const r = handleHtml(el, null, [], undefined);
      expect(r.el).toMatchObject({
        type: 'code',
        language: 'html',
        render: true,
        value: '<!-- <span>x</span> -->',
      });
    });

    it('块级：注释为 chartType 对象时 handleHtml 应转为数组格式', () => {
      const el = { value: '<!-- {"chartType":"bar"} -->' };
      const r = handleHtml(el, null, [], undefined);
      expect(el.value).toContain('[{"chartType":"bar"}]');
    });

    it('非块级（非 listItem/blockquote）走 processInlineHtml', () => {
      const parent = { type: 'paragraph' };
      const el = { value: '<strong>bold</strong>' };
      const r = handleHtml(el, parent, [], undefined);
      expect(r.htmlTag).toContainEqual({ tag: 'strong' });
      expect(r.el).toBeNull(); // 仅开始标签时 el 为 null
    });

    it('内联 <span style="color:red"> 应更新 htmlTag 带 color', () => {
      const parent = { type: 'paragraph' };
      const el = { value: '<span style="color:red">' };
      const r = handleHtml(el, parent, [], undefined);
      expect(r.el).toBeNull();
      expect(r.htmlTag).toContainEqual(
        expect.objectContaining({ tag: 'span', color: 'red' }),
      );
    });

    it('内联 <a href="https://a.com"> 应更新 htmlTag 带 url', () => {
      const parent = { type: 'paragraph' };
      const el = { value: '<a href="https://a.com">' };
      const r = handleHtml(el, parent, [], undefined);
      expect(r.htmlTag).toContainEqual(
        expect.objectContaining({ tag: 'a', url: 'https://a.com' }),
      );
    });

    it('内联 <font color="blue"> 应更新 htmlTag 带 color', () => {
      const parent = { type: 'paragraph' };
      const el = { value: '<font color="blue">' };
      const r = handleHtml(el, parent, [], undefined);
      expect(r.htmlTag).toContainEqual(
        expect.objectContaining({ tag: 'font', color: 'blue' }),
      );
    });

    it('内联 <font color=red> 无引号时也能解析 color', () => {
      const parent = { type: 'paragraph' };
      const el = { value: '<font color=red>' };
      const r = handleHtml(el, parent, [], undefined);
      expect(r.htmlTag).toContainEqual(
        expect.objectContaining({ tag: 'font', color: 'red' }),
      );
    });

    it('内联闭合标签与栈顶匹配时应弹出栈', () => {
      const parent = { type: 'paragraph' };
      const open = handleHtml({ value: '<span style="color:red">' }, parent, [], undefined);
      expect(open.htmlTag).toHaveLength(1);
      const close = handleHtml({ value: '</span>' }, parent, open.htmlTag, undefined);
      expect(close.htmlTag).toHaveLength(0);
    });

    it('内联非媒体且非标准元素时返回 text 节点', () => {
      const parent = { type: 'paragraph' };
      const el = { value: '<custom-tag>x</custom-tag>' };
      const r = handleHtml(el, parent, [], undefined);
      expect(r.el).toEqual({ text: '<custom-tag>x</custom-tag>' });
    });

    it('内联未在 htmlTagProcessors 的标签仅 push { tag }', () => {
      const parent = { type: 'paragraph' };
      const el = { value: '<b>' };
      const r = handleHtml(el, parent, [], undefined);
      expect(r.htmlTag).toEqual([{ tag: 'b' }]);
    });

    it('内联 <br/> 应返回 break 节点', () => {
      const parent = { type: 'paragraph' };
      const el = { value: '<br/>' };
      const r = handleHtml(el, parent, [], undefined);
      expect(r.el).toMatchObject({ type: 'break', children: [{ text: '\n' }] });
    });

    it('内联 <answer> 应返回 text', () => {
      const parent = { type: 'paragraph' };
      const el = { value: '<answer>inline answer</answer>' };
      const r = handleHtml(el, parent, [], undefined);
      expect(r.el).toEqual({ text: 'inline answer' });
    });

    it('内联标准元素内的 video/iframe 应返回 media 节点', () => {
      const parent = { type: 'paragraph' };
      const el = { value: '<video src="https://a.com/v.mp4"></video>' };
      const r = handleHtml(el, parent, [], undefined);
      expect(r.el).not.toBeNull();
      expect((r.el as any).type).toBe('media');
    });

    it('有 contextProps 且 el 非纯文本时 applyElementConfig 应设置 otherProps', () => {
      const el = { value: '<!-- ["chartConfig"] -->' };
      const r = handleHtml(el, null, [], undefined);
      expect(r.el?.otherProps).toBeDefined();
    });
  });

  describe('findAttachment', () => {
    it('应解析带 download 的 a 标签', () => {
      const html = '<a download href="https://a.com/f.pdf">link</a>';
      const r = findAttachment(html);
      expect(r).not.toBeNull();
      expect(r?.url).toBe('https://a.com/f.pdf');
    });

    it('应解析 data-size', () => {
      const html = '<a download href="https://a.com/f.pdf" data-size="1024">link</a>';
      const r = findAttachment(html);
      expect(r?.size).toBe(1024);
    });

    it('无匹配时返回 null', () => {
      expect(findAttachment('<a href="x">link</a>')).toBeNull();
    });

    it('解析异常时返回 null', () => {
      expect(findAttachment(null as any)).toBeNull();
    });
  });

  describe('preprocessSpecialTags', () => {
    it('应把 think 标签转为 ```think 代码块', () => {
      const md = '<think>\ncontent\n</think>';
      expect(preprocessSpecialTags(md, 'think')).toContain('```think');
      expect(preprocessSpecialTags(md, 'think')).toContain('content');
    });

    it('应把 answer 标签转为 ```answer 代码块', () => {
      const md = '<answer>yes</answer>';
      expect(preprocessSpecialTags(md, 'answer')).toContain('```answer');
    });

    it('内容中含 ``` 代码块时应替换为特殊标记', () => {
      const md = '<think>\n```js\ncode\n```\n</think>';
      const out = preprocessSpecialTags(md, 'think');
      expect(out).toContain('CODE_BLOCK');
      expect(out).toContain('code');
    });
  });

  describe('preprocessThinkTags', () => {
    it('应调用 preprocessSpecialTags(markdown, "think")', () => {
      expect(preprocessThinkTags('<think>x</think>')).toContain('```think');
    });
  });

  describe('preprocessNonStandardHtmlTags', () => {
    it('应保留标准标签，只剥非标准标签内容', () => {
      expect(preprocessNonStandardHtmlTags('<div>a</div>')).toBe('<div>a</div>');
      const custom = '<custom>inner</custom>';
      expect(preprocessNonStandardHtmlTags(custom)).toBe('inner');
    });

    it('嵌套非标准标签应循环直到稳定', () => {
      const md = '<outer><inner>x</inner></outer>';
      expect(preprocessNonStandardHtmlTags(md)).toBe('x');
    });
  });

  describe('STANDARD_HTML_ELEMENTS', () => {
    it('应包含常用标签', () => {
      expect(STANDARD_HTML_ELEMENTS.has('div')).toBe(true);
      expect(STANDARD_HTML_ELEMENTS.has('img')).toBe(true);
    });
  });
});
