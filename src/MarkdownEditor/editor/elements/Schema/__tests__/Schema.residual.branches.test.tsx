/**
 * Schema 可编辑残留：apaasify/apassify、agentar-card、customRender 错误与 stringify。
 */
import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { Schema } from '../index';

const editorProps = vi.hoisted(() => ({ current: {} as any }));
vi.mock('../../../store', () => ({
  useEditorStore: () => ({ editorProps: editorProps.current }),
}));
vi.mock('../../../../../Schema', () => ({
  SchemaRenderer: () => <div data-testid="schema-renderer" />,
}));

describe('Schema residual branches', () => {
  it('apaasify.enable + render', () => {
    editorProps.current = {
      apaasify: {
        enable: true,
        render: () => <div data-testid="custom-apaas">X</div>,
      },
    };
    render(
      <Schema
        attributes={{} as any}
        element={{ type: 'schema', value: { a: 1 } } as any}
      >
        c
      </Schema>,
    );
    expect(screen.getByTestId('custom-apaas')).toBeInTheDocument();
  });

  it('agentar-card；customRender undefined 回落 JSON', () => {
    editorProps.current = {
      codeProps: { render: () => undefined },
    };
    render(
      <Schema
        attributes={{} as any}
        element={
          {
            type: 'schema',
            language: 'agentar-card',
            value: { initialValues: { q: 1 } },
          } as any
        }
      >
        c
      </Schema>,
    );
    expect(screen.getByTestId('schema-renderer')).toBeInTheDocument();

    editorProps.current = { codeProps: { render: () => undefined } };
    render(
      <Schema
        attributes={{} as any}
        element={{ type: 'schema', value: { b: 2 } } as any}
      >
        c
      </Schema>,
    );
    expect(screen.getByText(/"b": 2/)).toBeInTheDocument();
  });

  it('customRender 抛错无 message', () => {
    editorProps.current = {
      codeProps: {
        render: () => {
          throw 123;
        },
      },
    };
    render(
      <Schema
        attributes={{} as any}
        element={{ type: 'schema', value: { c: 3 } } as any}
      >
        c
      </Schema>,
    );
    expect(screen.getByText(/"c": 3/)).toBeInTheDocument();
  });
});
