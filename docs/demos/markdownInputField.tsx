import {
  MarkdownEditorInstance,
  MarkdownInputField,
} from '@ant-design/agentic-ui';
import { ChevronDown } from '@sofa-design/icons';
import { Divider, Dropdown, Slider, Typography, theme } from 'antd';
import React, { useCallback, useMemo, useState } from 'react';

const { Text, Title } = Typography;

const TEMPLATE_VALUE =
  '帮我查询`${placeholder:目标企业}` `${placeholder:近3年;initialValue:近6年}`的`${placeholder:资产总额}`。';

const TAG_ITEMS = ['tag1', 'tag2', 'tag3'].map((item) => ({
  key: item,
  label: item,
}));

const LONG_SCROLL_SAMPLE =
  '这是一段用于演示多行滚动与换行的占位文本。重复若干次以撑满输入区域高度，便于观察滚动条与内边距表现。\n\n'.repeat(
    12,
  );

const tagTextDisplay = (_props: unknown, text: string) => text.replaceAll('$', '');

const TagRender: React.FC<{
  onSelect: (value: string) => void;
  defaultDom: React.ReactNode;
  placeholder: string;
  readonly?: boolean;
  style?: React.CSSProperties;
}> = ({ onSelect, defaultDom, readonly, style, placeholder }) => {
  const items = useMemo(
    () => [
      { key: '1', label: '选项1' },
      { key: '2', label: '选项2' },
      { key: '3', label: '选项3' },
    ],
    [],
  );

  return (
    <Dropdown
      disabled={readonly}
      menu={{
        items,
        onClick: (e) => {
          const item = items.find((i) => i.key === e.key);
          if (item) {
            onSelect(item.label);
          }
        },
      }}
      trigger={['click']}
    >
      <div
        style={{ display: 'flex', alignItems: 'center', gap: 4, ...style }}
        title={placeholder || undefined}
      >
        {defaultDom}
        <ChevronDown style={{ color: '#999', fontSize: 12 }} />
      </div>
    </Dropdown>
  );
};

const pageStyle: React.CSSProperties = {
  boxSizing: 'border-box',
  display: 'flex',
  flexDirection: 'column',
  gap: 24,
  margin: '0 auto',
  maxWidth: 880,
  padding: '16px 12px 32px',
  width: '100%',
};

const inputMinStyle: React.CSSProperties = { minHeight: 66 };

