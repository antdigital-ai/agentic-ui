/**
 * FncRefForMarkdown 分支覆盖：脚注解析与渲染。
 */
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import {
  extractFootnoteRefFromSupChildren,
  FncRefForMarkdown,
} from '../FncRefForMarkdown';

vi.mock('../../MarkdownEditor/editor/elements/FncLeaf', () => ({
  FncLeaf: ({ children }: { children: React.ReactNode }) => (
    <span data-testid="fnc-leaf">{children}</span>
  ),
}));

describe('FncRefForMarkdown branches', () => {
  describe('extractFootnoteRefFromSupChildren', () => {
    it('非单个子节点返回 undefined', () => {
      expect(
        extractFootnoteRefFromSupChildren([<a key="1">1</a>, <a key="2">2</a>]),
      ).toBeUndefined();
    });

    it('非 React 元素返回 undefined', () => {
      expect(extractFootnoteRefFromSupChildren(['text'])).toBeUndefined();
    });

    it('非 a 标签返回 undefined', () => {
      expect(
        extractFootnoteRefFromSupChildren([<span key="1">x</span>]),
      ).toBeUndefined();
    });

    it('href 匹配 user-content-fn 时解析 identifier', () => {
      expect(
        extractFootnoteRefFromSupChildren([
          <a key="1" href="#user-content-fn-ref1">
            1
          </a>,
        ]),
      ).toEqual({ identifier: 'ref1', url: undefined });
    });

    it('http href 保留 url', () => {
      expect(
        extractFootnoteRefFromSupChildren([
          <a key="1" href="https://x.com/#user-content-fn-a">
            1
          </a>,
        ]),
      ).toEqual({ identifier: 'a', url: 'https://x.com/#user-content-fn-a' });
    });

    it('无 href 时用 label 文本作为 identifier', () => {
      expect(
        extractFootnoteRefFromSupChildren([<a key="1">note-id</a>]),
      ).toEqual({ identifier: 'note-id' });
    });

    it('无 href 且无 label 返回 undefined', () => {
      expect(
        extractFootnoteRefFromSupChildren([<a key="1" />]),
      ).toBeUndefined();
    });

    it('children 为 null / false 时无法解析 identifier', () => {
      expect(
        extractFootnoteRefFromSupChildren([<a key="1">{null}</a>]),
      ).toBeUndefined();
      expect(
        extractFootnoteRefFromSupChildren([<a key="1">{false}</a>]),
      ).toBeUndefined();
    });

    it('嵌套 children / 数字 / 空 children 文本提取', () => {
      expect(
        extractFootnoteRefFromSupChildren([
          <a key="1">
            <span>{42}</span>
          </a>,
        ]),
      ).toEqual({ identifier: '42' });
      expect(
        extractFootnoteRefFromSupChildren([
          <a key="1">{[null, false, 'id']}</a>,
        ]),
      ).toEqual({ identifier: 'id' });
    });
  });

  describe('FncRefForMarkdown 组件', () => {
    it('渲染 FncLeaf 包裹 children', () => {
      render(
        <FncRefForMarkdown identifier="fn1" url="https://example.com">
          <sup>1</sup>
        </FncRefForMarkdown>,
      );
      expect(screen.getByTestId('fnc-leaf')).toBeInTheDocument();
      expect(screen.getByText('1')).toBeInTheDocument();
    });

    it('传递 fncProps 与 linkConfig', () => {
      render(
        <FncRefForMarkdown
          identifier="fn2"
          fncProps={{ jumpToFootnote: vi.fn() } as any}
          linkConfig={{ openInNewTab: true }}
        >
          ref
        </FncRefForMarkdown>,
      );
      expect(screen.getByTestId('fnc-leaf')).toHaveTextContent('ref');
    });
  });
});
