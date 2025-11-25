import { MarkdownEditor, MarkdownEditorInstance } from '@ant-design/agentic-ui';
import { Button } from 'antd';
import React from 'react';
import { newEnergyFundContent } from './shared/newEnergyFundContent';

export default () => {
  const [value, setValue] = React.useState(() => newEnergyFundContent);

  const markdownEditorRef = React.useRef<MarkdownEditorInstance>();
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        backgroundColor: '#fff',
      }}
    >
      <MarkdownEditor
        editorRef={markdownEditorRef}
        toc={false}
        toolBar={{
          enable: true,
          hideTools: ['code', 'inline-code'],
          extra: [
            <Button key="save" type="primary" size="small">
              Save
            </Button>,
          ],
        }}
        comment={{
          enable: true,
        }}
        readonly
        reportMode
        image={{
          upload: async (fileList) => {
            return new Promise((resolve) => {
              const file = fileList[0];
              if (typeof file === 'string') {
                fetch(file)
                  .then((res) => res.blob())
                  .then((blob) => {
                    console.log(blob);
                    const url = URL.createObjectURL(blob);
                    resolve(url);
                  });
              } else {
                const url = URL.createObjectURL(file);
                resolve(url);
              }
            });
          },
        }}
        style={{
          width: '50vw',
          margin: '0 auto',
          height: '100vh',
          border: '1px solid #E7E9E8',
        }}
        initValue={value}
      />
      <MarkdownEditor
        toc={false}
        toolBar={{
          enable: true,
          hideTools: ['code', 'inline-code'],
          extra: [
            <Button
              key="save"
              type="primary"
              size="small"
              onClick={() => {
                setValue(value);
                markdownEditorRef?.current?.store?.setMDContent(value);
              }}
            >
              Save
            </Button>,
          ],
        }}
        comment={{
          enable: true,
        }}
        reportMode
        image={{
          upload: async (fileList) => {
            return new Promise((resolve) => {
              const file = fileList[0];
              if (typeof file === 'string') {
                fetch(file)
                  .then((res) => res.blob())
                  .then((blob) => {
                    const url = URL.createObjectURL(blob);
                    resolve(url);
                  });
              } else {
                const url = URL.createObjectURL(file);
                resolve(url);
              }
            });
          },
        }}
        style={{
          width: '50vw',
          margin: '0 auto',
          border: '1px solid #E7E9E8',
          height: '100vh',
        }}
        onChange={(value, _) => {
          console.log(value, _);
          setValue(value);
        }}
        initValue={newEnergyFundContent}
      />

      <div style={{ marginTop: '20px', padding: '20px' }}>
        <h4>Props 说明：</h4>
        <ul>
          <li>
            <strong>editorRef</strong>: 编辑器实例引用，用于调用编辑器方法
          </li>
          <li>
            <strong>toc</strong>: 是否显示目录，设置为 false 隐藏目录
          </li>
          <li>
            <strong>toolBar.enable</strong>: 是否启用工具栏
          </li>
          <li>
            <strong>toolBar.hideTools</strong>: 隐藏的工具按钮数组
          </li>
          <li>
            <strong>toolBar.extra</strong>: 额外的工具栏按钮
          </li>
          <li>
            <strong>comment.enable</strong>: 是否启用评论功能
          </li>
          <li>
            <strong>readonly</strong>: 只读模式，禁用编辑功能
          </li>
          <li>
            <strong>reportMode</strong>: 报告模式，启用只读状态
          </li>
          <li>
            <strong>image.upload</strong>: 图片上传函数，处理文件上传逻辑
          </li>
          <li>
            <strong>style</strong>: 编辑器容器的样式对象
          </li>
          <li>
            <strong>initValue</strong>: 编辑器的初始内容值
          </li>
          <li>
            <strong>onChange</strong>: 内容变化时的回调函数
          </li>
        </ul>
      </div>
    </div>
  );
};
