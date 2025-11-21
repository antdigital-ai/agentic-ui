/**
 * ThinkBlock 国际化使用示例
 */

import { I18nProvide } from '@ant-design/agentic-ui';
import React, { useState } from 'react';

// 这里用注释来展示如何使用 ThinkBlock
// import { ThinkBlock } from '@ant-design/agentic-ui';

const ThinkBlockI18nDemo = () => {
  const [language, setLanguage] = useState<'zh-CN' | 'en-US'>('zh-CN');

  return (
    <I18nProvide defaultLanguage={language} autoDetect={false}>
      <div style={{ padding: '12px' }}>
        <div style={{ marginBottom: '20px' }}>
          <button
            type="button"
            onClick={() =>
              setLanguage(language === 'zh-CN' ? 'en-US' : 'zh-CN')
            }
            style={{
              padding: '8px 16px',
              marginRight: '10px',
              backgroundColor: '#1890ff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            切换语言 / Switch Language
          </button>
          <span>
            当前语言 / Current Language:{' '}
            {language === 'zh-CN' ? '中文' : 'English'}
          </span>
        </div>

        <div
          style={{
            padding: '16px',
            backgroundColor: '#f5f5f5',
            borderRadius: '8px',
          }}
        >
          <h4>ThinkBlock 国际化支持</h4>
          <p>ThinkBlock 组件现已支持国际化：</p>
          <ul>
            <li>中文环境：「深度思考」、「深度思考...」</li>
            <li>英文环境：「Deep Thinking」、「Deep Thinking...」</li>
          </ul>

          <h5>使用方法：</h5>
          <pre
            style={{
              backgroundColor: '#fff',
              padding: '12px',
              borderRadius: '4px',
              overflow: 'auto',
            }}
          >
            {`import { ThinkBlock, I18nProvide } from '@ant-design/agentic-ui';

// 在 I18nProvide 包裹下使用
<I18nProvide defaultLanguage="zh-CN">
  <ThinkBlock element={codeElement} />
</I18nProvide>

// ThinkBlock 会自动根据当前语言环境显示对应文本
// - 中文：深度思考 / 深度思考...
// - 英文：Deep Thinking / Deep Thinking...`}
          </pre>
        </div>
      </div>
    </I18nProvide>
  );
};

export default ThinkBlockI18nDemo;
