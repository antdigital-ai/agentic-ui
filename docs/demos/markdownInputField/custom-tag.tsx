import { MarkdownInputField } from '@ant-design/agentic-ui';
import { Typography, theme } from 'antd';
import React, { useMemo } from 'react';
import { TagRender } from './_TagRender';
import {
  TAG_ITEMS,
  TEMPLATE_VALUE,
  inputMinStyle,
  pageStyle,
  tagTextDisplay,
} from './_constants';
import { useDemoSend } from './useDemoSend';

const { Text, Title } = Typography;

export default () => {
  const { token } = theme.useToken();
  const { handleSend, handleStop } = useDemoSend();

  const tagTokenStyle = useMemo(
    () => ({
      background: token.colorPrimaryBg,
      color: token.colorPrimary,
      lineHeight: '22px',
      borderWidth: 0,
    }),
    [token.colorPrimary, token.colorPrimaryBg],
  );

  return (
    <div style={pageStyle}>
      <Title level={5} style={{ marginTop: 0, marginBottom: 4 }}>
        自定义 Tag
      </Title>
      <Text type="secondary" style={{ display: 'block', marginBottom: 12 }}>
        `tagRender` 外裹下拉；`dropdownRender` 返回 null
        关闭内置浮层；`onSelect` 传入所选文案即可。
      </Text>
      <MarkdownInputField
        style={inputMinStyle}
        value={TEMPLATE_VALUE}
        tagInputProps={{
          dropdownRender: () => null,
          tagTextStyle: tagTokenStyle,
          tagTextRender: tagTextDisplay,
          enable: true,
          items: TAG_ITEMS,
          tagRender: (props, defaultDom: React.ReactNode) => (
            <TagRender
              chevronColor={token.colorTextQuaternary}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              defaultDom={defaultDom}
              placeholder={props.placeholder || ''}
              onSelect={(value: string) => props.onSelect?.(value)}
            />
          ),
        }}
        onSend={handleSend}
        onStop={handleStop}
        placeholder="请输入内容"
      />
    </div>
  );
};
