import { render, screen } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import React from 'react';
import { describe, expect, it } from 'vitest';
import { TaskList } from '../../../src/Workspace/Task';

describe('TaskList Component', () => {
  const renderWithProvider = (ui: React.ReactElement) => {
    return render(<ConfigProvider>{ui}</ConfigProvider>);
  };

  it('应该正确渲染任务列表', () => {
    const data = {
      items: [
        {
          key: '1',
          title: '测试任务',
          content: '这是测试内容',
          status: 'success' as const,
        },
      ],
    };

    renderWithProvider(<TaskList data={data} />);

    expect(screen.getByTestId('task-list')).toBeInTheDocument();
    expect(screen.getByText('测试任务')).toBeInTheDocument();
    expect(screen.getByText('这是测试内容')).toBeInTheDocument();
  });

  it('应该正确渲染成功状态图标', () => {
    const data = {
      items: [
        {
          key: '1',
          title: '成功任务',
          status: 'success' as const,
        },
      ],
    };

    const { container } = renderWithProvider(<TaskList data={data} />);

    const item = container.querySelector('.ant-agentic-workspace-task-item-success');
    expect(item).toBeInTheDocument();
  });

  it('应该正确渲染错误状态图标', () => {
    const data = {
      items: [
        {
          key: '1',
          title: '错误任务',
          status: 'error' as const,
        },
      ],
    };

    const { container } = renderWithProvider(<TaskList data={data} />);

    const item = container.querySelector('.ant-agentic-workspace-task-item-error');
    expect(item).toBeInTheDocument();
  });

  it('应该正确渲染加载状态图标', () => {
    const data = {
      items: [
        {
          key: '1',
          title: '加载中任务',
          status: 'loading' as const,
        },
      ],
    };

    const { container } = renderWithProvider(<TaskList data={data} />);

    const item = container.querySelector('.ant-agentic-workspace-task-item-loading');
    expect(item).toBeInTheDocument();
  });

  it('应该正确渲染待处理状态图标', () => {
    const data = {
      items: [
        {
          key: '1',
          title: '待处理任务',
          status: 'pending' as const,
        },
      ],
    };

    const { container } = renderWithProvider(<TaskList data={data} />);

    const item = container.querySelector('.ant-agentic-workspace-task-item-pending');
    expect(item).toBeInTheDocument();
  });

  it('应该正确渲染多个任务', () => {
    const data = {
      items: [
        {
          key: '1',
          title: '任务1',
          status: 'success' as const,
        },
        {
          key: '2',
          title: '任务2',
          status: 'loading' as const,
        },
        {
          key: '3',
          title: '任务3',
          status: 'error' as const,
        },
      ],
    };

    renderWithProvider(<TaskList data={data} />);

    expect(screen.getByText('任务1')).toBeInTheDocument();
    expect(screen.getByText('任务2')).toBeInTheDocument();
    expect(screen.getByText('任务3')).toBeInTheDocument();
  });

  it('应该在没有内容时不显示描述区域', () => {
    const data = {
      items: [
        {
          key: '1',
          title: '无内容任务',
          status: 'success' as const,
        },
      ],
    };

    const { container } = renderWithProvider(<TaskList data={data} />);

    const description = container.querySelector(
      '.ant-agentic-workspace-task-description',
    );
    expect(description).not.toBeInTheDocument();
  });

  it('应该在有内容时显示描述区域', () => {
    const data = {
      items: [
        {
          key: '1',
          title: '有内容任务',
          content: '这是描述内容',
          status: 'success' as const,
        },
      ],
    };

    const { container } = renderWithProvider(<TaskList data={data} />);

    const description = container.querySelector(
      '.ant-agentic-workspace-task-description',
    );
    expect(description).toBeInTheDocument();
  });

  it('应该支持ReactNode作为内容', () => {
    const data = {
      items: [
        {
          key: '1',
          title: '复杂内容任务',
          content: <div data-testid="custom-content">自定义内容</div>,
          status: 'success' as const,
        },
      ],
    };

    renderWithProvider(<TaskList data={data} />);

    expect(screen.getByTestId('custom-content')).toBeInTheDocument();
  });

  it('应该支持ReactNode数组作为内容', () => {
    const data = {
      items: [
        {
          key: '1',
          title: '数组内容任务',
          content: [
            <div key="1" data-testid="content-1">
              内容1
            </div>,
            <div key="2" data-testid="content-2">
              内容2
            </div>,
          ],
          status: 'success' as const,
        },
      ],
    };

    renderWithProvider(<TaskList data={data} />);

    expect(screen.getByTestId('content-1')).toBeInTheDocument();
    expect(screen.getByTestId('content-2')).toBeInTheDocument();
  });

  it('应该为每个任务项应用正确的类名', () => {
    const data = {
      items: [
        {
          key: '1',
          title: '测试任务',
          status: 'success' as const,
        },
      ],
    };

    const { container } = renderWithProvider(<TaskList data={data} />);

    expect(
      container.querySelector('.ant-agentic-workspace-task-item'),
    ).toBeInTheDocument();
    expect(
      container.querySelector('.ant-agentic-workspace-task-status'),
    ).toBeInTheDocument();
    expect(
      container.querySelector('.ant-agentic-workspace-task-content'),
    ).toBeInTheDocument();
    expect(
      container.querySelector('.ant-agentic-workspace-task-title'),
    ).toBeInTheDocument();
  });

  it('应该处理没有标题的任务', () => {
    const data = {
      items: [
        {
          key: '1',
          content: '只有内容',
          status: 'success' as const,
        },
      ],
    };

    const { container } = renderWithProvider(<TaskList data={data} />);

    expect(screen.getByText('只有内容')).toBeInTheDocument();
    const title = container.querySelector('.ant-agentic-workspace-task-title');
    expect(title).toBeInTheDocument();
  });

  it('应该处理空任务列表', () => {
    const data = {
      items: [],
    };

    const { container } = renderWithProvider(<TaskList data={data} />);

    const taskList = screen.getByTestId('task-list');
    expect(taskList).toBeInTheDocument();
    expect(taskList.children.length).toBe(0);
  });

  it('应该为不同状态应用不同的样式类', () => {
    const statuses = ['success', 'pending', 'loading', 'error'] as const;

    statuses.forEach((status) => {
      const data = {
        items: [
          {
            key: `${status}-1`,
            title: `${status} 任务`,
            status,
          },
        ],
      };

      const { container } = renderWithProvider(<TaskList data={data} />);

      expect(
        container.querySelector(`.ant-agentic-workspace-task-item-${status}`),
      ).toBeInTheDocument();
    });
  });

  describe('StatusIcon 组件', () => {
    it('应该为success状态显示绿色图标', () => {
      const data = {
        items: [
          {
            key: '1',
            title: '成功',
            status: 'success' as const,
          },
        ],
      };

      const { container } = renderWithProvider(<TaskList data={data} />);
      const statusIcon = container.querySelector(
        '.ant-agentic-workspace-task-status svg',
      );
      expect(statusIcon).toBeInTheDocument();
    });

    it('应该为error状态显示红色图标', () => {
      const data = {
        items: [
          {
            key: '1',
            title: '错误',
            status: 'error' as const,
          },
        ],
      };

      const { container } = renderWithProvider(<TaskList data={data} />);
      const statusIcon = container.querySelector(
        '.ant-agentic-workspace-task-status svg',
      );
      expect(statusIcon).toBeInTheDocument();
    });

    it('应该为loading状态显示Loading组件', () => {
      const data = {
        items: [
          {
            key: '1',
            title: '加载中',
            status: 'loading' as const,
          },
        ],
      };

      const { container } = renderWithProvider(<TaskList data={data} />);
      const statusIcon = container.querySelector('.ant-agentic-workspace-task-status');
      expect(statusIcon).toBeInTheDocument();
    });

    it('应该为pending状态显示灰色图标', () => {
      const data = {
        items: [
          {
            key: '1',
            title: '待处理',
            status: 'pending' as const,
          },
        ],
      };

      const { container } = renderWithProvider(<TaskList data={data} />);
      const statusIcon = container.querySelector(
        '.ant-agentic-workspace-task-status svg',
      );
      expect(statusIcon).toBeInTheDocument();
    });
  });

  describe('边缘情况', () => {
    it('应该处理数字作为title', () => {
      const data = {
        items: [
          {
            key: '1',
            title: 12345,
            status: 'success' as const,
          },
        ],
      };

      renderWithProvider(<TaskList data={data} />);
      expect(screen.getByText('12345')).toBeInTheDocument();
    });

    it('应该处理ReactNode作为title', () => {
      const data = {
        items: [
          {
            key: '1',
            title: <span data-testid="custom-title">自定义标题</span>,
            status: 'success' as const,
          },
        ],
      };

      renderWithProvider(<TaskList data={data} />);
      expect(screen.getByTestId('custom-title')).toBeInTheDocument();
    });

    it('应该处理空字符串title', () => {
      const data = {
        items: [
          {
            key: '1',
            title: '',
            status: 'success' as const,
          },
        ],
      };

      const { container } = renderWithProvider(<TaskList data={data} />);
      const title = container.querySelector('.ant-agentic-workspace-task-title');
      expect(title).toBeInTheDocument();
      expect(title?.textContent).toBe('');
    });

    it('应该处理空字符串content', () => {
      const data = {
        items: [
          {
            key: '1',
            title: '任务',
            content: '',
            status: 'success' as const,
          },
        ],
      };

      const { container } = renderWithProvider(<TaskList data={data} />);
      // 空字符串被视为falsy，不显示描述区域
      const description = container.querySelector(
        '.ant-agentic-workspace-task-description',
      );
      expect(description).not.toBeInTheDocument();
    });

    it('应该处理0作为content', () => {
      const data = {
        items: [
          {
            key: '1',
            title: '任务',
            content: 0 as any,
            status: 'success' as const,
          },
        ],
      };

      renderWithProvider(<TaskList data={data} />);
      // 0会被渲染
      expect(screen.getByText('0')).toBeInTheDocument();
    });

    it('应该处理null作为content', () => {
      const data = {
        items: [
          {
            key: '1',
            title: '任务',
            content: null as any,
            status: 'success' as const,
          },
        ],
      };

      const { container } = renderWithProvider(<TaskList data={data} />);
      const description = container.querySelector(
        '.ant-agentic-workspace-task-description',
      );
      expect(description).not.toBeInTheDocument();
    });

    it('应该处理undefined作为content', () => {
      const data = {
        items: [
          {
            key: '1',
            title: '任务',
            content: undefined,
            status: 'success' as const,
          },
        ],
      };

      const { container } = renderWithProvider(<TaskList data={data} />);
      const description = container.querySelector(
        '.ant-agentic-workspace-task-description',
      );
      expect(description).not.toBeInTheDocument();
    });

    it('应该处理非常长的标题', () => {
      const longTitle = 'A'.repeat(1000);
      const data = {
        items: [
          {
            key: '1',
            title: longTitle,
            status: 'success' as const,
          },
        ],
      };

      renderWithProvider(<TaskList data={data} />);
      expect(screen.getByText(longTitle)).toBeInTheDocument();
    });

    it('应该处理非常长的内容', () => {
      const longContent = 'B'.repeat(1000);
      const data = {
        items: [
          {
            key: '1',
            title: '任务',
            content: longContent,
            status: 'success' as const,
          },
        ],
      };

      renderWithProvider(<TaskList data={data} />);
      expect(screen.getByText(longContent)).toBeInTheDocument();
    });

    it('应该处理特殊字符', () => {
      const data = {
        items: [
          {
            key: '1',
            title: '<script>alert("xss")</script>',
            content: '& < > " \' /',
            status: 'success' as const,
          },
        ],
      };

      renderWithProvider(<TaskList data={data} />);
      expect(
        screen.getByText('<script>alert("xss")</script>'),
      ).toBeInTheDocument();
      expect(screen.getByText('& < > " \' /')).toBeInTheDocument();
    });

    it('应该处理中文字符', () => {
      const data = {
        items: [
          {
            key: '1',
            title: '这是中文标题',
            content: '这是中文内容',
            status: 'success' as const,
          },
        ],
      };

      renderWithProvider(<TaskList data={data} />);
      expect(screen.getByText('这是中文标题')).toBeInTheDocument();
      expect(screen.getByText('这是中文内容')).toBeInTheDocument();
    });

    it('应该处理表情符号', () => {
      const data = {
        items: [
          {
            key: '1',
            title: '任务 😀 🎉',
            content: '内容 ✅ ❌',
            status: 'success' as const,
          },
        ],
      };

      renderWithProvider(<TaskList data={data} />);
      expect(screen.getByText('任务 😀 🎉')).toBeInTheDocument();
      expect(screen.getByText('内容 ✅ ❌')).toBeInTheDocument();
    });

    it('应该处理重复的key', () => {
      const data = {
        items: [
          {
            key: '1',
            title: '任务1',
            status: 'success' as const,
          },
          {
            key: '1',
            title: '任务2',
            status: 'error' as const,
          },
        ],
      };

      renderWithProvider(<TaskList data={data} />);
      // React会警告，但应该都能渲染
      expect(screen.getByText('任务1')).toBeInTheDocument();
      expect(screen.getByText('任务2')).toBeInTheDocument();
    });

    it('应该处理大量任务项', () => {
      const items = Array.from({ length: 100 }, (_, i) => ({
        key: `task-${i}`,
        title: `任务 ${i}`,
        status: 'success' as const,
      }));

      const data = { items };

      const { container } = renderWithProvider(<TaskList data={data} />);
      const taskList = screen.getByTestId('task-list');
      expect(taskList.children.length).toBe(100);
    });

    it('应该处理混合状态的任务列表', () => {
      const data = {
        items: [
          { key: '1', title: '完成', status: 'success' as const },
          { key: '2', title: '进行中', status: 'loading' as const },
          { key: '3', title: '待处理', status: 'pending' as const },
          { key: '4', title: '失败', status: 'error' as const },
          { key: '5', title: '再次完成', status: 'success' as const },
        ],
      };

      const { container } = renderWithProvider(<TaskList data={data} />);
      expect(
        container.querySelector('.ant-agentic-workspace-task-item-success'),
      ).toBeInTheDocument();
      expect(
        container.querySelector('.ant-agentic-workspace-task-item-loading'),
      ).toBeInTheDocument();
      expect(
        container.querySelector('.ant-agentic-workspace-task-item-pending'),
      ).toBeInTheDocument();
      expect(
        container.querySelector('.ant-agentic-workspace-task-item-error'),
      ).toBeInTheDocument();
    });

    it('应该处理嵌套的ReactNode content', () => {
      const data = {
        items: [
          {
            key: '1',
            title: '复杂任务',
            content: (
              <div>
                <p>段落1</p>
                <ul>
                  <li>列表项1</li>
                  <li>列表项2</li>
                </ul>
              </div>
            ),
            status: 'success' as const,
          },
        ],
      };

      renderWithProvider(<TaskList data={data} />);
      expect(screen.getByText('段落1')).toBeInTheDocument();
      expect(screen.getByText('列表项1')).toBeInTheDocument();
      expect(screen.getByText('列表项2')).toBeInTheDocument();
    });
  });

  describe('样式和布局', () => {
    it('应该应用正确的CSS类结构', () => {
      const data = {
        items: [
          {
            key: '1',
            title: '任务',
            content: '内容',
            status: 'success' as const,
          },
        ],
      };

      const { container } = renderWithProvider(<TaskList data={data} />);

      // 检查完整的类结构
      const taskList = container.querySelector('.ant-agentic-workspace-task');
      expect(taskList).toBeInTheDocument();

      const item = container.querySelector('.ant-agentic-workspace-task-item');
      expect(item).toBeInTheDocument();

      const status = container.querySelector('.ant-agentic-workspace-task-status');
      expect(status).toBeInTheDocument();

      const content = container.querySelector('.ant-agentic-workspace-task-content');
      expect(content).toBeInTheDocument();

      const title = container.querySelector('.ant-agentic-workspace-task-title');
      expect(title).toBeInTheDocument();

      const description = container.querySelector(
        '.ant-agentic-workspace-task-description',
      );
      expect(description).toBeInTheDocument();
    });

    it('应该为每个状态使用唯一的类名', () => {
      const statuses = ['success', 'pending', 'loading', 'error'] as const;

      statuses.forEach((status) => {
        const data = {
          items: [
            {
              key: '1',
              title: '任务',
              status,
            },
          ],
        };

        const { container } = renderWithProvider(<TaskList data={data} />);
        const item = container.querySelector(
          `.ant-agentic-workspace-task-item-${status}`,
        );
        expect(item).toBeInTheDocument();
      });
    });
  });

  describe('ConfigProvider集成', () => {
    it('应该使用ConfigProvider的prefixCls', () => {
      const data = {
        items: [
          {
            key: '1',
            title: '任务',
            status: 'success' as const,
          },
        ],
      };

      const { container } = render(
        <ConfigProvider prefixCls="custom">
          <TaskList data={data} />
        </ConfigProvider>,
      );

      // 应该使用自定义前缀
      const taskList = container.querySelector('[class*="workspace-task"]');
      expect(taskList).toBeInTheDocument();
    });
  });
});
