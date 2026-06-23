import { MarkdownEditor } from '@ant-design/agentic-ui';
import React from 'react';

const defaultValue = `
![](https://mdn.alipayobjects.com/huamei_gcee1x/afts/img/A*9F0qRYV8EjUAAAAAAAAAAAAADml6AQ/original?width=200&height=200)
![](https://mdn.alipayobjects.com/huamei_gcee1x/afts/img/A*9F0qRYV8EjUAAAAAAAAAAAAADml6AQ/original?width=200&height=200)
![](https://mdn.alipayobjects.com/huamei_gcee1x/afts/img/A*9F0qRYV8EjUAAAAAAAAAAAAADml6AQ/origina?width=400&height=400)
`;
export default () => {
  return (
    <>
      <MarkdownEditor
        width={'100vw'}
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
        initValue={defaultValue}
        onChange={(e, value) => {
          console.log(e, value);
        }}
      />
      <MarkdownEditor
        readonly
        width={'100vw'}
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
          render: (props) => {
            return (
              <img
                {...props}
                style={{
                  border: '2px solid red',
                }}
              />
            );
          },
        }}
        initValue={defaultValue}
      />

      <div style={{ marginTop: '20px', padding: '20px' }}>
        <h4>Props 说明：</h4>
        <ul>
          <li>
            <strong>width</strong>: 编辑器宽度
          </li>
          <li>
            <strong>reportMode</strong>: 报告模式，启用只读状态
          </li>
          <li>
            <strong>readonly</strong>: 只读模式
          </li>
          <li>
            <strong>image.upload</strong>: 图片上传函数，处理文件上传逻辑
          </li>
          <li>
            <strong>image.render</strong>:
            自定义图片渲染函数，可以自定义图片显示样式
          </li>
          <li>
            <strong>initValue</strong>: 编辑器的初始内容值
          </li>
          <li>
            <strong>onChange</strong>: 内容变化时的回调函数
          </li>
        </ul>
      </div>
    </>
  );
};
