import { describe, expect, it } from 'vitest';

import { parseJsonBody, parseSchemaJson } from '../parseJsonBody';

describe('parseJsonBody', () => {
  it('parses JSON5 syntax used by agentic renderer blocks', () => {
    expect(
      parseJsonBody(`
        {
          // agentic block payloads tolerate comments and trailing commas
          items: [{ key: 'task-1', title: 'Check coverage' }],
        }
      `),
    ).toEqual({
      items: [{ key: 'task-1', title: 'Check coverage' }],
    });
  });

  it('falls back to partial parsing for streaming truncated objects', () => {
    expect(
      parseJsonBody('{"items":[{"key":"task-1","title":"Streaming"'),
    ).toEqual({
      items: [{ key: 'task-1', title: 'Streaming' }],
    });
  });

  it('returns an empty object for empty agentic block content', () => {
    expect(parseJsonBody('')).toEqual({});
  });

  it('returns null when JSON5 and partial parsing both fail', () => {
    expect(parseJsonBody('__PARSE_FAIL__')).toBeNull();
  });
});

describe('parseSchemaJson', () => {
  it('parses strict schema JSON', () => {
    expect(
      parseSchemaJson(
        JSON.stringify([{ type: 'input', name: 'username', required: true }]),
      ),
    ).toEqual([{ type: 'input', name: 'username', required: true }]);
  });

  it('falls back to partial parsing for streaming truncated arrays', () => {
    expect(
      parseSchemaJson('[{"type":"input","name":"username"},{"type":"select"'),
    ).toEqual([{ type: 'input', name: 'username' }, { type: 'select' }]);
  });

  it('returns an empty array for empty schema content', () => {
    expect(parseSchemaJson('')).toEqual([]);
  });

  it('returns null when JSON.parse and partial parsing both fail', () => {
    expect(parseSchemaJson('__PARSE_FAIL__')).toBeNull();
  });
});
