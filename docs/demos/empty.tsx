import { MarkdownEditor, MarkdownEditorInstance } from '@ant-design/agentic-ui';
import { Button } from 'antd';
import React, { useEffect } from 'react';

export default () => {
  const editorRef = React.useRef<MarkdownEditorInstance>();
  useEffect(() => {
    const insertMarkdown = () => {
      editorRef.current?.store.setMDContent(
        `        
\`\`\`java
public class HelloWorld {
    public static void main(String[] args) {
        System.out.println("Hello, World");
    }
}
 \`\`\`

 <!-- {"submitText":"Al 辅助","chartType": "bar", "x":"业务", "y":"2021Q1"} -->
 \`\`\`schema
[{
    fieldProps: {
      nodeData: {
        id: "d451a556d866ba7b",
        topic: "new topic",
        root: true,
        children: [
          {
            topic: "new node",
            id: "d451a6f027c33b1f",
            direction: 0,
            children: [
              {
                topic: "new node",
                id: "d451a724b7c10970",
              },
              {
                topic: "new node",
                id: "d451a77ca7348eae",
              },
              {
                topic: "new node",
                id: "d451a78e1ec7181c",
              },
            ],
          },
        ],
      },
    },
  },
]
 \`\`\`
 `,
      );
    };
    insertMarkdown();
  }, []);
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#f0f2f5',
      }}
    >
      <div
        style={{
          border: '1px solid #f0f0f0',
          width: '40vw',
          margin: '20px auto',
        }}
      >
        <MarkdownEditor
          reportMode
          toc={false}
          initValue={`             
\`\`\`java
  public class HelloWorld {
     public static void main(String[] args) {
        System.out.println("Hello, World");
     }
}
\`\`\`


\`\`\`json
{
    "$schema": "https://json-schema.org/draft/2020-12/schema",
    "$id": "https://json-schema.org/draft/2020-12/schema",
    "$vocabulary": {
        "https://json-schema.org/draft/2020-12/vocab/core": true,
        "https://json-schema.org/draft/2020-12/vocab/applicator": true,
        "https://json-schema.org/draft/2020-12/vocab/unevaluated": true,
        "https://json-schema.org/draft/2020-12/vocab/validation": true,
        "https://json-schema.org/draft/2020-12/vocab/meta-data": true,
        "https://json-schema.org/draft/2020-12/vocab/format-annotation": true,
        "https://json-schema.org/draft/2020-12/vocab/content": true
    },
    "$dynamicAnchor": "meta",
    "title": "Core and Validation specifications meta-schema",
    "allOf": [
        {
            "$ref": "meta/core"
        },
        {
            "$ref": "meta/applicator"
        },
        {
            "$ref": "meta/unevaluated"
        },
        {
            "$ref": "meta/validation"
        },
        {
            "$ref": "meta/meta-data"
        },
        {
            "$ref": "meta/format-annotation"
        },
        {
            "$ref": "meta/content"
        }
    ],
    "type": [
        "object",
        "boolean"
    ],
    "$comment": "This meta-schema also defines keywords that have appeared in previous drafts in order to prevent incompatible extensions as they remain in common use.",
    "properties": {
        "definitions": {
            "$comment": ""definitions" has been replaced by "$defs".",
            "type": "object",
            "additionalProperties": {
                "$dynamicRef": "#meta"
            },
            "deprecated": true,
            "default": {}
        },
        "dependencies": {
            "$comment": ""dependencies" has been split and replaced by "dependentSchemas" and "dependentRequired" in order to serve their differing semantics.",
            "type": "object",
            "additionalProperties": {
                "anyOf": [
                    {
                        "$dynamicRef": "#meta"
                    },
                    {
                        "$ref": "meta/validation#/$defs/stringArray"
                    }
                ]
            },
            "deprecated": true,
            "default": {}
        },
        "$recursiveAnchor": {
            "$comment": ""$recursiveAnchor" has been replaced by "$dynamicAnchor".",
            "$ref": "meta/core#/$defs/anchorString",
            "deprecated": true
        },
        "$recursiveRef": {
            "$comment": ""$recursiveRef" has been replaced by "$dynamicRef".",
            "$ref": "meta/core#/$defs/uriReferenceString",
            "deprecated": true
        }
    }
}
\`\`\`

\`\`\`sql
SELECT employees.name, departments.department_name FROM employees INNER JOIN departments ON employees.department_id = departments.id;
\`\`\`
             `}
          toolBar={{
            min: true,
            enable: true,
            extra: [
              <Button
                key="插入"
                onClick={() => {
                  editorRef.current?.store.setMDContent(
                    `# 标题
**粗体**`,
                  );
                }}
              >
                <span>插入一个markdown</span>
              </Button>,
            ],
          }}
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
          onChange={(e, c) => console.log(e, c)}
          width={'60vw'}
          height={'500px'}
        />
        <div>
          <h4>Props 说明</h4>
          <ul>
            <li>
              <code>reportMode</code> - 报告模式，优化显示效果
            </li>
            <li>
              <code>toc</code> - 是否显示目录，设置为 false 隐藏目录
            </li>
            <li>
              <code>initValue</code> - 初始化的 Markdown 内容，包含代码块和 JSON
              Schema
            </li>
            <li>
              <code>toolBar</code> - 工具栏配置，包含最小化、启用状态和额外按钮
            </li>
            <li>
              <code>toolBar.min</code> - 工具栏最小化状态
            </li>
            <li>
              <code>toolBar.enable</code> - 工具栏启用状态
            </li>
            <li>
              <code>toolBar.extra</code> - 工具栏额外按钮，包含插入 Markdown
              功能
            </li>
            <li>
              <code>image.upload</code> - 图片上传函数，支持文件和 URL 上传
            </li>
            <li>
              <code>readonly</code> - 只读模式，用户无法编辑内容
            </li>
            <li>
              <code>onChange</code> - 内容变化回调函数，输出到控制台
            </li>
            <li>
              <code>width</code> - 编辑器宽度，设置为 60vw
            </li>
            <li>
              <code>height</code> - 编辑器高度，设置为 500px
            </li>
            <li>
              <code>editorRef</code> - 编辑器引用，用于调用 store.setMDContent
              方法
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
