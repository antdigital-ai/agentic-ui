import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SchemaBlockRenderer } from '../renderers/SchemaRenderer';
import * as parseJsonBody from '../renderers/utils/parseJsonBody';

vi.mock('../../Schema', () => ({
  SchemaRenderer: ({ schema }: { schema: unknown }) => (
    <div data-testid="mock-schema">{JSON.stringify(schema)}</div>
  ),
}));

describe('SchemaBlockRenderer 分支覆盖', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('非法 JSON 走 fallback pre', () => {
    vi.spyOn(parseJsonBody, 'parseSchemaJson').mockReturnValue(null);
    render(
      <SchemaBlockRenderer language="schema">{'bad'}</SchemaBlockRenderer>,
    );
    expect(screen.getByTestId('schema-fallback')).toBeTruthy();
  });

  it('apaasifyRender 返回内容时包装 container', () => {
    render(
      <SchemaBlockRenderer
        language="apaasify"
        apaasifyRender={() => <span data-testid="custom-apaasify">ok</span>}
      >
        {'{"component":{"type":"html","schema":"<div/>"}}'}
      </SchemaBlockRenderer>,
    );
    expect(screen.getByTestId('schema-container')).toBeTruthy();
    expect(screen.getByTestId('custom-apaasify')).toBeTruthy();
  });

  it('apaasifyRender 返回 undefined 时回退 SchemaRenderer', () => {
    render(
      <SchemaBlockRenderer language="schema" apaasifyRender={() => undefined}>
        {'{"version":"1","name":"n","description":"d","component":{"type":"html","schema":"<div/>","properties":{}}}'}
      </SchemaBlockRenderer>,
    );
    expect(screen.getByTestId('schema-renderer')).toBeTruthy();
  });

  it('agentar-card 语言走 card 容器', () => {
    render(
      <SchemaBlockRenderer language="agentar-card">
        {'{"version":"1","name":"n","description":"d","component":{"type":"html","schema":"<div/>","properties":{}},"initialValues":{"a":1}}'}
      </SchemaBlockRenderer>,
    );
    expect(screen.getByTestId('agentar-card-container')).toBeTruthy();
  });

  it('codeProps.render 覆盖默认 DOM；undefined / throw 回退', () => {
    const renderOk = vi.fn(() => <div data-testid="custom-render">c</div>);
    const { rerender } = render(
      <SchemaBlockRenderer
        language="schema"
        editorCodeProps={{ render: renderOk } as any}
      >
        {'{"version":"1","name":"n","description":"d","component":{"type":"html","schema":"<div/>","properties":{}}}'}
      </SchemaBlockRenderer>,
    );
    expect(screen.getByTestId('custom-render')).toBeTruthy();

    const renderUndef = vi.fn(() => undefined);
    rerender(
      <SchemaBlockRenderer
        language="schema"
        editorCodeProps={{ render: renderUndef } as any}
      >
        {'{"version":"1","name":"n","description":"d","component":{"type":"html","schema":"<div/>","properties":{}}}'}
      </SchemaBlockRenderer>,
    );
    expect(screen.getByTestId('schema-renderer')).toBeTruthy();

    const renderThrow = vi.fn(() => {
      throw new Error('boom');
    });
    rerender(
      <SchemaBlockRenderer
        language="schema"
        editorCodeProps={{ render: renderThrow } as any}
      >
        {'{"version":"1","name":"n","description":"d","component":{"type":"html","schema":"<div/>","properties":{}}}'}
      </SchemaBlockRenderer>,
    );
    expect(screen.getByTestId('schema-renderer')).toBeTruthy();
  });

  it('数组 schemaValue 时 initialValues 为空对象', () => {
    render(
      <SchemaBlockRenderer language="schema">{'[1,2]'}</SchemaBlockRenderer>,
    );
    expect(screen.getByTestId('schema-renderer')).toBeTruthy();
  });
});
