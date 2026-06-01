import {
  MarkdownInputField,
  type ActionsSlotState,
} from '@ant-design/agentic-ui';
import { SendOutlined, SettingOutlined } from '@ant-design/icons';
import { Button, Tooltip } from 'antd';
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
  const customActionsRender = (state: ActionsSlotState) => {
    const { isHover, isLoading, disabled } = state;

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
    </div>
  );
};

export default CustomSendButtonDemo;
