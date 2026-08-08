/**
 * ReadonlySchema residual：apaasify.enable 无 render；自定义返回节点。
 */
import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { ReadonlySchema } from '../ReadonlySchema';

const editorProps = vi.hoisted(() => ({ current: {} as any }));
vi.mock('../../../store', () => ({
  useEditorStore: () => ({ editorProps: editorProps.current }),
}));
vi.mock('../../../../../Schema', () => ({
  SchemaRenderer: () => <div data-testid="schema-renderer" />,
}));

describe('ReadonlySchema residual branches', () => {
  it('apaasify enable 但无 render 时走默认 JSON', () => {
    editorProps.current = { apaasify: { enable: true } };
    render(
      <ReadonlySchema
        attributes={{}}
        element={{ type: 'schema', value: { z: 9 } } as any}
      >
        h
      </ReadonlySchema>,
    );
    expect(screen.getByText(/"z": 9/)).toBeTruthy();
  });

  it('codeProps.render 返回自定义节点', () => {
    editorProps.current = {
      codeProps: {
        render: () => <div data-testid="custom-schema">C</div>,
      },
    };
    render(
      <ReadonlySchema
        attributes={{}}
        element={{ type: 'schema', value: { a: 1 } } as any}
      >
        h
      </ReadonlySchema>,
    );
    expect(screen.getByTestId('custom-schema')).toBeTruthy();
  });
});
