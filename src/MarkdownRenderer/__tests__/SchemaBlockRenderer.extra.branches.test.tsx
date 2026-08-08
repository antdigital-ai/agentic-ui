import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { SchemaBlockRenderer } from '../renderers/SchemaRenderer';

vi.mock('../../Schema', () => ({
  SchemaRenderer: ({ values }: { values: Record<string, unknown> }) => (
    <div data-testid="mock-schema-values">{JSON.stringify(values)}</div>
  ),
}));

describe('SchemaBlockRenderer initialValues 分支', () => {
  it.skip('initialValues 为 null / 数组时回退 {}', () => {
    render(
      <SchemaBlockRenderer language="schema">
        {
          '{"version":"1","name":"n","description":"d","component":{"type":"html","schema":"<div/>","properties":{}},"initialValues":null}'
        }
      </SchemaBlockRenderer>,
    );
    expect(screen.getByTestId('mock-schema-values').textContent).toBe('{}');

    render(
      <SchemaBlockRenderer language="schema">
        {
          '{"version":"1","name":"n","description":"d","component":{"type":"html","schema":"<div/>","properties":{}},"initialValues":[1]}'
        }
      </SchemaBlockRenderer>,
    );
    expect(screen.getAllByTestId('mock-schema-values').at(-1)!.textContent).toBe(
      '{}',
    );
  });

  it('无 initialValues 字段回退 {}', () => {
    render(
      <SchemaBlockRenderer language="apaasify">
        {
          '{"version":"1","name":"n","description":"d","component":{"type":"html","schema":"<div/>","properties":{}}}'
        }
      </SchemaBlockRenderer>,
    );
    expect(screen.getByTestId('mock-schema-values').textContent).toBe('{}');
  });

  it('schema 值为数组时走 SchemaRenderer 默认分支', () => {
    render(
      <SchemaBlockRenderer language="schema">{'[{"a":1}]'}</SchemaBlockRenderer>,
    );
    expect(screen.getByTestId('schema-renderer')).toBeTruthy();
  });

  it('codeProps.render 在 fallback 路径调用；agentar-card element type=card', () => {
    const renderFn = vi.fn((_p, defaultDom) => defaultDom);
    render(
      <SchemaBlockRenderer
        language="agentar-card"
        editorCodeProps={{ render: renderFn } as any}
      >
        {
          '{"version":"1","name":"n","description":"d","component":{"type":"html","schema":"<div/>","properties":{}},"initialValues":{"k":1}}'
        }
      </SchemaBlockRenderer>,
    );
    expect(renderFn).toHaveBeenCalled();
    const arg = renderFn.mock.calls[0][0] as any;
    expect(arg.element.type).toBe('card');
    expect(screen.getByTestId('mock-schema-values').textContent).toContain(
      '"k":1',
    );
  });
});
