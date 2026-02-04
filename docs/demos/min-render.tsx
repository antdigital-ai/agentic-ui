import { MarkdownEditor } from '@ant-design/agentic-ui';
import { CodeFilled } from '@ant-design/icons';
import { Modal } from 'antd';
import React, { useState } from 'react';
import { newEnergyFundContent } from './shared/newEnergyFundContent';

const defaultValue =
  newEnergyFundContent +
  `

## 创始人

Umi 是一个可扩展的企业级前端应用框架，中文发音为「乌米」，由蚂蚁金服开发并广泛应用于复杂前端项目

<!-- {"MarkdownType": "section", "id": "16" } -->


## 表格


| 业务          | 2021Q1  | 2021Q2  | 2021Q3  | 2021Q4  | 2022Q1  | 2022Q2  | 2022Q3  | 2022Q4  | 2023Q1  | 2023Q2  | 2023Q3  | 2023Q4  |
| ------------- | ------- | ------- | ------- | ------- | ------- | ------- | ------- | ------- | ------- | ------- | ------- | ------- |
| 收入          | 135,303 | 138,259 | 142,368 | 144,188 | 135,471 | 134,034 | 140,093 | 144,954 | 149,986 | 149,208 | 154,625 | 155,200 |
| 增值服务      | 72,443  | 72,013  | 75,203  | 71,913  | 72,738  | 71,683  | 72,727  | 70,417  | 79,337  | 74,211  | 75,748  | 69,100  |
| 网络游戏     | 43,600  | 43,000  | 44,900  | 42,800  | 43,600  | 42,500  | na      | na      | na      | 44,500  | 46,000  | 40,900  |
| 社交网络收入 | 28,800  | 29,000  | 30,300  | 29,100  | 29,100  | 29,200  | na      | na      | na      | 29,700  | 29,700  | 28,200  |
| 网络广告      | 21,820  | 22,833  | 22,495  | 21,518  | 17,988  | 18,638  | 21,443  | 24,660  | 20,964  | 25,003  | 25,721  | 29,794  |
| 其他          | 41,040  | 43,413  | 44,670  | 50,757  | 44,745  | 43,713  | 45,923  | 49,877  | 49,685  | 49,994  | 53,156  | 54,379  |
| 金融科技     | 39,028  | 41,892  | 43,317  | 47,958  | 42,768  | 42,208  | 44,844  | 47,244  | 48,701  | 48,635  | 52,048  | 52,435  |
| 云           | 62,012   | 1,521   | 1,353   | 2,799   | 1,977   | 1,505   | 1,079   | 2,633   | 984     | 1,359   | 1,108   | 1,944   |




## 定义列表

| 业务 | 增值服务 | 网络游戏 | 社交网络收入 | 网络广告 | 其他    | 金融科技 | 云      |
| ---- | -------- | -------- | ------------ | -------- | ------- | -------- | ------- |
| 收入 | 135,303  | 138,259  | 142,368      | 144,188  | 135,471 | 134,034  | 140,093 |



## Bar 图表

<!-- {"chartType": "bar", "x":"业务", "y":"2021Q1"} -->

| 业务          | 2021Q1  | 2021Q2  | 2021Q3  | 2021Q4  |
| ------------- | ------- | ------- | ------- | ------- |
| 收入          | 135,303 | 138,259 | 142,368 | 144,188 | 
| 增值服务      | 72,443  | 72,013  | 75,203  | 71,913  |
| 网络游戏     | 43,600  | 43,000  | 44,900  | 42,800  |
| 社交网络收入 | 28,800  | 29,000  | 30,300  | 29,100  | 
| 网络广告      | 21,820  | 22,833  | 22,495  | 21,518  | 
| 其他          | 41,040  | 43,413  | 44,670  | 50,757  | 
| 金融科技     | 39,028  | 41,892  | 43,317  | 47,958  | 
| 云           | 162,012   | 111,521   | 111,353   | 112,799   |

## Line 图表

<!-- {"chartType": "line", "x":"业务", "y":"2021Q1"} -->

| 业务          | 2021Q1  | 2021Q2  | 2021Q3  | 2021Q4  |
| ------------- | ------- | ------- | ------- | ------- |
| 收入          | 135,303 | 138,259 | 142,368 | 144,188 | 
| 增值服务      | 72,443  | 72,013  | 75,203  | 71,913  |
| 网络游戏     | 43,600  | 43,000  | 44,900  | 42,800  |
| 社交网络收入 | 28,800  | 29,000  | 30,300  | 29,100  | 
| 网络广告      | 21,820  | 22,833  | 22,495  | 21,518  | 
| 其他          | 41,040  | 43,413  | 44,670  | 50,757  | 
| 金融科技     | 39,028  | 41,892  | 43,317  | 47,958  | 
| 云           | 162,012   | 111,521   | 111,353   | 112,799   | 

## 图表 column

<!-- {"chartType": "column", "x":"业务", "y":"2021Q1"} -->

| 业务          | 2021Q1  | 2021Q2  | 2021Q3  | 2021Q4  |
| ------------- | ------- | ------- | ------- | ------- |
| 收入          | 135,303 | 138,259 | 142,368 | 144,188 | 
| 增值服务      | 72,443  | 72,013  | 75,203  | 71,913  |
| 网络游戏     | 43,600  | 43,000  | 44,900  | 42,800  |
| 社交网络收入 | 28,800  | 29,000  | 30,300  | 29,100  | 
| 网络广告      | 21,820  | 22,833  | 22,495  | 21,518  | 
| 其他          | 41,040  | 43,413  | 44,670  | 50,757  | 
| 金融科技     | 39,028  | 41,892  | 43,317  | 47,958  | 
| 云           | 162,012   | 111,521   | 111,353   | 112,799   |

## 图表 pie

<!-- {"chartType": "pie", "x":"业务", "y":"2021Q1"} -->

| 业务          | 2021Q1  | 2021Q2  | 2021Q3  | 2021Q4  |
| ------------- | ------- | ------- | ------- | ------- |
| 收入          | 135,303 | 138,259 | 142,368 | 144,188 | 
| 增值服务      | 72,443  | 72,013  | 75,203  | 71,913  |
| 网络游戏     | 43,600  | 43,000  | 44,900  | 42,800  |
| 社交网络收入 | 28,800  | 29,000  | 30,300  | 29,100  | 
| 网络广告      | 21,820  | 22,833  | 22,495  | 21,518  | 
| 其他          | 41,040  | 43,413  | 44,670  | 50,757  | 
| 金融科技     | 39,028  | 41,892  | 43,317  | 47,958  | 
| 云           | 162,012   | 111,521   | 111,353   | 112,799   | 

## 图表 area

<!-- {"chartType": "area", "x":"业务", "y":"2021Q1"} -->

| 业务          | 2021Q1  | 2021Q2  | 2021Q3  | 2021Q4  |
| ------------- | ------- | ------- | ------- | ------- |
| 收入          | 135,303 | 138,259 | 142,368 | 144,188 | 
| 增值服务      | 72,443  | 72,013  | 75,203  | 71,913  |
| 网络游戏     | 43,600  | 43,000  | 44,900  | 42,800  |
| 社交网络收入 | 28,800  | 29,000  | 30,300  | 29,100  | 
| 网络广告      | 21,820  | 22,833  | 22,495  | 21,518  | 
| 其他          | 41,040  | 43,413  | 44,670  | 50,757  | 
| 金融科技     | 39,028  | 41,892  | 43,317  | 47,958  | 
| 云           | 162,012   | 111,521   | 111,353   | 112,799   | 


## 图片

![](https://mdn.alipayobjects.com/huamei_gcee1x/afts/img/A*9F0qRYV8EjUAAAAAAAAAAAAADml6AQ/original)

## 视频

![video:视频名](https://gw.alipayobjects.com/v/huamei_gcee1x/afts/video/A*NudQQry0ERwAAAAAAAAAAAAADtN3AQ)


## 附件
<!-- {"updateTime":"2014-07-29","collaborators":[{"Chen Shuai":33},{"Chen Shuai":33},{"Chen Shuai":33},{"Rui Ma":39},{"Rui Ma":39},{"Rui Ma":39},{"Chen Shuai":33},{"Rui Ma":39},{"ivan.cseeing":32},{"InvRet Sales Team":34},{"Chen Shuai":33},{"Rui Ma":39},{"Rui Ma":39},{"Chen Shuai":33},{"Rui Ma":39},{"Rui Ma":39},{"Chen Shuai":33}]} -->
![attachment:测试附件.pdf](https://gw.alipayobjects.com/v/huamei_gcee1x/afts/video/A*NudQQry0ERwAAAAAAAAAAAAADtN3AQ)


## 引用

上上任的武汉大学校长是李晓红。[^1][^2]

| 业务          | 2021Q1  | 2021Q2  | 2021Q3  | 2021Q4  | 
| ------------- | ------- | ------- | ------- | ------- | 
| 收入          | 135,303 | 138,259[^2] | 142,368 | 144,188 | 
| 增值服务      | 72,443  | 72,013  | 75,203  | 71,913  | 
| 网络游戏     | 43,600  | 43,000  | 44,900  | 42,800  |
| 社交网络收入 | 28,800  | 29,000  | 30,300  | 29,100  | 
| 网络广告      | 21,820  | 22,833  | 22,495  | 21,518  | 
| 其他          | 41,040  | 43,413  | 44,670  | 50,757  | 
| 金融科技     | 39,028  | 41,892  | 43,317  | 47,958  | 
| 云           | 162,012   | 111,521   | 111,353   | 112,799   | 
> 数据来自 [^3]


[^1]:remarkjs.md
[^2]:remarkjs.md


## 表单

\`\`\`schema
[
  {
    "title": "标题",
    "dataIndex": "title",
    "formItemProps": {
      "rules": [{ "required": true, "message": "此项为必填项" }]
    },
    "width": "md"
  },
  {
    "title": "状态",
    "dataIndex": "state",
    "valueType": "select",
    "width": "md"
  },
  { "title": "标签", "dataIndex": "labels", "width": "md" },
  {
    "valueType": "switch",
    "title": "开关",
    "dataIndex": "Switch",
    "fieldProps": { "style": { "width": "200px" } },
    "width": "md"
  },
  {
    "title": "创建时间",
    "key": "showTime",
    "dataIndex": "createName",
    "width": "md"
  },
  { "title": "更新时间", "dataIndex": "updateName" },
  {
    "title": "分组",
    "valueType": "group",
    "columns": [
      {
        "title": "状态",
        "dataIndex": "groupState",
        "valueType": "select",
        "width": "xs",
        "colProps": { "xs": 12 }
      },
      {
        "title": "标题",
        "width": "md",
        "dataIndex": "groupTitle",
        "colProps": { "xs": 12 },
        "formItemProps": {
          "rules": [{ "required": true, "message": "此项为必填项" }]
        }
      }
    ]
  },
  {
    "title": "列表",
    "valueType": "formList",
    "dataIndex": "list",
    "columns": [
      {
        "valueType": "group",
        "columns": [
          {
            "title": "状态",
            "dataIndex": "state",
            "valueType": "select",
            "colProps": { "xs": 24, "sm": 12 },
            "width": "xs"
          },
          {
            "title": "标题",
            "dataIndex": "title",
            "width": "md",
            "formItemProps": {
              "rules": [{ "required": true, "message": "此项为必填项" }]
            },
            "colProps": { "xs": 24, "sm": 12 }
          }
        ]
      },
      { "valueType": "dateTime", "dataIndex": "currentTime", "width": "md" }
    ]
  },
  {
    "title": "创建时间",
    "dataIndex": "created_at",
    "valueType": "dateRange",
    "width": "md"
  }
]
\`\`\`


## 代码

\`\`\`java
Class A {
  main() {
    System.out.println("Hello World");
  }
}
\`\`\`

## 删除线
~~插件系统架构~~

`;
export default () => {
  const [sourceText, setSourceText] = useState<string>('');
  const [typewriter, setTypewriter] = useState(true);
  return (
    <div
      style={{
        padding: 64,
        display: 'flex',
        flexDirection: 'column',
        gap: 24,
        maxWidth: 600,
        margin: '0 auto',
      }}
    >
      <Modal
        open={!!sourceText}
        footer={null}
        onCancel={() => setSourceText('')}
        afterOpenChange={(open) => {
          if (!open) setSourceText('');
        }}
      >
        <div>
          <code
            style={{
              whiteSpace: 'pre-wrap',
              padding: 24,
              display: 'block',
              backgroundColor: '#f0f0f0',
            }}
          >
            {sourceText}
          </code>
        </div>
      </Modal>
      {defaultValue
        .split('##')
        .filter((item) => item)
        .map((item, index) => {
          return (
            <div
              key={index}
              style={{
                padding: 24,
                borderRadius: 24,
                backgroundColor: '#fff',
                border: '1px solid #f0f0f0',
                margin: '20px auto',
                width: '100%',
                position: 'relative',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: 14,
                  right: 24,
                  display: 'flex',
                  gap: 8,
                  zIndex: 999,
                }}
              >
                <div
                  onClick={() => {
                    setTypewriter(!typewriter);
                  }}
                >
                  {typewriter ? 'typewriter' : ''}
                </div>
                <a
                  onClick={(e) => {
                    e.stopPropagation();
                    setSourceText('## ' + item);
                  }}
                >
                  <CodeFilled />
                </a>
              </div>
              <MarkdownEditor
                toc={false}
                key={index}
                width={'100%'}
                typewriter={typewriter}
                height={'auto'}
                readonly
                initValue={'## ' + item.trim()}
              />
            </div>
          );
        })}
      <div>
        <h4>Props 说明</h4>
        <ul>
          <li>
            <code>toc</code> - 是否显示目录，设置为 false 隐藏目录
          </li>
          <li>
            <code>width</code> - 编辑器宽度，设置为 100% 占满容器
          </li>
          <li>
            <code>typewriter</code> - 打字机模式，通过 state 控制开关
          </li>
          <li>
            <code>height</code> - 编辑器高度，设置为 auto 自适应内容
          </li>
          <li>
            <code>readonly</code> - 只读模式，用户无法编辑内容
          </li>
          <li>
            <code>initValue</code> - 初始化的 Markdown 内容，按章节分割显示
          </li>
          <li>
            <code>Modal</code> - 用于显示源代码的弹窗组件
          </li>
          <li>
            <code>sourceText</code> - 当前显示的源代码内容
          </li>
        </ul>
      </div>
    </div>
  );
};
