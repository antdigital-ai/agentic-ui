import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { SchemaBlockRenderer } from '../../renderers/SchemaRenderer';

vi.mock('../../../Schema', () => ({
  SchemaRenderer: () => <div data-testid="schema-renderer-mock" />,
}));

describe('SchemaBlockRenderer', () => {
  it('renders fallback pre for invalid JSON', () => {
    render(
      <SchemaBlockRenderer language="schema">{'not-json'}</SchemaBlockRenderer>,
    );

    expect(screen.getByTestId('schema-fallback')).toHaveTextContent('not-json');
  });

  it('renders apaasifyRender output when provided', () => {
    const apaasifyRender = vi.fn(() => <span>Custom apaasify</span>);

    render(
      <SchemaBlockRenderer language="apaasify" apaasifyRender={apaasifyRender}>
        {JSON.stringify({ title: 'Card' })}
      </SchemaBlockRenderer>,
    );

    expect(screen.getByText('Custom apaasify')).toBeInTheDocument();
    expect(screen.getByTestId('schema-container')).toBeInTheDocument();
  });

  it('renders agentar-card container for card language', () => {
    render(
      <SchemaBlockRenderer language="agentar-card">
        {JSON.stringify({ component: 'div', props: {} })}
      </SchemaBlockRenderer>,
    );

    expect(screen.getByTestId('agentar-card-container')).toBeInTheDocument();
  });

  it('renders default schema renderer for schema language', () => {
    render(
      <SchemaBlockRenderer language="schema">
        {JSON.stringify({ component: 'div', props: {} })}
      </SchemaBlockRenderer>,
    );

    expect(screen.getByTestId('schema-renderer')).toBeInTheDocument();
  });

  it('uses custom editorCodeProps.render when provided', () => {
    const customRender = vi.fn((_props, defaultDom) => (
      <div data-testid="custom-schema">{defaultDom}</div>
    ));

    render(
      <SchemaBlockRenderer
        language="schema"
        editorCodeProps={{ render: customRender }}
      >
        {JSON.stringify({ component: 'div', props: {} })}
      </SchemaBlockRenderer>,
    );

    expect(screen.getByTestId('custom-schema')).toBeInTheDocument();
  });
});
