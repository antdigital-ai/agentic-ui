import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';

import { ReadonlySchema } from '../ReadonlySchema';
import { Schema } from '../index';

const mockUseEditorStore = vi.fn();

vi.mock('../../../store', () => ({
  useEditorStore: () => mockUseEditorStore(),
}));

vi.mock('../../../../../Bubble/BubbleConfigProvide', () => ({
  BubbleConfigContext: React.createContext({}),
}));

vi.mock('../../../../../Schema', () => ({
  SchemaRenderer: (props: any) => (
    <div data-testid="mock-schema-renderer">
      {JSON.stringify(props.schema || {})}
    </div>
  ),
}));

vi.mock('../../../../../Utils/debugUtils', () => ({
  debugInfo: vi.fn(),
}));

const createSchemaProps = (language: string = 'agentar-card') =>
  ({
    element: {
      type: 'schema',
      language,
      value: {
        type: 'form',
        initialValues: { title: 'demo' },
      },
      attributes: {},
      children: [{ text: '' }],
    },
    attributes: {},
    children: <span>children</span>,
  }) as any;

describe('Schema apaasify fallback behavior', () => {
  it('Schema should fallback to default card when apaasify render returns undefined', () => {
    mockUseEditorStore.mockReturnValue({
      editorProps: {
        apaasify: {
          enable: true,
          render: vi.fn(() => undefined),
        },
      },
    });

    render(<Schema {...createSchemaProps('agentar-card')} />);

    expect(screen.getByTestId('agentar-card-container')).toBeInTheDocument();
    expect(screen.getByTestId('mock-schema-renderer')).toBeInTheDocument();
  });

  it('ReadonlySchema should fallback to default card when apaasify render returns undefined', () => {
    mockUseEditorStore.mockReturnValue({
      editorProps: {
        apaasify: {
          enable: true,
          render: vi.fn(() => undefined),
        },
      },
    });

    render(<ReadonlySchema {...createSchemaProps('agentar-card')} />);

    expect(screen.getByTestId('agentar-card-container')).toBeInTheDocument();
    expect(screen.getByTestId('mock-schema-renderer')).toBeInTheDocument();
  });

  it('Schema should keep custom render output when apaasify render returns element', () => {
    mockUseEditorStore.mockReturnValue({
      editorProps: {
        apaasify: {
          enable: true,
          render: vi.fn(() => <div data-testid="custom-apaasify-card">ok</div>),
        },
      },
    });

    render(<Schema {...createSchemaProps('agentar-card')} />);

    expect(screen.getByTestId('custom-apaasify-card')).toBeInTheDocument();
    expect(screen.queryByTestId('agentar-card-container')).toBeNull();
  });
});
