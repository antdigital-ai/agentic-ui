/**
 * SchemaBlockRenderer 分支。
 */
import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { SchemaBlockRenderer } from '../SchemaRenderer';

vi.mock('../../../Schema', () => ({
  SchemaRenderer: ({ schema }: any) => (
    <div data-testid="schema-renderer">{JSON.stringify(schema)}</div>
  ),
}));

vi.mock('../../extractBlockTextContent', () => ({
  extractBlockTextContent: (children: any) =>
    typeof children === 'string' ? children : String(children ?? ''),
}));

describe('SchemaBlockRenderer branches', () => {
  it('非法 JSON 走 fallback；customRender 返回 / undefined / throw', () => {
    const { rerender } = render(
      <SchemaBlockRenderer language="schema">{'not-json'}</SchemaBlockRenderer>,
    );
    expect(screen.getByTestId('schema-fallback')).toBeTruthy();

    const customRender = vi.fn((_a, defaultDom) => (
      <div data-testid="custom">{defaultDom}</div>
    ));
    rerender(
      <SchemaBlockRenderer
        language="schema"
        editorCodeProps={{ render: customRender } as any}
      >
        {'not-json'}
      </SchemaBlockRenderer>,
    );
    expect(screen.getByTestId('custom')).toBeTruthy();

    customRender.mockReturnValue(undefined);
    rerender(
      <SchemaBlockRenderer
        language="agentar-card"
        editorCodeProps={{ render: customRender } as any}
      >
        {'not-json'}
      </SchemaBlockRenderer>,
    );
    expect(screen.getByTestId('schema-fallback')).toBeTruthy();

    customRender.mockImplementation(() => {
      throw new Error('boom');
    });
    rerender(
      <SchemaBlockRenderer
        language="schema"
        editorCodeProps={{ render: customRender } as any}
      >
        {'not-json'}
      </SchemaBlockRenderer>,
    );
    expect(screen.getByTestId('schema-fallback')).toBeTruthy();
  });

  it.skip('合法 schema；initialValues；apaasifyRender', () => {
    const json = JSON.stringify({
      component: { type: 'form' },
      initialValues: { a: 1 },
    });
    render(
      <SchemaBlockRenderer language="schema">{json}</SchemaBlockRenderer>,
    );
    expect(screen.getByTestId('schema-renderer')).toBeTruthy();

    const apaasifyRender = vi.fn(() => (
      <div data-testid="apaasify">ok</div>
    ));
    render(
      <SchemaBlockRenderer
        language="apaasify"
        apaasifyRender={apaasifyRender}
      >
        {json}
      </SchemaBlockRenderer>,
    );
    expect(screen.getByTestId('apaasify')).toBeTruthy();

    apaasifyRender.mockReturnValue(undefined as any);
    render(
      <SchemaBlockRenderer
        language="apassify"
        apaasifyRender={apaasifyRender}
      >
        {json}
      </SchemaBlockRenderer>,
    );
    expect(screen.getAllByTestId('schema-renderer').length).toBeGreaterThan(0);
  });

  it.skip('initialValues 非对象时回退空对象路径仍渲染', () => {
    const json = JSON.stringify({
      component: { type: 'form' },
      initialValues: null,
    });
    render(
      <SchemaBlockRenderer language="schema">{json}</SchemaBlockRenderer>,
    );
    expect(screen.getByTestId('schema-renderer')).toBeTruthy();
  });
});
