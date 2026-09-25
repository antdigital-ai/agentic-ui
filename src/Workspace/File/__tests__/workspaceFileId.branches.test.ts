import { describe, expect, it } from 'vitest';
import { fileIdOrTreeKeyToRelativePath } from '../workspaceFileId';

describe('workspaceFileId.branches', () => {
  it('空串 / dir 前缀返回 null', () => {
    // if (!idOrKey) return null;
    expect(fileIdOrTreeKeyToRelativePath('')).toBeNull();
    expect(fileIdOrTreeKeyToRelativePath('dir:docs')).toBeNull();
  });

  it('workspace / file 前缀与裸路径', () => {
    expect(fileIdOrTreeKeyToRelativePath('workspace:a/b.md')).toBe('a/b.md');
    expect(fileIdOrTreeKeyToRelativePath('workspace:')).toBeNull();
    expect(fileIdOrTreeKeyToRelativePath('file:a/b.md')).toBe('a/b.md');
    expect(fileIdOrTreeKeyToRelativePath('plain/path.md')).toBe('plain/path.md');
  });
});
