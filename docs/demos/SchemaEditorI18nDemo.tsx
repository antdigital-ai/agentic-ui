import {
  I18nProvide,
  LowCodeSchema,
  SchemaEditor,
} from '@ant-design/agentic-ui';
import { Button, Space } from 'antd';
import React, { useState } from 'react';

const mockSchema: LowCodeSchema = {
  version: '1.0.0',
  name: 'Demo Schema',
  description: '这是一个演示国际化功能的 Schema',
  component: {
    type: 'html',
    schema:
      '<div class="demo-card">\n  <h2>{{title}}</h2>\n  <p>{{description}}</p>\n  <button onclick="alert(\'Hello!\')">点击我</button>\n</div>',
  },
  initialValues: {
    title: '欢迎使用 SchemaEditor',
    description: '这是一个支持国际化的 Schema 编辑器',
  },
};

/**
 * SchemaEditor 国际化演示组件
 *
 * 展示 SchemaEditor 组件的中英文切换功能
 */
export const SchemaEditorI18nDemo: React.FC = () => {
  const [language, setLanguage] = useState<'zh-CN' | 'en-US'>('zh-CN');

  const handleLanguageChange = () => {
    setLanguage((prev) => (prev === 'zh-CN' ? 'en-US' : 'zh-CN'));
  };

  return (
    <I18nProvide defaultLanguage={language} autoDetect={false}>
      <div style={{ padding: '12px' }}>
        <div style={{ marginBottom: '20px' }}>
          <Space>
            <Button type="primary" onClick={handleLanguageChange}>
              {language === 'zh-CN' ? 'Switch to English' : '切换到中文'}
            </Button>
            <span>
              当前语言 / Current Language:{' '}
              {language === 'zh-CN' ? '中文' : 'English'}
            </span>
          </Space>
        </div>

        <div style={{ border: '1px solid #d9d9d9', borderRadius: '6px' }}>
          <SchemaEditor
            initialSchema={mockSchema}
            initialValues={mockSchema.initialValues}
            height={600}
            showPreview={true}
          />
        </div>

        <div
          style={{
            marginTop: '20px',
            padding: '16px',
            backgroundColor: '#f5f5f5',
            borderRadius: '6px',
          }}
        >
          <h3>功能说明 / Features:</h3>
          <ul>
            <li>
              ✅ 支持中英文界面切换 / Support Chinese and English interface
              switching
            </li>
            <li>
              ✅ 所有按钮、标题、提示信息都已国际化 / All buttons, titles, and
              messages are internationalized
            </li>
            <li>
              ✅ 错误信息支持多语言显示 / Error messages support multi-language
              display
            </li>
            <li>
              ✅ 空状态提示信息已国际化 / Empty state messages are
              internationalized
            </li>
            <li>
              ✅ 复制功能的消息提示已国际化 / Copy function messages are
              internationalized
            </li>
          </ul>
        </div>
      </div>
    </I18nProvide>
  );
};

export default SchemaEditorI18nDemo;