export default () => {
  const { token } = theme.useToken();
  const tagTokenStyle = useMemo(
    () => ({
      background: token.colorPrimaryBg,
      color: token.colorPrimary,
      lineHeight: '22px',
      borderWidth: 0,
    }),
    [token.colorPrimary, token.colorPrimaryBg],
  );

  const markdownRefCustomTag = React.useRef<MarkdownEditorInstance>();

  const [sentList, setSentList] = useState<string[]>([]);
  const [borderRadius, setBorderRadius] = useState(0);

  const handleSend = useCallback(async (value: string) => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setSentList((prev) => [...prev, value]);
  }, []);

  const handleStop = useCallback(() => {
    // Demo：停止发送为占位逻辑，真实场景可中断请求
  }, []);

  const asyncTagItems = useCallback(
    async (props: { placeholder?: string } | undefined) =>
      ['tag1', 'tag2', 'tag3'].map((item) => ({
        key: item,
        label: `${props?.placeholder ?? ''}${item}`,
      })),
    [],
  );

  const attachmentConfig = useMemo(
    () => ({
      enable: true as const,
      upload: async (file: File) =>
        new Promise<string>((resolve) => {
          setTimeout(() => resolve(URL.createObjectURL(file)), 1000);
        }),
      onDelete: async (file: {
        url?: string;
        previewUrl?: string;
      }) => {
        const fileUrl = typeof file.url === 'string' ? file.url : undefined;
        const previewUrl =
          typeof file.previewUrl === 'string' ? file.previewUrl : undefined;
        if (fileUrl?.startsWith('blob:')) {
          URL.revokeObjectURL(fileUrl);
        }
        if (previewUrl?.startsWith('blob:') && previewUrl !== fileUrl) {
          URL.revokeObjectURL(previewUrl);
        }
      },
    }),
    [],
  );

  return (
    <div style={pageStyle}>
      <div>
        <Title level={4} style={{ marginTop: 0, marginBottom: 8 }}>
          MarkdownInputField 示例
        </Title>
        <Text type="secondary">
          下方各区块独立展示一种能力；圆角滑块会同步作用到带该属性的示例。
        </Text>
      </div>

      <div>
        <Text>全局圆角</Text>
        <Slider
          min={0}
          max={16}
          value={borderRadius}
          onChange={setBorderRadius}
        />
      </div>

      {sentList.length > 0 && (
        <div>
          <Text strong>最近发送（模拟 1s 延迟后落库）</Text>
          <ul style={{ margin: '8px 0 0', paddingInlineStart: 20 }}>
            {sentList.map((item, index) => (
              <li key={`${index}-${item.slice(0, 24)}`}>
                <Text ellipsis style={{ maxWidth: '100%' }}>
                  {item}
                </Text>
              </li>
            ))}
          </ul>
        </div>
      )}

      <Divider orientation="left" plain>
        基本
      </Divider>
      <Text type="secondary" style={{ display: 'block', marginTop: -12 }}>
        异步标签候选、`value` 与占位符模板
      </Text>
      <MarkdownInputField
        style={inputMinStyle}
        value={TEMPLATE_VALUE}
        borderRadius={borderRadius}
        tagInputProps={{
          enable: true,
          items: asyncTagItems,
        }}
        onSend={handleSend}
        onStop={handleStop}
        placeholder="请输入内容"
      />

      <Divider orientation="left" plain>
        dropdownRender
      </Divider>
      <Text type="secondary" style={{ display: 'block', marginTop: -12 }}>
        自定义下拉容器，保留默认菜单
      </Text>
      <MarkdownInputField
        style={inputMinStyle}
        value={TEMPLATE_VALUE}
        borderRadius={borderRadius}
        tagInputProps={{
          dropdownRender: (defaultDom, props) => (
            <div style={{ padding: token.paddingXS }}>
              <Text type="secondary" style={{ display: 'block', marginBottom: 8 }}>
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

      <Divider orientation="left" plain>
        自定义 Tag
      </Divider>
      <Text type="secondary" style={{ display: 'block', marginTop: -12 }}>
        `tagRender` 外裹下拉，`dropdownRender` 置空关闭浮层
      </Text>
      <MarkdownInputField
        inputRef={markdownRefCustomTag}
        value={TEMPLATE_VALUE}
        tagInputProps={{
          dropdownRender: () => null,
          tagTextStyle: tagTokenStyle,
          tagTextRender: tagTextDisplay,
          enable: true,
          items: TAG_ITEMS,
          tagRender: (props, defaultDom: React.ReactNode) => (
            <TagRender
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              defaultDom={defaultDom}
              placeholder={props.placeholder || ''}
              onSelect={(value: string) =>
                props.onSelect?.(value, { value: '123' })
              }
            />
          ),
        }}
        onSend={handleSend}
        onStop={handleStop}
        placeholder="请输入内容"
      />

      <Divider orientation="left" plain>
        文件上传
      </Divider>
      <MarkdownInputField
        borderRadius={borderRadius}
        attachment={attachmentConfig}
        value={TEMPLATE_VALUE}
        tagInputProps={{ enable: true, items: TAG_ITEMS }}
        onSend={handleSend}
        onStop={handleStop}
        placeholder="请输入内容"
      />

      <Divider orientation="left" plain>
        多行滚动
      </Divider>
      <MarkdownInputField
        borderRadius={borderRadius}
        tagInputProps={{ enable: true, items: TAG_ITEMS }}
        onSend={handleSend}
        value={LONG_SCROLL_SAMPLE}
        onStop={handleStop}
        placeholder="请输入内容"
      />

      <Divider orientation="left" plain>
        禁用
      </Divider>
      <MarkdownInputField
        borderRadius={borderRadius}
        onSend={handleSend}
        disabled
        value={TEMPLATE_VALUE}
        placeholder="请输入内容"
      />
    </div>
  );
};
