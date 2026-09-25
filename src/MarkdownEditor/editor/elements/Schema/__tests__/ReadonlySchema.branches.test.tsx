import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { ReadonlySchema } from '../ReadonlySchema';

const editorProps = vi.hoisted(() => ({ current: {} as any }));
vi.mock('../../../store', () => ({ useEditorStore: () => ({ editorProps: editorProps.current }) }));
vi.mock('../../../../../Schema', () => ({ SchemaRenderer: () => <div data-testid="schema-renderer" /> }));

describe('ReadonlySchema residual branches', () => {
  it('renders agentar schemas and falls back when custom rendering returns undefined', () => {
    editorProps.current = { codeProps: { render: () => undefined } };
    render(
      <ReadonlySchema attributes={{}} element={{ type: 'schema', language: 'agentar-card', value: { initialValues: {} } } as any}>
        hidden
      </ReadonlySchema>,
    );
    expect(screen.getByTestId('schema-renderer')).toBeInTheDocument();
  });

  it('falls back to default JSON when custom rendering throws', () => {
    editorProps.current = { codeProps: { render: () => { throw new Error('bad'); } } };
    render(<ReadonlySchema attributes={{}} element={{ type: 'schema', value: { a: 1 } } as any}>hidden</ReadonlySchema>);
    expect(screen.getByText(/"a": 1/)).toBeInTheDocument();
  });

  it('apassify alias + enable render；非 agentar 自定义返回 undefined', () => {
    editorProps.current = {
      apassify: {
        enable: true,
        render: () => <div data-testid="apaas">A</div>,
      },
    };
    render(
      <ReadonlySchema
        attributes={{}}
        element={{ type: 'schema', value: { x: 1 } } as any}
      >
        h
      </ReadonlySchema>,
    );
    expect(screen.getByTestId('apaas')).toBeInTheDocument();

    editorProps.current = {
      codeProps: {
        render: () => undefined,
      },
    };
    render(
      <ReadonlySchema
        attributes={{}}
        element={{ type: 'schema', value: { y: 2 } } as any}
      >
        h
      </ReadonlySchema>,
    );
    expect(screen.getByText(/"y": 2/)).toBeInTheDocument();
  });

  it('agentar-card 无 initialValues；抛错无 message 用 String', () => {
    editorProps.current = {};
    render(
      <ReadonlySchema
        attributes={{}}
        element={
          {
            type: 'schema',
            language: 'agentar-card',
            value: {},
          } as any
        }
      >
        h
      </ReadonlySchema>,
    );
    expect(screen.getByTestId('schema-renderer')).toBeInTheDocument();

    editorProps.current = {
      codeProps: {
        render: () => {
          throw 'string-err';
        },
      },
    };
    render(
      <ReadonlySchema
        attributes={{}}
        element={{ type: 'schema', value: { z: 3 } } as any}
      >
        h
      </ReadonlySchema>,
    );
    expect(screen.getByText(/"z": 3/)).toBeInTheDocument();
  });
});
