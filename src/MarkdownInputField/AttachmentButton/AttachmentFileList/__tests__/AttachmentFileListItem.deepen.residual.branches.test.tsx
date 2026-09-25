/**
 * AttachmentFileListItem deepen：pending→uploading、locale 回退。
 */
import { render, screen } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { I18nContext } from '../../../../I18n';
import { AttachmentFileListItem } from '../AttachmentFileListItem';

vi.mock('../AttachmentFileIcon', () => ({
  AttachmentFileIcon: () => <div data-testid="att-icon" />,
  FileMetaPlaceholder: ({ file }: { file: { name: string } }) => (
    <div data-testid="meta-ph">{file.name}</div>
  ),
}));

describe('AttachmentFileListItem deepen residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.restoreAllMocks();
  });

  it('status 缺失默认 done；pending 显示 Uploading 默认文案', () => {
    const { rerender } = render(
      <ConfigProvider>
        <I18nContext.Provider
          value={{ locale: {} as any, language: 'en-US' }}
        >
          <AttachmentFileListItem
            file={{ name: 'a.txt' } as any}
            onDelete={vi.fn()}
            prefixCls="att"
          />
        </I18nContext.Provider>
      </ConfigProvider>,
    );
    expect(screen.getByTestId('att-icon')).toBeTruthy();

    rerender(
      <ConfigProvider>
        <I18nContext.Provider
          value={{ locale: {} as any, language: 'en-US' }}
        >
          <AttachmentFileListItem
            file={{ name: 'b.txt', status: 'pending' } as any}
            onDelete={vi.fn()}
            prefixCls="att"
          />
        </I18nContext.Provider>
      </ConfigProvider>,
    );
    expect(screen.getByText('Uploading...')).toBeTruthy();
  });

  it('error 无 errorMessage 回退 Upload failed', () => {
    render(
      <ConfigProvider>
        <I18nContext.Provider
          value={{ locale: {} as any, language: 'zh-CN' }}
        >
          <AttachmentFileListItem
            file={{ name: 'e.txt', status: 'error' } as any}
            onDelete={vi.fn()}
            onRetry={vi.fn()}
            prefixCls="att"
          />
        </I18nContext.Provider>
      </ConfigProvider>,
    );
    expect(screen.getByText('Upload failed')).toBeTruthy();
  });
});
