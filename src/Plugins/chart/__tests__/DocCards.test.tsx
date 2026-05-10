import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it } from 'vitest';
import { DocCards } from '../DocCards';
import {
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
    it('仅放行 http(s)/mailto/tel 与站内链接', () => {
      expect(isSafeHref('https://a.com')).toBe(true);
      expect(isSafeHref('http://a.com')).toBe(true);
      expect(isSafeHref('mailto:a@b.com')).toBe(true);
      expect(isSafeHref('tel:+861234567')).toBe(true);
      expect(isSafeHref('/foo/bar')).toBe(true);
      expect(isSafeHref('#anchor')).toBe(true);
    });

    it('拒绝危险协议与非字符串值', () => {
      expect(isSafeHref('javascript:alert(1)')).toBe(false);
      expect(isSafeHref('data:text/html,<script>')).toBe(false);
      expect(isSafeHref('')).toBe(false);
      expect(isSafeHref(undefined)).toBe(false);
      expect(isSafeHref(123 as any)).toBe(false);
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

    const tailwindLink = screen.getByRole('link', {
      name: 'https://tailwindcss.com/docs',
    });
    expect(tailwindLink).toHaveAttribute('href', 'https://tailwindcss.com/docs');
    expect(tailwindLink).toHaveAttribute('target', '_blank');
    expect(tailwindLink).toHaveAttribute('rel', 'noopener noreferrer');

    expect(screen.getByText('交互式示例')).toBeInTheDocument();
    expect(screen.getByText('深链')).toBeInTheDocument();
    expect(screen.getByText('暗色模式')).toBeInTheDocument();
  });

  it('缺少「亮点」列时不渲染标签区且不报错', () => {
    const cols = buildColumns(['名称', '简介']);
    const data = [{ 名称: 'A', 简介: 'description' }];
    const { container } = render(<DocCards columns={cols} data={data} />);
    expect(screen.getByText('A')).toBeInTheDocument();
    expect(screen.getByText('description')).toBeInTheDocument();
    expect(
      container.querySelectorAll('[class*="-item-tags"]'),
    ).toHaveLength(0);
  });

  it('无法解析主标题列时仅渲染空状态而不抛错', () => {
    const cols = buildColumns(['col1', 'col2']);
    const data = [{ col1: '1', col2: '2' }];
    render(<DocCards title="x" columns={cols} data={data} />);
    expect(screen.getByText('卡片列表')).toBeInTheDocument();
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
});
