import { LowCodeSchema, SchemaEditor } from '@ant-design/agentic-ui';
import React, { useState } from 'react';

/**
 * SchemaEditor 演示页面
 *
 * 展示 SchemaEditor 的各种功能和用法
 */
export default function SchemaEditorDemo() {
  const [schema, setSchema] = useState<LowCodeSchema>({
    version: '1.0.0',
    name: '示例Schema',
    description: '这是一个示例schema，展示了SchemaEditor的功能',
    component: {
      type: 'html',
      schema: `<div class="container">
  <h1>{{title}}</h1>
  <p>{{description}}</p>
  <div class="card">
    <h2>{{cardTitle}}</h2>
    <p>{{cardContent}}</p>
    <button class="btn" onclick="alert('{{buttonText}}')">
      {{buttonText}}
    </button>
  </div>
</div>`,
    },
    initialValues: {
      title: '欢迎使用SchemaEditor',
      description: '这是一个强大的schema编辑和预览工具',
      cardTitle: '功能特性',
      cardContent: '支持实时编辑、语法高亮、错误提示等功能',
      buttonText: '点击我',
    },
  });

  const [values, setValues] = useState<Record<string, any>>({
    title: '欢迎使用SchemaEditor',
    description: '这是一个强大的schema编辑和预览工具',
    cardTitle: '功能特性',
    cardContent: '支持实时编辑、语法高亮、错误提示等功能',
    buttonText: '点击我',
  });

  const handleChange = (
    newSchema: LowCodeSchema,
    newValues: Record<string, any>,
  ) => {
    setSchema(newSchema);
    setValues(newValues);
    console.log('Schema变更:', newSchema);
    console.log('Values变更:', newValues);
  };

  const handleError = (error: Error) => {
    console.error('SchemaEditor错误:', error);
  };

  // 预设的示例schema
  const examples = [
    {
      name: '基础HTML',
      schema: {
        version: '1.0.0',
        name: '基础HTML示例',
        component: {
          type: 'html',
          schema: `<div style="padding: 12px; background: #f5f5f5; border-radius: 8px;">
  <h1 style="color: #333;">{{title}}</h1>
  <p style="color: #666;">{{content}}</p>
</div>`,
        },
        initialValues: {
          title: 'Hello World',
          content: '这是一个基础的HTML模板示例',
        },
      },
    },
    {
      name: '表单组件',
      schema: {
        version: '1.0.0',
        name: '表单组件示例',
        component: {
          type: 'html',
          schema: `<form style="max-width: 400px; margin: 20px auto; padding: 12px; border: 1px solid #ddd; border-radius: 8px;">
  <h2>{{formTitle}}</h2>
  <div style="margin-bottom: 15px;">
    <label style="display: block; margin-bottom: 5px;">{{nameLabel}}</label>
    <input type="text" placeholder="{{namePlaceholder}}" style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px;">
  </div>
  <div style="margin-bottom: 15px;">
    <label style="display: block; margin-bottom: 5px;">{{emailLabel}}</label>
    <input type="email" placeholder="{{emailPlaceholder}}" style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px;">
  </div>
  <button type="submit" style="width: 100%; padding: 10px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;">
    {{submitText}}
  </button>
</form>`,
        },
        initialValues: {
          formTitle: '用户注册',
          nameLabel: '姓名',
          namePlaceholder: '请输入您的姓名',
          emailLabel: '邮箱',
          emailPlaceholder: '请输入您的邮箱',
          submitText: '提交',
        },
      },
    },
    {
      name: '数据表格',
      schema: {
        version: '1.0.0',
        name: '数据表格示例',
        component: {
          type: 'html',
          schema: `<div style="padding: 12px;">
  <h2>{{tableTitle}}</h2>
  <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
    <thead>
      <tr style="background: #f8f9fa;">
        <th style="padding: 12px; border: 1px solid #dee2e6; text-align: left;">{{col1Header}}</th>
        <th style="padding: 12px; border: 1px solid #dee2e6; text-align: left;">{{col2Header}}</th>
        <th style="padding: 12px; border: 1px solid #dee2e6; text-align: left;">{{col3Header}}</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td style="padding: 12px; border: 1px solid #dee2e6;">{{row1Col1}}</td>
        <td style="padding: 12px; border: 1px solid #dee2e6;">{{row1Col2}}</td>
        <td style="padding: 12px; border: 1px solid #dee2e6;">{{row1Col3}}</td>
      </tr>
      <tr style="background: #f8f9fa;">
        <td style="padding: 12px; border: 1px solid #dee2e6;">{{row2Col1}}</td>
        <td style="padding: 12px; border: 1px solid #dee2e6;">{{row2Col2}}</td>
        <td style="padding: 12px; border: 1px solid #dee2e6;">{{row2Col3}}</td>
      </tr>
    </tbody>
  </table>
</div>`,
        },
        initialValues: {
          tableTitle: '用户数据',
          col1Header: '姓名',
          col2Header: '年龄',
          col3Header: '城市',
          row1Col1: '张三',
          row1Col2: '25',
          row1Col3: '北京',
          row2Col1: '李四',
          row2Col2: '30',
          row2Col3: '上海',
        },
      },
    },
  ];

  const loadExample = (example: any) => {
    setSchema(example.schema);
    setValues(example.schema.initialValues || {});
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1400px', margin: '0 auto' }}>
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{ color: '#333', marginBottom: '10px' }}>
          SchemaEditor 演示
        </h1>
        <p style={{ color: '#666', marginBottom: '20px' }}>
          这是一个强大的schema编辑和预览工具，支持实时编辑、语法高亮、错误提示等功能。
        </p>

        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ marginBottom: '10px' }}>快速示例：</h3>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {examples.map((example, index) => (
              <button
                key={index}
                type="button"
                onClick={() => loadExample(example)}
                style={{
                  padding: '8px 16px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  background: '#fff',
                  cursor: 'pointer',
                  fontSize: '13px',
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = '#f8f9fa';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = '#fff';
                }}
              >
                {example.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      <SchemaEditor
        initialSchema={schema}
        initialValues={values}
        height={700}
        onChange={handleChange}
        onError={handleError}
        showPreview={true}
        previewConfig={{
          ALLOWED_TAGS: [
            'div',
            'h1',
            'h2',
            'h3',
            'p',
            'span',
            'button',
            'form',
            'input',
            'label',
            'table',
            'thead',
            'tbody',
            'tr',
            'th',
            'td',
          ],
          ALLOWED_ATTR: ['class', 'style', 'type', 'placeholder', 'onclick'],
        }}
      />

      <div
        style={{
          marginTop: '20px',
          padding: '15px',
          background: '#f8f9fa',
          borderRadius: '4px',
        }}
      >
        <h3 style={{ marginBottom: '10px' }}>功能说明：</h3>
        <ul style={{ margin: 0, paddingLeft: '20px', color: '#666' }}>
          <li>左侧HTML模板编辑器：使用AceEditor提供语法高亮和智能提示</li>
          <li>左侧Schema JSON编辑器：可以编辑完整的schema结构</li>
          <li>右侧实时预览：实时显示编辑结果，支持模板变量替换</li>
          <li>错误提示：自动检测schema格式错误并显示提示</li>
          <li>响应式设计：支持不同屏幕尺寸的适配</li>
        </ul>
      </div>
    </div>
  );
}
