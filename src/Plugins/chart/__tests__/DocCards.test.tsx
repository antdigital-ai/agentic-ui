import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it } from 'vitest';
import { DocCards } from '../DocCards';
import {
  formatDisplayUrl,
  isExternalLink,
  isSafeHref,
  resolveDocCardsFields,
  splitTags,
} from '../DocCards/utils';

const buildColumns = (titles: string[]) =>
  titles.map((t) => ({ title: t, dataIndex: t, key: t }));

describe('DocCards utils', () => {
  describe('splitTags', () => {
    it('支持半角逗号、分号、竖线、斜杠与全角分隔符混排', () => {
      expect(splitTags('a, b; c | d / e、f；g，h')).toEqual([
        'a',
        'b',
        'c',
        'd',
        'e',
        'f',
        'g',
        'h',
      ]);
    });

    it('忽略首尾空白与连续分隔符', () => {
      expect(splitTags('  a , , b ; ; c  ')).toEqual(['a', 'b', 'c']);
    });

    it('去重时保持首次出现顺序', () => {
      expect(splitTags('a, b, a, c, b')).toEqual(['a', 'b', 'c']);
    });

    it('空值与非字符串退化为空数组', () => {
      expect(splitTags('')).toEqual([]);
      expect(splitTags('   ')).toEqual([]);
      expect(splitTags(null)).toEqual([]);
      expect(splitTags(undefined)).toEqual([]);
    });
  });

  describe('isSafeHref', () => {
    it('放行 http(s)/mailto/tel 与站内绝对/相对路径与锚点', () => {
      expect(isSafeHref('https://a.com')).toBe(true);
      expect(isSafeHref('http://a.com')).toBe(true);
      expect(isSafeHref('mailto:a@b.com')).toBe(true);
      expect(isSafeHref('tel:+861234567')).toBe(true);
      expect(isSafeHref('/foo/bar')).toBe(true);
      expect(isSafeHref('./foo')).toBe(true);
      expect(isSafeHref('../foo')).toBe(true);
      expect(isSafeHref('#anchor')).toBe(true);
    });

    it('拒绝 protocol-relative URL 避免绕过协议白名单', () => {
      // //evil.com 在 https 页会跳到 https://evil.com，等价于外部链接但不在白名单内
      expect(isSafeHref('//evil.com')).toBe(false);
      expect(isSafeHref('  //evil.com  ')).toBe(false);
      expect(isSafeHref('//evil.com/path?x=1')).toBe(false);
    });

    it('拒绝危险协议与非字符串值', () => {
      expect(isSafeHref('javascript:alert(1)')).toBe(false);
      expect(isSafeHref('JavaScript:alert(1)')).toBe(false);
      expect(isSafeHref('data:text/html,<script>')).toBe(false);
      expect(isSafeHref('vbscript:msgbox(1)')).toBe(false);
      expect(isSafeHref('')).toBe(false);
      expect(isSafeHref('   ')).toBe(false);
      expect(isSafeHref(undefined)).toBe(false);
      expect(isSafeHref(123 as any)).toBe(false);
    });
  });

  describe('isExternalLink', () => {
    it('http(s)/mailto/tel 视为外部', () => {
      expect(isExternalLink('https://a.com')).toBe(true);
      expect(isExternalLink('http://a.com')).toBe(true);
      expect(isExternalLink('mailto:a@b.com')).toBe(true);
      expect(isExternalLink('tel:+861234567')).toBe(true);
    });

    it('站内路径与锚点视为内部', () => {
      expect(isExternalLink('/foo')).toBe(false);
      expect(isExternalLink('./foo')).toBe(false);
      expect(isExternalLink('../foo')).toBe(false);
      expect(isExternalLink('#anchor')).toBe(false);
    });

    it('空值/非字符串视为内部以避免误开新 tab', () => {
      expect(isExternalLink('')).toBe(false);
      expect(isExternalLink(null)).toBe(false);
      expect(isExternalLink(undefined)).toBe(false);
    });
  });

  describe('formatDisplayUrl', () => {
    it('http(s) 链接展示 host + path 并去掉根路径', () => {
      expect(formatDisplayUrl('https://tailwindcss.com/docs')).toBe(
        'tailwindcss.com/docs',
      );
      expect(formatDisplayUrl('https://example.com/')).toBe('example.com');
      expect(formatDisplayUrl('http://a.com/b?c=1')).toBe('a.com/b?c=1');
    });

    it('mailto / tel 去 scheme 后展示纯地址', () => {
      expect(formatDisplayUrl('mailto:a@b.com')).toBe('a@b.com');
      expect(formatDisplayUrl('tel:+861234567')).toBe('+861234567');
    });

    it('相对路径与解析失败时原样返回', () => {
      expect(formatDisplayUrl('/foo/bar')).toBe('/foo/bar');
      expect(formatDisplayUrl('not a url')).toBe('not a url');
    });

    it('超过 maxLength 时按尾部省略', () => {
      const long = `https://example.com/${'a'.repeat(100)}`;
      const out = formatDisplayUrl(long, 32);
      expect(out.endsWith('…')).toBe(true);
      expect(out.length).toBeLessThanOrEqual(33);
    });

    it('空值与非字符串退化为空字符串', () => {
      expect(formatDisplayUrl('')).toBe('');
      expect(formatDisplayUrl(undefined)).toBe('');
      expect(formatDisplayUrl(123 as any)).toBe('');
    });
  });

  describe('resolveDocCardsFields', () => {
    it('按默认别名命中中英文表头', () => {
      const fields = resolveDocCardsFields([
        '名称',
        '地址',
        '简介',
        '亮点',
      ]);
      expect(fields).toEqual({
        title: '名称',
        url: '地址',
        description: '简介',
        tags: '亮点',
      });
    });

    it('支持「逻辑名 + 括号单位」的宽松匹配', () => {
      const fields = resolveDocCardsFields([
        '名称（站点）',
        'URL',
        '描述（中文）',
      ]);
      expect(fields?.title).toBe('名称（站点）');
      expect(fields?.url).toBe('URL');
      expect(fields?.description).toBe('描述（中文）');
      expect(fields?.tags).toBeUndefined();
    });

    it('fieldMap 覆盖优先级高于默认别名', () => {
      const fields = resolveDocCardsFields(
        ['Foo', '名称', '简介'],
        { title: 'Foo' },
      );
      expect(fields?.title).toBe('Foo');
      expect(fields?.description).toBe('简介');
    });

    it('无法解析主标题列时返回 null', () => {
      expect(resolveDocCardsFields(['col1', 'col2'])).toBeNull();
    });
  });
});

