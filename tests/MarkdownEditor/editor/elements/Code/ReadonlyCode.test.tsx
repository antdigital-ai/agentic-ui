import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it } from 'vitest';
import { ReadonlyCode } from '../../../../../src/MarkdownEditor/editor/elements/Code/ReadonlyCode';

describe('ReadonlyCode', () => {
  const mockAttributes = {
    'data-slate-node': 'element' as const,
    ref: null,
  };

  it('应渲染只读代码块并触发 debugInfo', () => {
    const element = {
      type: 'code',
      language: 'javascript',
      value: 'const x = 1;',
      children: [{ text: '' }],
    };
    const { container } = render(
      <ReadonlyCode attributes={mockAttributes} element={element}>
        <span />
      </ReadonlyCode>,
    );
    expect(container.firstChild).toBeInTheDocument();
    expect(container.textContent).toContain('const x = 1;');
  });

  it('language 为 html 且 isConfig 时应隐藏并显示空内容', () => {
    const element = {
      type: 'code',
      language: 'html',
      value: '<config>hidden</config>',
      otherProps: { isConfig: true },
      children: [{ text: '' }],
    };
    const { container } = render(
      <ReadonlyCode attributes={mockAttributes} element={element}>
        <span />
      </ReadonlyCode>,
    );
    const div = container.firstChild as HTMLElement;
    expect(div.style.display).toBe('none');
    expect(div.textContent).toBe('');
  });

  it('language 为 html 且非 isConfig 时应 block 并展示 sanitize 内容', () => {
    const element = {
      type: 'code',
      language: 'html',
      value: '<div>Safe</div>',
      otherProps: { isConfig: false },
      children: [{ text: '' }],
    };
    const { container } = render(
      <ReadonlyCode attributes={mockAttributes} element={element}>
        <span />
      </ReadonlyCode>,
    );
    const div = container.firstChild as HTMLElement;
    expect(div.style.display).toBe('block');
    expect(div.textContent).toContain('Safe');
  });

  it('finished 为 false 时应设置 data-is-unclosed', () => {
    const element = {
      type: 'code',
      language: 'javascript',
      value: 'const a =',
      otherProps: { finished: false },
      children: [{ text: '' }],
    };
    const { container } = render(
      <ReadonlyCode attributes={mockAttributes} element={element}>
        <span />
      </ReadonlyCode>,
    );
    const div = container.firstChild as HTMLElement;
    expect(div.getAttribute('data-is-unclosed')).toBe('true');
  });
});
