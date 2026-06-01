import { describe, expect, it } from 'vitest';
import {
  FILE_TREE_DIR_KEY_PREFIX,
  FILE_TREE_LEAF_KEY_PREFIX,
  WORKSPACE_FILE_NODE_ID_PREFIX,
  fileIdOrTreeKeyToRelativePath,
} from '../workspaceFileId';

describe('workspaceFileId', () => {
  it('应解析 workspace: 与 file: 为同一相对路径', () => {
    expect(fileIdOrTreeKeyToRelativePath('workspace:AGENTS.md')).toBe(
      'AGENTS.md',
    );
    expect(fileIdOrTreeKeyToRelativePath('file:AGENTS.md')).toBe('AGENTS.md');
  });

  it('目录 key 应返回 null', () => {
    expect(
      fileIdOrTreeKeyToRelativePath(`${FILE_TREE_DIR_KEY_PREFIX}src`),
    ).toBeNull();
  });

  it('无前缀时应原样返回', () => {
    expect(fileIdOrTreeKeyToRelativePath('readme.md')).toBe('readme.md');
  });

  it('导出前缀常量', () => {
    expect(WORKSPACE_FILE_NODE_ID_PREFIX).toBe('workspace:');
    expect(FILE_TREE_LEAF_KEY_PREFIX).toBe('file:');
    expect(FILE_TREE_DIR_KEY_PREFIX).toBe('dir:');
  });
});
