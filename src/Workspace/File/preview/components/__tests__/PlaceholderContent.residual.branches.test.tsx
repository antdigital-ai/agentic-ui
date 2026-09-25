/**
 * PlaceholderContent residual：prefix、fileInfo、locale、download、仅 children。
 */
import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { PlaceholderContent } from '../PlaceholderContent';

describe('PlaceholderContent residual branches', () => {
  it('renders child-only placeholders with an explicit prefix', () => {
    render(<PlaceholderContent prefixCls="custom">waiting</PlaceholderContent>);
    expect(
      screen.getByText('waiting').closest('.custom-placeholder'),
    ).toBeTruthy();
  });

  it('renders optional file details, localized labels, and download action', () => {
    const onDownload = vi.fn();
    render(
      <PlaceholderContent
        showFileInfo
        file={{ name: 'report.pdf', size: '' } as any}
        locale={{
          'workspace.file.fileName': 'Name: ',
          'workspace.file.clickToDownload': 'Get',
        }}
        onDownload={onDownload}
      />,
    );
    expect(screen.getByText(/Name: report.pdf/)).toBeInTheDocument();
    expect(screen.queryByText(/文件大小/)).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '下载文件' }));
    expect(onDownload).toHaveBeenCalled();
  });

  it('无 showFileInfo；仅 children', () => {
    render(
      <PlaceholderContent>
        <span>only-child</span>
      </PlaceholderContent>,
    );
    expect(screen.getByText('only-child')).toBeTruthy();
  });
});
