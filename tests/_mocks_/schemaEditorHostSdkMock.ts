import { vi } from 'vitest';

/**
 * Mock for @schema-element-editor/host-sdk/core
 * 用于测试环境避免加载真实的 SDK
 */
export const createSchemaElementEditorBridge: (...args: any[]) => any = vi.fn(() => ({
  cleanup: vi.fn(),
  recording: { push: vi.fn() },
}));

export type SchemaValue = string | Record<string, any>;

