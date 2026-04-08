/**
 * InlineChromiumBugfix 组件测试
 */
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it } from 'vitest';
import { InlineChromiumBugfix } from '../../../../src/MarkdownEditor/editor/utils/InlineChromiumBugfix';

describe('InlineChromiumBugfix', () => {
  it('应渲染不可编辑的 span 并包含零宽内容', () => {
    const { container } = render(<InlineChromiumBugfix />);
    const span = container.querySelector('span');
    expect(span).toBeInTheDocument();
    expect(span).toHaveAttribute('contenteditable', 'false');
    expect(span?.textContent).toBe(String.fromCodePoint(160));
  });
});
