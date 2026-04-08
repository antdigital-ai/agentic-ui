/**
 * title: MarkdownEditor 工具栏国际化
 * description: 切换语言后，标题下拉（Large Title / Body Text 等）会随语言变化。
 */
import {
  I18nProvide,
  MarkdownEditor,
  useLanguage,
} from '@ant-design/agentic-ui';
import { Button, Card, Space, Typography } from 'antd';
import React from 'react';

const initialMarkdown = `# Heading 1
 
Some paragraph text here.
 
## Heading 2
 
More text...
`;

function DemoContent() {
  const { language, locale, toggleLanguage } = useLanguage();

  return (
    <Card>
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        <Space wrap>
          <Typography.Text>
            <strong>当前语言 / Current Language:</strong> {language}
          </Typography.Text>
          <Button onClick={toggleLanguage}>{locale.switchLanguage}</Button>
        </Space>

        <Typography.Paragraph style={{ marginBottom: 0 }}>
          将光标放到编辑器里的标题或段落中，然后展开标题下拉菜单，观察文案变化。
        </Typography.Paragraph>
        <MarkdownEditor
          width="100%"
          height={360}
          initValue={initialMarkdown}
          toolBar={{ enable: true }}
        />
      </Space>
    </Card>
  );
}

export default () => {
  return (
    <I18nProvide autoDetect={false} defaultLanguage="en-US">
      <DemoContent />
    </I18nProvide>
  );
};
