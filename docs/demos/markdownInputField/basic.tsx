import { Typography } from 'antd';
import React, { useCallback } from 'react';
import { TagMarkInputDemo } from './_TagMarkInputDemo';
import { TAG_MARK_DEMO_INITIAL, inputMinStyle, pageStyle } from './_constants';

const { Text, Title } = Typography;

export default () => {
  const asyncTagItems = useCallback(
    async (props: { placeholder?: string } | undefined) =>
      ['tag1', 'tag2', 'tag3'].map((item) => ({
        key: item,
        label: `${props?.placeholder ?? ''}${item}`,
      })),
    [],
  );

  return (
    <div style={pageStyle}>
      <Title level={5} style={{ marginTop: 0, marginBottom: 4 }}>
        Tag 与 Mark 演示
      </Title>
      <Text type="secondary" style={{ display: 'block', marginBottom: 12 }}>
        <Text strong>Tag</Text>：输入 <Text code>$</Text> 选择候选，或点击{' '}
        <Text code>{'${placeholder:…}'}</Text> 占位块下拉。
        <Text strong> Mark</Text>：输入 <Text code>@</Text> /{' '}
        <Text code>/</Text> 或点输入框左侧 @、/ 按钮，插入{' '}
        <Text code>&lt;mark&gt;</Text> 高亮（删空正文后装饰会自动清理；连续两次空格或两次 Enter 可移出 mark）。
      </Text>
      <TagMarkInputDemo
        style={inputMinStyle}
        initialValue={TAG_MARK_DEMO_INITIAL}
        tagInputItems={asyncTagItems}
      />
    </div>
  );
};