describe('DocCards 组件渲染', () => {
  const sampleColumns = buildColumns(['名称', '地址', '简介', '亮点']);
  const sampleData = [
    {
      名称: 'Tailwind CSS Docs',
      地址: 'https://tailwindcss.com/docs',
      简介: '结构清晰、搜索与导航强',
      亮点: '交互式示例, 深链, 暗色模式',
    },
    {
      名称: 'MDN',
      地址: 'https://developer.mozilla.org',
      简介: '权威 Web 参考',
      亮点: '多语言、可折叠、示例可编辑',
    },
  ];

  it('每一行表格渲染为一张卡片，并解析标签胶囊', () => {
    render(
      <DocCards
        title="优秀开发者文档站"
        columns={sampleColumns}
        data={sampleData}
      />,
    );

    expect(screen.getByText('优秀开发者文档站')).toBeInTheDocument();
    expect(screen.getByText('Tailwind CSS Docs')).toBeInTheDocument();
    expect(screen.getByText('MDN')).toBeInTheDocument();

    // 链接展示 hostname + path，但 href / title attribute 仍是原始 URL
    const tailwindLink = screen.getByRole('link', {
      name: 'tailwindcss.com/docs',
    });
    expect(tailwindLink).toHaveAttribute('href', 'https://tailwindcss.com/docs');
    expect(tailwindLink).toHaveAttribute('target', '_blank');
    expect(tailwindLink).toHaveAttribute('rel', 'noopener noreferrer');

    expect(screen.getByText('交互式示例')).toBeInTheDocument();
    expect(screen.getByText('深链')).toBeInTheDocument();
    expect(screen.getByText('暗色模式')).toBeInTheDocument();

    expect(screen.getByTestId('doc-cards')).toBeInTheDocument();
    expect(screen.getByTestId('doc-cards-grid')).toBeInTheDocument();
    expect(screen.getByTestId('doc-cards-header')).toBeInTheDocument();
    expect(screen.getByTestId('doc-cards-title')).toHaveTextContent(
      '优秀开发者文档站',
    );
    expect(screen.getByTestId('doc-cards-item-0')).toBeInTheDocument();
    expect(screen.getByTestId('doc-cards-item-0-title')).toHaveTextContent(
      'Tailwind CSS Docs',
    );
    expect(screen.getByTestId('doc-cards-item-0-link')).toHaveAttribute(
      'href',
      'https://tailwindcss.com/docs',
    );
    expect(screen.getByTestId('doc-cards-item-0-tags')).toBeInTheDocument();
    expect(screen.getByTestId('doc-cards-item-0-tag-0')).toHaveTextContent(
      '交互式示例',
    );
  });

  it('缺少「亮点」列时不渲染标签区且不报错', () => {
    const cols = buildColumns(['名称', '简介']);
    const data = [{ 名称: 'A', 简介: 'description' }];
    render(<DocCards columns={cols} data={data} />);
    expect(screen.getByText('A')).toBeInTheDocument();
    expect(screen.getByText('description')).toBeInTheDocument();
    expect(screen.queryByTestId('doc-cards-item-0-tags')).not.toBeInTheDocument();
  });

  it('无法解析主标题列时仅渲染空状态而不抛错', () => {
    const cols = buildColumns(['col1', 'col2']);
    const data = [{ col1: '1', col2: '2' }];
    render(<DocCards title="x" columns={cols} data={data} />);
    expect(screen.getByTestId('doc-cards-empty')).toHaveTextContent('卡片列表');
  });

  it('不安全 URL 走纯文本，不渲染为可点击链接', () => {
    const data = [
      {
        名称: 'X',
        地址: 'javascript:alert(1)',
      },
    ];
    render(
      <DocCards columns={buildColumns(['名称', '地址'])} data={data} />,
    );
    expect(
      screen.queryByRole('link', { name: /javascript/ }),
    ).not.toBeInTheDocument();
    expect(screen.getByText('javascript:alert(1)')).toBeInTheDocument();
  });

  it('cardColumns 控制 grid-template-columns，超过 4 时 clamp 到 4', () => {
    const cols = buildColumns(['名称']);
    const data = [{ 名称: 'a' }];
    const { rerender } = render(
      <DocCards columns={cols} data={data} cardColumns={3} />,
    );
    const grid = screen.getByTestId('doc-cards-grid');
    expect(grid.style.gridTemplateColumns).toBe('repeat(3, minmax(0, 1fr))');

    rerender(<DocCards columns={cols} data={data} cardColumns={9} />);
    const grid2 = screen.getByTestId('doc-cards-grid');
    expect(grid2.style.gridTemplateColumns).toBe(
      'repeat(4, minmax(0, 1fr))',
    );
  });

  it('toolbar 与 title 在同一 header 行渲染', () => {
    const cols = buildColumns(['名称']);
    const data = [{ 名称: 'a' }];
    render(
      <DocCards
        title="标题"
        toolbar={<button type="button">tool</button>}
        columns={cols}
        data={data}
      />,
    );
    expect(screen.getByText('标题')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'tool' })).toBeInTheDocument();
    expect(screen.getByTestId('doc-cards-toolbar')).toContainElement(
      screen.getByRole('button', { name: 'tool' }),
    );
  });

  it('描述列纯空白时不渲染段落', () => {
    const cols = buildColumns(['名称', '简介']);
    const data = [{ 名称: 'a', 简介: '   ' }];
    render(<DocCards columns={cols} data={data} />);
    expect(screen.queryByTestId('doc-cards-item-0-desc')).not.toBeInTheDocument();
  });

  it('外部链接打新 tab，站内路径/锚点保持原 tab', () => {
    const data = [
      { 名称: 'External', 地址: 'https://a.com/x' },
      { 名称: 'Anchor', 地址: '#section' },
      { 名称: 'Internal', 地址: '/foo/bar' },
    ];
    render(<DocCards columns={buildColumns(['名称', '地址'])} data={data} />);
    const external = screen.getByRole('link', { name: 'a.com/x' });
    expect(external).toHaveAttribute('target', '_blank');
    expect(external).toHaveAttribute('rel', 'noopener noreferrer');

    const anchor = screen.getByRole('link', { name: '#section' });
    expect(anchor).not.toHaveAttribute('target');
    expect(anchor).not.toHaveAttribute('rel');

    const internal = screen.getByRole('link', { name: '/foo/bar' });
    expect(internal).not.toHaveAttribute('target');
    expect(internal).not.toHaveAttribute('rel');
  });

  it('protocol-relative URL 不渲染为可点击链接', () => {
    const data = [{ 名称: 'X', 地址: '//evil.com/path' }];
    render(<DocCards columns={buildColumns(['名称', '地址'])} data={data} />);
    expect(
      screen.queryByRole('link', { name: /evil/ }),
    ).not.toBeInTheDocument();
    // 仍以纯文本展示
    expect(screen.getByText('//evil.com/path')).toBeInTheDocument();
  });

  it('标签容器 aria-label 使用「标签列表」文案而非容器名', () => {
    const data = [{ 名称: 'a', 亮点: 'tag1, tag2' }];
    render(
      <DocCards columns={buildColumns(['名称', '亮点'])} data={data} />,
    );
    const tagsContainer = screen.getByTestId('doc-cards-item-0-tags');
    expect(tagsContainer.getAttribute('aria-label')).toBe('标签列表');
  });
});
