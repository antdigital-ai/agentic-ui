import { vi } from 'vitest';

/**
 * Mock for @schema-editor/host-sdk/core
 * 用于测试环境避免加载真实的 SDK
 */
export const createSchemaEditorBridge = vi.fn(() => vi.fn());

export type SchemaValue = string | Record<string, any>;

