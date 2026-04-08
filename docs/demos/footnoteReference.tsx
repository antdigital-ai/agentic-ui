import { MarkdownEditor } from '@ant-design/agentic-ui';
import { Tooltip } from 'antd';
import React, { useState } from 'react';
import {
  energyFundDemoCommentList,
  energyFundDemoMentionUsers,
} from './shared/energyFundDemoComments';

const defaultValue = `《将近酒》这首诗的参考文献如下：

- 李白. 将进酒 [^DOC_0]
- 李白. 将进酒 [^DOC_1]

   [^DOC_0]: 
君不见，黄河之水天上来，奔流到海不复回。
君不见，高堂明镜悲白发，朝如青丝暮成雪。
人生得意须尽欢，莫使金樽空对月。
天生我材必有用，千金散尽还复来。
烹羊宰牛且为乐，会须一饮三百杯。
岑夫子，丹丘生，将进酒，杯莫停。

   [^DOC_1]: 
与君歌一曲，请君为我倾耳听。
钟鼓馔玉不足贵，但愿长醉不复醒。
古来圣贤皆寂寞，惟有饮者留其名。
陈王昔时宴平乐，斗酒十千恣欢谑。
主人何为言少钱，径须沽取对君酌。
五花马，千金裘，呼儿将出换美酒，与尔同销万古愁。
`;

export default () => {
  const [list, setList] = useState(energyFundDemoCommentList);
  return (
    <>
      <MarkdownEditor
        width={'100vw'}
        height={'100vh'}
        reportMode
        fncProps={{
          render: (props, _) => {
            return <Tooltip title={props.children}>{_}</Tooltip>;
          },
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
        }}
        insertAutocompleteProps={{
          optionsRender: (options) => {
            return options.filter((item) => {
              return item.key !== 'head1';
            });
          },
        }}
        initValue={defaultValue}
      />
      <div>
        <h4>Props 说明</h4>
        <ul>
          <li>
            <code>width</code> - 编辑器宽度，设置为 100vw 占满视口宽度
          </li>
          <li>
            <code>height</code> - 编辑器高度，设置为 100vh 占满视口高度
          </li>
          <li>
            <code>reportMode</code> - 报告模式，优化显示效果
          </li>
          <li>
            <code>fncProps</code> - 脚注引用属性配置，包含自定义渲染函数
          </li>
          <li>
            <code>fncProps.render</code> - 脚注引用渲染函数，使用 Tooltip 包装
          </li>
          <li>
            <code>comment</code> - 评论功能配置
          </li>
          <li>
            <code>comment.enable</code> - 启用评论功能
          </li>
          <li>
            <code>comment.commentList</code> - 评论列表数据
          </li>
          <li>
            <code>comment.loadMentions</code> - 加载提及用户列表的异步函数
          </li>
          <li>
            <code>comment.onDelete</code> - 删除评论的回调函数
          </li>
          <li>
            <code>comment.onSubmit</code> - 提交评论的回调函数
          </li>
          <li>
            <code>image.upload</code> - 图片上传函数，支持文件和 URL 上传
          </li>
          <li>
            <code>toolBar.hideTools</code> - 隐藏工具栏中的 H1 工具
          </li>
          <li>
            <code>insertAutocompleteProps</code> - 插入自动完成属性配置
          </li>
          <li>
            <code>insertAutocompleteProps.optionsRender</code> -
            选项渲染函数，过滤掉 head1 选项
          </li>
          <li>
            <code>initValue</code> - 初始化的 Markdown 内容，包含脚注引用示例
          </li>
        </ul>
      </div>
    </>
  );
};
