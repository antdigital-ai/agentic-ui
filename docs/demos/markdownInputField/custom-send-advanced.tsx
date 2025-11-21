import { MarkdownInputField } from '@ant-design/agentic-ui';
import {
  CloudUploadOutlined,
  HeartOutlined,
  SendOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { Button, Divider, Space, Tooltip } from 'antd';
import React, { useState } from 'react';

/**
 * 自定义发送按钮示例集合
 *
 * 展示多种自定义发送按钮的实现方式
 */
const CustomSendButtonDemo: React.FC = () => {
  const [value1, setValue1] = useState('这是完全自定义的发送按钮示例...');
  const [value2, setValue2] = useState('这是结合默认按钮的示例...');
  const [value3, setValue3] = useState('这是简洁版自定义按钮...');
  const [loading, setLoading] = useState(false);

  // 模拟发送消息
  const handleSend = async (
    text: string,
    setValue: (value: string) => void,
  ) => {
    setLoading(true);
    console.log('发送消息:', text);

    // 模拟网络延迟
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setLoading(false);
    setValue(''); // 发送成功后清空输入框
  };

  // 示例1：完全自定义操作按钮
  const customActionsRender1 = (props: any) => {
    const { isHover, isLoading, disabled } = props;

    return [
      <Tooltip key="settings" title="设置">
        <Button
          type="text"
          size="small"
          icon={<SettingOutlined />}
          onClick={() => console.log('打开设置')}
        />
      </Tooltip>,

      <Tooltip key="cloud-save" title="保存到云端">
        <Button
          type="text"
          size="small"
          icon={<CloudUploadOutlined />}
          onClick={() => console.log('保存到云端')}
        />
      </Tooltip>,

      <Tooltip
        key="custom-send"
        title={disabled ? '请输入内容' : '发送消息 (Enter)'}
      >
        <Button
          type="primary"
          size="small"
          icon={<SendOutlined />}
          loading={isLoading || loading}
          disabled={disabled || !value1.trim()}
          onClick={() => {
            if (value1.trim()) {
              handleSend(value1, setValue1);
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

  // 示例2：结合默认按钮
  const customActionsRender2 = (
    props: any,
    defaultActions: React.ReactNode[],
  ) => {
    const { isHover } = props;

    return [
      // 添加自定义按钮
      <Tooltip key="like" title="点赞">
        <Button
          type="text"
          size="small"
          icon={<HeartOutlined />}
          onClick={() => console.log('点赞')}
          style={{
            color: isHover ? '#ff4d4f' : '#666',
            transition: 'color 0.2s',
          }}
        />
      </Tooltip>,

      // 包含默认的发送按钮和附件按钮
      ...defaultActions,
    ];
  };

  // 示例3：简洁的自定义发送按钮
  const customActionsRender3 = (props: any) => {
    const { isLoading, disabled } = props;

    return [
      <Button
        key="simple-send"
        type="primary"
        size="small"
        loading={isLoading || loading}
        disabled={disabled || !value3.trim()}
        onClick={() => {
          if (value3.trim()) {
            handleSend(value3, setValue3);
          }
        }}
        style={{
          borderRadius: '20px',
          padding: '0 16px',
          height: '32px',
        }}
      >
        {isLoading || loading ? '发送中...' : '发送'}
      </Button>,
    ];
  };

  return (
    <div style={{ padding: '12px' }}>
      <h2>自定义发送按钮示例</h2>
      <p>
        通过 <code>actionsRender</code>{' '}
        属性可以完全自定义输入框右侧的操作按钮区域。
      </p>

      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* 示例1：完全自定义 */}
        <div>
          <h3>示例1：完全自定义操作按钮</h3>
          <p>替换所有默认按钮，添加自定义的设置、云保存和发送按钮。</p>
          <MarkdownInputField
            value={value1}
            onChange={setValue1}
            onSend={(text) => handleSend(text, setValue1)}
            placeholder="输入消息内容..."
            disabled={loading}
            typing={loading}
            actionsRender={customActionsRender1}
            style={{ minHeight: '100px' }}
          />
        </div>

        <Divider />

        {/* 示例2：结合默认按钮 */}
        <div>
          <h3>示例2：在默认按钮基础上添加自定义按钮</h3>
          <p>保留默认的发送按钮，同时添加自定义的点赞按钮。</p>
          <MarkdownInputField
            value={value2}
            onChange={setValue2}
            onSend={(text) => handleSend(text, setValue2)}
            placeholder="输入消息内容..."
            disabled={loading}
            typing={loading}
            actionsRender={customActionsRender2}
            style={{ minHeight: '100px' }}
          />
        </div>

        <Divider />

        {/* 示例3：简洁版 */}
        <div>
          <h3>示例3：简洁的自定义发送按钮</h3>
          <p>使用简单的圆角按钮替换默认发送图标。</p>
          <MarkdownInputField
            value={value3}
            onChange={setValue3}
            onSend={(text) => handleSend(text, setValue3)}
            placeholder="输入消息内容..."
            disabled={loading}
            typing={loading}
            actionsRender={customActionsRender3}
            style={{ minHeight: '100px' }}
          />
        </div>

        <div
          style={{
            padding: '16px',
            background: '#f0f9ff',
            borderRadius: '8px',
            border: '1px solid #91d5ff',
          }}
        >
          <h4 style={{ margin: '0 0 12px 0', color: '#1890ff' }}>
            💡 实现要点
          </h4>
          <div style={{ fontSize: '13px', lineHeight: '1.6' }}>
            <p>
              <strong>actionsRender 函数参数：</strong>
            </p>
            <ul style={{ marginBottom: '12px' }}>
              <li>
                <code>props</code> - 包含组件状态的对象（isHover, isLoading,
                disabled 等）
              </li>
              <li>
                <code>defaultActions</code> -
                默认的操作按钮数组（发送按钮、附件按钮等）
              </li>
            </ul>

            <p>
              <strong>常用自定义场景：</strong>
            </p>
            <ul style={{ margin: 0 }}>
              <li>🎨 更改发送按钮的样式和文字</li>
              <li>➕ 添加额外的功能按钮（设置、保存等）</li>
              <li>🔄 根据状态动态显示不同的按钮</li>
              <li>📱 适配不同的 UI 设计需求</li>
            </ul>
          </div>
        </div>
      </Space>
    </div>
  );
};

export default CustomSendButtonDemo;
