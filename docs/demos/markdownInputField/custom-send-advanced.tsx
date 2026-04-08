import { MarkdownInputField } from '@ant-design/agentic-ui';
import {
  CloudUploadOutlined,
  HeartOutlined,
  SendOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { Button, Divider, Space, Tooltip } from 'antd';
import React, { useState } from 'react';

const useSendHandler = () => {
  const [loading, setLoading] = useState(false);

  const handleSend = async (
    text: string,
    setValue: (v: string) => void,
  ) => {
    setLoading(true);
    console.log('发送消息:', text);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setLoading(false);
    setValue('');
  };

  return { loading, handleSend };
};

const CustomSendAdvancedDemo: React.FC = () => {
  const [value1, setValue1] = useState('这是完全自定义的发送按钮示例...');
  const [value2, setValue2] = useState('这是结合默认按钮的示例...');
  const [value3, setValue3] = useState('这是简洁版自定义按钮...');
  const { loading, handleSend } = useSendHandler();

  const fullyCustomRender = (props: any) => {
    const { isHover, isLoading, disabled } = props;
    return [
      <Tooltip key="settings" title="设置">
        <Button type="text" size="small" icon={<SettingOutlined />} onClick={() => console.log('打开设置')} />
      </Tooltip>,
      <Tooltip key="cloud-save" title="保存到云端">
        <Button type="text" size="small" icon={<CloudUploadOutlined />} onClick={() => console.log('保存到云端')} />
      </Tooltip>,
      <Tooltip key="custom-send" title={disabled ? '请输入内容' : '发送消息 (Enter)'}>
        <Button
          type="primary"
          size="small"
          icon={<SendOutlined />}
          loading={isLoading || loading}
          disabled={disabled || !value1.trim()}
          onClick={() => value1.trim() && handleSend(value1, setValue1)}
          style={{ borderRadius: '6px', background: isHover && !disabled ? '#1677ff' : undefined, transition: 'all 0.2s' }}
        >
          发送
        </Button>
      </Tooltip>,
    ];
  };

  const mergeDefaultsRender = (props: any, defaultActions: React.ReactNode[]) => [
    <Tooltip key="like" title="点赞">
      <Button
        type="text"
        size="small"
        icon={<HeartOutlined />}
        onClick={() => console.log('点赞')}
        style={{ color: props.isHover ? '#ff4d4f' : '#666', transition: 'color 0.2s' }}
      />
    </Tooltip>,
    ...defaultActions,
  ];

  const compactRender = (props: any) => {
    const { isLoading, disabled } = props;
    return [
      <Button
        key="simple-send"
        type="primary"
        size="small"
        loading={isLoading || loading}
        disabled={disabled || !value3.trim()}
        onClick={() => value3.trim() && handleSend(value3, setValue3)}
        style={{ borderRadius: '20px', padding: '0 16px', height: '32px' }}
      >
        {isLoading || loading ? '发送中...' : '发送'}
      </Button>,
    ];
  };

  const inputStyle = { minHeight: '100px' };

  const sections = [
    { title: '示例1：完全自定义操作按钮', desc: '替换所有默认按钮，添加自定义的设置、云保存和发送按钮。', value: value1, setValue: setValue1, render: fullyCustomRender },
    { title: '示例2：在默认按钮基础上添加自定义按钮', desc: '保留默认的发送按钮，同时添加自定义的点赞按钮。', value: value2, setValue: setValue2, render: mergeDefaultsRender },
    { title: '示例3：简洁的自定义发送按钮', desc: '使用简单的圆角按钮替换默认发送图标。', value: value3, setValue: setValue3, render: compactRender },
  ] as const;

  return (
    <div style={{ padding: '12px' }}>
      <h2>自定义发送按钮示例</h2>
      <p>通过 <code>actionsRender</code> 属性可以完全自定义输入框右侧的操作按钮区域。</p>

      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {sections.map(({ title, desc, value, setValue, render }, idx) => (
          <React.Fragment key={title}>
            {idx > 0 && <Divider />}
            <div>
              <h3>{title}</h3>
              <p>{desc}</p>
              <MarkdownInputField
                value={value}
                onChange={setValue}
                onSend={(text) => handleSend(text, setValue)}
                placeholder="输入消息内容..."
                disabled={loading}
                typing={loading}
                actionsRender={render}
                style={inputStyle}
              />
            </div>
          </React.Fragment>
        ))}
      </Space>
    </div>
  );
};

export default CustomSendAdvancedDemo;
