import { MarkdownInputField } from '@ant-design/agentic-ui';
import { Typography, theme } from 'antd';
import React, { useCallback, useMemo } from 'react';
import {
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
        dropdownRender
      </Title>
      <Text type="secondary" style={{ display: 'block', marginBottom: 12 }}>
        在下拉外围加说明区，仍渲染默认菜单。
      </Text>
      <MarkdownInputField
        style={inputMinStyle}
        value={TEMPLATE_VALUE}
        tagInputProps={{
          dropdownRender: (defaultDom, props) => (
            <div style={{ padding: token.paddingXS }}>
              <Text
                type="secondary"
                style={{ display: 'block', marginBottom: 8 }}
              >
                placeholder: {props.placeholder} · text: {props.text}
              </Text>
              {defaultDom}
            </div>
          ),
          tagTextStyle: tagTokenStyle,
          tagTextRender: tagTextDisplay,
          enable: true,
          items: asyncTagItems,
        }}
        onSend={handleSend}
        onStop={handleStop}
        placeholder="请输入内容"
      />
    </div>
  );
};
