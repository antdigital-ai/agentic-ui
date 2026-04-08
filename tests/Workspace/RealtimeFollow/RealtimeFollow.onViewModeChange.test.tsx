/**
 * 单独测试 RealtimeFollow 在 type=html 时传入 HtmlPreview 的 onViewModeChange 回调 (index.tsx 346)
 * 通过 mock HtmlPreview 在 mount 时调用 onViewModeChange，覆盖 data.onViewModeChange?.(m) 分支
 */

import { render } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { RealtimeFollow } from '../../../src/Workspace/RealtimeFollow';
import { TestWrapper } from './testUtils';

vi.mock('../../../src/Workspace/RealtimeFollow/style', () => ({
  useRealtimeFollowStyle: vi.fn(() => undefined),
}));

vi.mock('../../../src/Workspace/HtmlPreview', () => {
  const React = require('react');
  return {
    HtmlPreview: (props: { onViewModeChange?: (mode: 'preview' | 'code') => void }) => {
      React.useEffect(() => {
        props.onViewModeChange?.('code');
      }, []);
      return React.createElement('div', { 'data-testid': 'mock-html-preview' }, React.createElement('iframe', { title: 'preview' }));
    },
  };
});

describe('RealtimeFollow onViewModeChange (346)', () => {
  it('type=html 时 HtmlPreview 调用 onViewModeChange 会触发 data.onViewModeChange', () => {
    const onViewModeChange = vi.fn();

    render(
      <TestWrapper>
        <RealtimeFollow
          data={{
            type: 'html',
            content: '<h1>Test</h1>',
            onViewModeChange,
            status: 'done',
          }}
          htmlViewMode="preview"
        />
      </TestWrapper>,
    );

    expect(document.querySelector('[data-testid="mock-html-preview"]')).toBeInTheDocument();
    expect(onViewModeChange).toHaveBeenCalledWith('code');
  });
});
