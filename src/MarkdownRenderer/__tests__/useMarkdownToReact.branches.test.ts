/**
 * markdownToReactSync 分支覆盖：空内容、正常解析、自定义 components 与异常回退。
 */
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import * as markdownReactShared from '../markdownReactShared';
import { markdownToReactSync } from '../useMarkdownToReact';

describe('markdownToReactSync 分支覆盖', () => {
  it('空内容返回 null', () => {
    expect(markdownToReactSync('')).toBeNull();
  });

  it('null / undefined content 返回 null', () => {
    expect(markdownToReactSync(null as any)).toBeNull();
    expect(markdownToReactSync(undefined as any)).toBeNull();
  });

  it('解析简单 markdown 返回 React 节点', () => {
    const result = markdownToReactSync('**bold text**');
    expect(result).toBeTruthy();
  });

  it('传入自定义 components 时使用用户组件', () => {
    const CustomParagraph = (props: { children?: React.ReactNode }) =>
      React.createElement('p', { 'data-testid': 'custom-p' }, props.children);

    const result = markdownToReactSync('hello', {
      p: CustomParagraph,
    });
    expect(result).toBeTruthy();
  });

  it('未传 components 时使用默认组件映射', () => {
    const result = markdownToReactSync('# heading');
    expect(result).toBeTruthy();
  });

  it('解析失败时返回 null 并记录 debugInfo', async () => {
    const debugModule = await import('../../Utils/debugUtils');
    const debugSpy = vi
      .spyOn(debugModule, 'debugInfo')
      .mockImplementation(() => {});

    vi.spyOn(markdownReactShared, 'createHastProcessor').mockImplementation(
      () => {
        throw new Error('processor failed');
      },
    );

    expect(markdownToReactSync('# broken')).toBeNull();
    expect(debugSpy).toHaveBeenCalledWith(
      '[MarkdownRenderer] markdownToReactSync failed',
      expect.objectContaining({ error: 'processor failed' }),
    );

    vi.restoreAllMocks();
  });
});
