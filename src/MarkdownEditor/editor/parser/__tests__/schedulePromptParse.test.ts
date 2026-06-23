import { createEditor, Editor, type Descendant } from 'slate';
import { describe, expect, it } from 'vitest';
import { withOrphanInlineLeafNormalize } from '../../plugins/withOrphanInlineLeafNormalize';
import { parserMarkdownToSlateNode } from '../parserMarkdownToSlateNode';
import { parserMdToSchema } from '../parserMdToSchema';
import { parserSlateNodeToMarkdown } from '../parserSlateNodeToMarkdown';

const schedulePromptMd = [
  '帮我创建一个定时任务。请根据我的描述: `${placeholder:任务名称}` 、 `${placeholder:执行频率}` ，内容如下：',
  '```markdown',
  '任务内容',
  '```',
  '帮我生成合适的定时任务配置。',
].join('\n');

describe('schedule prompt with placeholders and code fence', () => {
  it('parses to paragraph, code block, paragraph without throwing', () => {
    const { schema } = parserMarkdownToSlateNode(schedulePromptMd);
    expect(schema.length).toBeGreaterThanOrEqual(2);
    const types = schema.map((n) => (n as { type?: string }).type);
    expect(types).toContain('paragraph');
    expect(types).toContain('code');
  });

  it('parserMdToSchema round-trips without throwing', () => {
    const { schema } = parserMdToSchema(schedulePromptMd);
    expect(() => parserSlateNodeToMarkdown(schema)).not.toThrow();
    const back = parserSlateNodeToMarkdown(schema);
    expect(back).toContain('```markdown');
    expect(back).toContain('任务内容');
    expect(back).toContain('placeholder:任务名称');
  });

  it('onChange loop keeps fenced markdown code block (void code serialization)', () => {
    let md = schedulePromptMd;
    for (let i = 0; i < 3; i++) {
      const { schema } = parserMdToSchema(md);
      expect(schema.some((n) => (n as { type?: string }).type === 'code')).toBe(
        true,
      );
      md = parserSlateNodeToMarkdown(schema);
    }
    expect(md).toContain('```markdown');
    expect(md).toContain('任务内容');
  });

  it('placeholder tags survive orphan inline leaf normalize after parse', () => {
    const { schema } = parserMdToSchema(
      '描述 `${placeholder:任务名称}` 结束',
    );
    const editor = withOrphanInlineLeafNormalize(createEditor());
    editor.children = schema as Descendant[];
    Editor.normalize(editor, { force: true });

    const paragraph = editor.children[0] as {
      children: Array<{ tag?: boolean; placeholder?: string; text: string }>;
    };
    const tagLeaf = paragraph.children.find((c) => c.tag && c.placeholder);
    expect(tagLeaf).toMatchObject({
      tag: true,
      placeholder: '任务名称',
    });
  });
});
