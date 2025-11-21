import { MarkdownInputField } from '@ant-design/agentic-ui';
import { SendOutlined, SettingOutlined } from '@ant-design/icons';
import { Button, Space, Tooltip } from 'antd';
import React, { useState } from 'react';

/**
 * 自定义发送按钮基础示例
 */
const CustomSendButtonDemo: React.FC = () => {
  const [value, setValue] = useState(
    '试试输入一些内容，然后点击自定义的发送按钮...',
  );
  const [loading, setLoading] = useState(false);

  // 模拟发送消息
  const handleSend = async (text: string) => {
    setLoading(true);
    console.log('发送消息:', text);

    // 模拟网络延迟
    await new Promise((resolve) => setTimeout(resolve, 2000));

    setLoading(false);
    setValue(''); // 发送成功后清空输入框
  };

  // 自定义操作按钮渲染函数
  const customActionsRender = (props: any) => {
    const { isHover, isLoading, disabled } = props;

    return [
      // 添加设置按钮
      <Tooltip key="settings" title="设置">
        <Button
          type="text"
          size="small"
          icon={<SettingOutlined />}
          onClick={() => console.log('打开设置')}
        />
      </Tooltip>,

      // 自定义发送按钮
      <Tooltip
        key="custom-send"
        title={disabled ? '请输入内容' : '发送消息 (Enter)'}
      >
        <Button
          type="primary"
          size="small"
          icon={<SendOutlined />}
          loading={isLoading || loading}
          disabled={disabled || !value?.trim()}
          onClick={() => {
            if (value?.trim()) {
              handleSend(value);
            }
          }}
          style={{
            borderRadius: '6px',
            background: isHover && !disabled ? '#1677ff' : undefined,
            transition: 'all 0.2s',
          }}
        >
          发送
        </Button>
      </Tooltip>,
    ];
  };

  return (
    <div style={{ padding: '12px' }}>
      <h3>自定义发送按钮示例</h3>
      <p>
        这个示例展示了如何使用 <code>actionsRender</code> 属性来自定义发送按钮。
      </p>

      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <MarkdownInputField
          value={value}
          onChange={setValue}
          onSend={handleSend}
          placeholder="请输入消息内容..."
          disabled={loading}
          typing={loading}
          actionsRender={customActionsRender}
          style={{
            minHeight: '120px',
            maxHeight: '300px',
          }}
        />

        <div
          style={{
            padding: '16px',
            background: '#f5f5f5',
            borderRadius: '8px',
            fontSize: '13px',
          }}
        >
          <h4 style={{ margin: '0 0 8px 0' }}>功能说明：</h4>
          <ul style={{ margin: 0, paddingLeft: '20px' }}>
            <li>
              🎯 <strong>自定义发送按钮</strong>
              ：替换默认的发送图标为带文字的按钮
            </li>
            <li>
              ⚙️ <strong>添加设置按钮</strong>：在发送区域添加额外的操作按钮
            </li>
            <li>
              🎨 <strong>状态响应</strong>：按钮会根据 hover、loading、disabled
              状态变化
            </li>
            <li>
              💡 <strong>提示信息</strong>：每个按钮都有相应的 Tooltip 提示
            </li>
          </ul>
        </div>
      </Space>
    </div>
  );
};

export default CustomSendButtonDemo;
