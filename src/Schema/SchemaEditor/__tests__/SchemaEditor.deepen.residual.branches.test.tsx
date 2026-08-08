/**
 * SchemaEditor deepen：空 schema；只读；mock Ace。
 */
import { render } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { SchemaEditor } from '../index';

vi.mock('../AceEditorWrapper', () => ({
  AceEditorWrapper: ({ value }: any) => (
    <div data-testid="ace-editor">{value}</div>
  ),
}));

vi.mock('../../SchemaRenderer', () => ({
  SchemaRenderer: () => <div data-testid="schema-renderer" />,
}));

describe('SchemaEditor deepen residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('默认空 schema 渲染', () => {
    expect(() =>
      render(<SchemaEditor initialValues={{}} onChange={() => {}} />),
    ).not.toThrow();
  });

  it('传入 schema 与 readonly', () => {
    expect(() =>
      render(
        <SchemaEditor
          initialSchema={{ type: 'object', properties: {} } as any}
          readonly
          onChange={() => {}}
        />,
      ),
    ).not.toThrow();
  });
});
