import {
  MARKDOWN_EDITOR_EVENTS,
  MarkdownEditor,
  MarkdownEditorInstance,
} from '@ant-design/agentic-ui';
import { ChartElement } from '@ant-design/agentic-ui/Plugins/chart';
import { CodeElement } from '@ant-design/agentic-ui/Plugins/code';
import { MermaidElement } from '@ant-design/agentic-ui/Plugins/mermaid';
import { Tooltip } from 'antd';
import React, { useEffect, useState } from 'react';
import {
  energyFundDemoCommentList,
  energyFundDemoMentionUsers,
} from './shared/energyFundDemoComments';
import { newEnergyFundContent } from './shared/newEnergyFundContent';

export default () => {
  const editorRef = React.useRef<MarkdownEditorInstance>();
  const [list, setList] = useState(energyFundDemoCommentList);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    // @ts-ignore
    window.editorRef = editorRef;
    editorRef.current?.markdownContainerRef?.current?.addEventListener(
      MARKDOWN_EDITOR_EVENTS.SELECTIONCHANGE,
      (e) => {
        console.log('selectionchange', e);
      },
    );
  }, []);
  return (
    <>
      <MarkdownEditor
        editorRef={editorRef}
        width={'100vw'}
        height={'100vh'}
        reportMode
        tagInputProps={{
          enable: true,
          items: [
            {
              label: '腾讯',
              key: 'tencent',
            },
            {
              label: '阿里巴巴',
              key: 'alibaba',
            },
          ],
        }}
        plugins={[
          {
            elements: {
              code: CodeElement,
              chart: ChartElement,
              mermaid: MermaidElement,
            },
          },
        ]}
        fncProps={{
          render: (props, _) => {
            return <Tooltip title={props.children}>{_}</Tooltip>;
          },
        }}
        onChange={(e, value) => {
          console.log(value);
        }}
        comment={{
          enable: true,
          commentList: list,
          loadMentions: async () => energyFundDemoMentionUsers(),
          onDelete: async (id) => {
            setList(list.filter((i) => i.id !== id));
          },
          onSubmit: async (id, data) => {
            console.log(id, data);
            setList([
              ...list,
              {
                ...data,
                user: {
                  name: '审阅人A',
                  avatar:
                    'https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png',
                },
                id: list.length + 1,
                time: 1703123456789,
              } as any,
            ]);
          },
        }}
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
        toolBar={{
          hideTools: ['H1'],
          min: true,
        }}
        insertAutocompleteProps={{
          optionsRender: (options) => {
            return options.filter((item) => {
              return item.key !== 'head1';
            });
          },
        }}
        initValue={
          process.env.NODE_ENV === 'test'
            ? newEnergyFundContent
            : newEnergyFundContent
        }
      />

      <div style={{ marginTop: '20px', padding: '20px' }}>
        <h4>Props 说明：</h4>
        <ul>
          <li>
            <strong>editorRef</strong>: 编辑器实例引用，用于调用编辑器方法
          </li>
          <li>
            <strong>width</strong>: 编辑器宽度
          </li>
          <li>
            <strong>height</strong>: 编辑器高度
          </li>
          <li>
            <strong>reportMode</strong>: 报告模式，启用只读状态
          </li>
          <li>
            <strong>tagInputProps</strong>: 标签输入配置，包含 enable 和 items
          </li>
          <li>
            <strong>plugins</strong>: 插件数组，用于扩展编辑器功能
          </li>
          <li>
            <strong>fncProps</strong>: 函数属性配置，包含 render 函数
          </li>
          <li>
            <strong>onChange</strong>: 内容变化时的回调函数
          </li>
          <li>
            <strong>comment</strong>: 评论功能配置
          </li>
          <li>
            <strong>comment.enable</strong>: 是否启用评论功能
          </li>
          <li>
            <strong>comment.commentList</strong>: 评论列表数据
          </li>
          <li>
            <strong>comment.loadMentions</strong>: 加载提及用户列表的函数
          </li>
          <li>
            <strong>comment.onDelete</strong>: 删除评论的回调函数
          </li>
          <li>
            <strong>comment.onSubmit</strong>: 提交评论的回调函数
          </li>
          <li>
            <strong>image.upload</strong>: 图片上传函数
          </li>
          <li>
            <strong>toolBar</strong>: 工具栏配置
          </li>
          <li>
            <strong>toolBar.hideTools</strong>: 隐藏的工具按钮数组
          </li>
          <li>
            <strong>toolBar.min</strong>: 是否最小化工具栏
          </li>
          <li>
            <strong>insertAutocompleteProps</strong>: 自动完成插入配置
          </li>
          <li>
            <strong>initValue</strong>: 编辑器的初始内容值
          </li>
        </ul>
      </div>
    </>
  );
};
