import { BubbleList } from '@ant-design/agentic-ui';
import React from 'react';

/**
 * 扩展 classNames 配置示例
 *
 * 本示例展示了如何使用新增的 classNames 和 styles 配置来自定义气泡组件的样式
 */
export default function ClassNamesExtendedDemo() {
  const sampleMessages = [
    {
      id: '1',
      role: 'user' as const,
      content:
        '给 `BubbleList` 加了 `classNames.content` 之后，里面的引用块和代码块会跟着变吗？',
      createAt: Date.now(),
      updateAt: Date.now(),
      meta: {
        avatar: '👤',
        title: '用户',
        name: '张三',
      },
    },
    {
      id: '2',
      role: 'bot' as const,
      content:
        '会。样式作用在内容容器上时，内部 Markdown（引用、行内代码、`pre` 等）都在同一作用域下，可按需再用更细的选择器区分。',
      createAt: Date.now(),
      updateAt: Date.now(),
      meta: {
        avatar: '🤖',
        title: '助手',
        name: 'AI助手',
      },
    },
    {
      id: '3',
      role: 'bot' as const,
      content:
        '本条模拟 **未完成**（`isFinished: false`），用于观察加载态、骨架与自定义类名同时存在时的表现。',
      createAt: Date.now(),
      updateAt: Date.now(),
      isFinished: false,
      meta: {
        avatar: '🔄',
        title: '助手',
        name: 'AI助手',
      },
    },
  ];

  // 自定义类名配置
  const customClassNames = {
    // 气泡根容器样式
    bubbleClassName: 'custom-bubble',

    // 头像标题区域样式
    bubbleAvatarTitleClassName: 'custom-avatar-title',

    // 主容器样式
    bubbleContainerClassName: 'custom-container',

    // 加载图标样式
    bubbleLoadingIconClassName: 'custom-loading-icon',

    // 名称区域样式
    bubbleNameClassName: 'custom-name',

    // 内容区域样式
    bubbleListItemContentClassName: 'custom-content',

    // 前置区域样式
    bubbleListItemBeforeClassName: 'custom-before',

    // 后置区域样式
    bubbleListItemAfterClassName: 'custom-after',

    // 标题样式
    bubbleListItemTitleClassName: 'custom-title',

    // 头像样式
    bubbleListItemAvatarClassName: 'custom-avatar',
  };

  // 自定义样式配置
  const customStyles = {
    // 气泡根容器样式
    bubbleStyle: {
      border: '2px solid #1890ff',
      borderRadius: '12px',
      margin: '8px 0',
    },

    // 头像标题区域样式
    bubbleAvatarTitleStyle: {
      backgroundColor: '#f0f8ff',
      padding: '8px',
      borderRadius: '8px 8px 0 0',
    },

    // 主容器样式
    bubbleContainerStyle: {
      backgroundColor: '#fafafa',
      padding: '12px',
    },

    // 加载图标样式
    bubbleLoadingIconStyle: {
      backgroundColor: '#fff2e8',
      borderRadius: '50%',
      padding: '4px',
    },

    // 名称区域样式
    bubbleNameStyle: {
      fontWeight: 'bold',
      color: '#1890ff',
      textDecoration: 'underline',
    },

    // 内容区域样式
    bubbleListItemContentStyle: {
      backgroundColor: '#fff',
      border: '1px solid #d9d9d9',
      borderRadius: '8px',
      padding: '12px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    },

    // 前置区域样式
    bubbleListItemBeforeStyle: {
      backgroundColor: '#e6f7ff',
      border: '1px dashed #1890ff',
      borderRadius: '4px',
      padding: '8px',
    },

    // 后置区域样式
    bubbleListItemAfterStyle: {
      backgroundColor: '#f6ffed',
      border: '1px dashed #52c41a',
      borderRadius: '4px',
      padding: '8px',
    },

    // 标题样式
    bubbleListItemTitleStyle: {
      fontSize: '14px',
      fontWeight: 'bold',
      color: '#722ed1',
    },

    // 头像样式
    bubbleListItemAvatarStyle: {
      border: '3px solid #ff7a45',
      borderRadius: '12px',
      padding: '4px',
    },
  };

  return (
    <div style={{ padding: '24px' }}>
      <h2>扩展 classNames 和 styles 配置示例</h2>

      <div style={{ marginBottom: '16px' }}>
        <h3>功能说明</h3>
        <p>本示例展示了新增的 classNames 和 styles 配置选项：</p>
        <ul>
          <li>
            <strong>bubbleClassName / bubbleStyle</strong>: 气泡根容器
          </li>
          <li>
            <strong>bubbleAvatarTitleClassName / bubbleAvatarTitleStyle</strong>
            : 头像标题区域
          </li>
          <li>
            <strong>bubbleContainerClassName / bubbleContainerStyle</strong>:
            主容器
          </li>
          <li>
            <strong>bubbleLoadingIconClassName / bubbleLoadingIconStyle</strong>
            : 加载图标
          </li>
          <li>
            <strong>bubbleNameClassName / bubbleNameStyle</strong>: 名称区域
          </li>
          <li>
            <strong>
              bubbleListItemContentClassName / bubbleListItemContentStyle
            </strong>
            : 内容区域
          </li>
          <li>
            <strong>
              bubbleListItemBeforeClassName / bubbleListItemBeforeStyle
            </strong>
            : 前置区域
          </li>
          <li>
            <strong>
              bubbleListItemAfterClassName / bubbleListItemAfterStyle
            </strong>
            : 后置区域
          </li>
          <li>
            <strong>
              bubbleListItemTitleClassName / bubbleListItemTitleStyle
            </strong>
            : 标题
          </li>
          <li>
            <strong>
              bubbleListItemAvatarClassName / bubbleListItemAvatarStyle
            </strong>
            : 头像
          </li>
        </ul>
      </div>

      <style>{`
        .custom-bubble {
          transition: all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
        }
        .custom-bubble:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(24, 144, 255, 0.3);
        }
        .custom-avatar-title {
          position: relative;
        }
        .custom-avatar-title::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 4px;
          background: linear-gradient(to bottom, #1890ff, #722ed1);
          border-radius: 2px;
        }
        .custom-container {
          position: relative;
        }
        .custom-loading-icon {
          animation: pulse 2s infinite;
        }
        @keyframes pulse {
          0% { opacity: 0.6; }
          50% { opacity: 1; }
          100% { opacity: 0.6; }
        }
        .custom-name {
          position: relative;
        }
        .custom-name::after {
          content: '✨';
          margin-left: 4px;
        }
        .custom-content {
          position: relative;
          overflow: hidden;
        }
        .custom-content::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 2px;
          background: linear-gradient(90deg, #1890ff, #722ed1, #ff7a45);
        }
        .custom-avatar {
          transition: transform 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
        }
        .custom-avatar:hover {
          transform: scale(1.1) rotate(5deg);
        }
      `}</style>

      <div
        style={{
          height: '500px',
          border: '1px solid #e8e8e8',
          borderRadius: '8px',
          overflow: 'hidden',
        }}
      >
        <BubbleList
          bubbleList={sampleMessages}
          classNames={customClassNames}
          styles={customStyles}
          pure
          markdownRenderConfig={{
            tableConfig: {
              pure: true,
            },
          }}
          assistantMeta={{
            avatar: '🤖',
            title: 'AI助手',
            name: 'Assistant',
          }}
          bubbleRenderConfig={{
            contentBeforeRender: () => (
              <div
                style={{ fontSize: '12px', color: '#666', fontStyle: 'italic' }}
              >
                💡 这是自定义的前置内容
              </div>
            ),
            contentAfterRender: () => (
              <div
                style={{ fontSize: '12px', color: '#666', textAlign: 'right' }}
              >
                📎 这是自定义的后置内容
              </div>
            ),
          }}
        />
      </div>

      <div style={{ marginTop: '16px' }}>
        <h3>代码示例</h3>
        <pre
          style={{
            backgroundColor: '#f5f5f5',
            padding: '16px',
            borderRadius: '8px',
            overflow: 'auto',
            fontSize: '12px',
          }}
        >
          {`const customClassNames = {
  bubbleClassName: 'custom-bubble',
  bubbleAvatarTitleClassName: 'custom-avatar-title',
  bubbleContainerClassName: 'custom-container',
  bubbleLoadingIconClassName: 'custom-loading-icon',
  bubbleNameClassName: 'custom-name',
  bubbleListItemContentClassName: 'custom-content',
  // ... 其他配置
};

const customStyles = {
  bubbleStyle: {
    border: '2px solid #1890ff',
    borderRadius: '12px',
  },
  bubbleNameStyle: {
    fontWeight: 'bold',
    color: '#1890ff',
  },
  // ... 其他配置
};

<BubbleList
  bubbleList={messages}
  classNames={customClassNames}
  styles={customStyles}
  pure
/>`}
        </pre>
      </div>
    </div>
  );
}
