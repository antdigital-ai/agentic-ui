import { describe, expect, it } from 'vitest';
import { extractFilemapBlocks } from '../src/Bubble/extractFilemapBlocks';

describe('extractFilemapBlocks', () => {
  it('returns empty blocks and original content when no filemap blocks present', () => {
    const content = 'Hello world\n\nSome text here.';
    const { blocks, stripped } = extractFilemapBlocks(content);
    expect(blocks).toHaveLength(0);
    expect(stripped).toBe(content.trim());
  });

  it('extracts a single filemap block and strips it from content', () => {
    const json = '{"fileList":[{"name":"img.png","type":"image/png"}]}';
    const content = `Some text\n\n\`\`\`agentic-ui-filemap\n${json}\n\`\`\``;
    const { blocks, stripped } = extractFilemapBlocks(content);
    expect(blocks).toHaveLength(1);
    expect(blocks[0].body).toBe(json);
    expect(stripped).toBe('Some text');
  });

  it('content with only a filemap block produces empty stripped string', () => {
    const json = '{"fileList":[]}';
    const content = `\`\`\`agentic-ui-filemap\n${json}\n\`\`\``;
    const { blocks, stripped } = extractFilemapBlocks(content);
    expect(blocks).toHaveLength(1);
    expect(stripped).toBe('');
  });

  it('extracts multiple filemap blocks', () => {
    const j1 = '{"fileList":[{"name":"a.png","type":"image/png"}]}';
    const j2 = '{"fileList":[{"name":"b.pdf","type":"application/pdf"}]}';
    const content = `Line 1\n\n\`\`\`agentic-ui-filemap\n${j1}\n\`\`\`\n\nLine 2\n\n\`\`\`agentic-ui-filemap\n${j2}\n\`\`\``;
    const { blocks, stripped } = extractFilemapBlocks(content);
    expect(blocks).toHaveLength(2);
    expect(blocks[0].body).toBe(j1);
    expect(blocks[1].body).toBe(j2);
    expect(stripped).toContain('Line 1');
    expect(stripped).toContain('Line 2');
  });

  it('does not extract other code fence types', () => {
    const content = '```json\n{"foo":1}\n```\n\n```typescript\nconst x = 1;\n```';
    const { blocks, stripped } = extractFilemapBlocks(content);
    expect(blocks).toHaveLength(0);
    expect(stripped).toBe(content.trim());
  });
});
