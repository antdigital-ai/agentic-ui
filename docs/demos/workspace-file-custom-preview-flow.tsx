import { Workspace, type FileActionRef } from '@ant-design/agentic-ui';
import type {
  FileNode,
  GroupNode,
} from '@ant-design/agentic-ui/Workspace/types';
import {
  ArrowLeftOutlined,
  CopyOutlined,
  EditOutlined,
  ShareAltOutlined,
  StarOutlined,
} from '@ant-design/icons';
import { Button, message, Space, Tooltip } from 'antd';
import React, {
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';

// 支持"列表 -> 查看详情 -> 返回列表"的自定义预览组件（独立示例）
type VariableAnalysisPreviewRef = {
  getMode: () => 'list' | 'detail';
  toList: () => void;
};

const VariableAnalysisPreview = React.forwardRef<
  VariableAnalysisPreviewRef,
  {
    file: FileNode;
    setPreviewHeader?: (h: React.ReactNode) => void;
    back?: () => void;
    download?: () => void;
    fileActionRef?: React.MutableRefObject<FileActionRef | null>;
  }
>(({ file, setPreviewHeader, fileActionRef }, ref) => {
  const [mode, setMode] = useState<'list' | 'detail'>('list');
  const [current, setCurrent] = useState<{
    id: string;
    name: string;
    type: string;
    binMethod: string;
    binCount: number;
    iv: string | number;
    ks: string | number;
  } | null>(null);

  // 当模式切换回 list 时，清理详情态数据与头部
  useEffect(() => {
    if (mode === 'list') {
      setCurrent(null);
      setPreviewHeader?.(undefined);
      // 还原标题区域为原始文件信息
      fileActionRef?.current?.updatePreviewHeader?.({
        name: file.name,
        lastModified: file.lastModified,
        icon: file.icon,
      });
    }
  }, [mode, setPreviewHeader, fileActionRef, file]);

  useImperativeHandle(
    ref,
    () => ({
      getMode: () => mode,
      toList: () => {
        setMode('list');
        setCurrent(null);
        setPreviewHeader?.(undefined);
      },
    }),
    [mode, setPreviewHeader],
  );

  const rows = useMemo(
    () => [
      {
        id: '1',
        name: '变量1',
        type: 'double',
        binMethod: '等频',
        binCount: 11,
        iv: 0.075298,
        ks: 0.075298,
      },
      {
        id: '2',
        name: '变量2',
        type: 'double',
        binMethod: '等频',
        binCount: 1,
        iv: 0.075298,
        ks: 0.075298,
      },
    ],
    [],
  );

  const handleViewDetail = (row: (typeof rows)[number]) => {
    setCurrent(row);
    setMode('detail');
    // 进入详情态：通过 actionRef.updatePreviewHeader 更新预览标题区域
    fileActionRef?.current?.updatePreviewHeader?.({
      name: `变量详情 - ${row.name}`,
      lastModified: new Date().toLocaleString(),
    });
  };

  const handleBack = () => {
    setMode('list');
    setCurrent(null);
    setPreviewHeader?.(undefined);
    fileActionRef?.current?.updatePreviewHeader?.({
      name: file.name,
      lastModified: file.lastModified,
      icon: file.icon,
    });
  };

  if (mode === 'detail' && current) {
    return (
      <div style={{ padding: 16 }} aria-label="变量详情">
        <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
          <div style={{ flex: 1, display: 'flex', gap: 4 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <ArrowLeftOutlined onClick={handleBack} />
              返回上一级
            </span>
            <div style={{ fontWeight: 600 }}>【{current.name}】详情</div>
          </div>
        </div>
        <h3 style={{ margin: '8px 0' }}>变量详情 - {current.name}</h3>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '120px 1fr',
            rowGap: 8,
          }}
        >
          <div>名称</div>
          <div>{current.name}</div>
          <div>类型</div>
          <div>{current.type}</div>
          <div>分箱方式</div>
          <div>{current.binMethod}</div>
          <div>分箱数</div>
          <div>{current.binCount}</div>
          <div>IV</div>
          <div>{current.iv}</div>
          <div>KS</div>
          <div>{current.ks}</div>
          <div>文件名</div>
          <div>{file.name}</div>
          <div>文件ID</div>
          <div>{file.id || '未指定'}</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: 16 }} aria-label="变量分析列表">
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th
              style={{
                textAlign: 'left',
                padding: '8px 6px',
                borderBottom: '1px solid #eee',
              }}
            >
              名称
            </th>
            <th
              style={{
                textAlign: 'left',
                padding: '8px 6px',
                borderBottom: '1px solid #eee',
              }}
            >
              类型
            </th>
            <th
              style={{
                textAlign: 'left',
                padding: '8px 6px',
                borderBottom: '1px solid #eee',
              }}
            >
              分箱方式
            </th>
            <th
              style={{
                textAlign: 'left',
                padding: '8px 6px',
                borderBottom: '1px solid #eee',
              }}
            >
              分箱数
            </th>
            <th
              style={{
                textAlign: 'left',
                padding: '8px 6px',
                borderBottom: '1px solid #eee',
              }}
            >
              IV
            </th>
            <th
              style={{
                textAlign: 'left',
                padding: '8px 6px',
                borderBottom: '1px solid #eee',
              }}
            >
              KS
            </th>
            <th
              style={{
                textAlign: 'left',
                padding: '8px 6px',
                borderBottom: '1px solid #eee',
              }}
            >
              操作
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              <td
                style={{
                  padding: '8px 6px',
                  borderBottom: '1px solid #f5f5f5',
                }}
              >
                {row.name}
              </td>
              <td
                style={{
                  padding: '8px 6px',
                  borderBottom: '1px solid #f5f5f5',
                }}
              >
                {row.type}
              </td>
              <td
                style={{
                  padding: '8px 6px',
                  borderBottom: '1px solid #f5f5f5',
                }}
              >
                {row.binMethod}
              </td>
              <td
                style={{
                  padding: '8px 6px',
                  borderBottom: '1px solid #f5f5f5',
                }}
              >
                {row.binCount}
              </td>
              <td
                style={{
                  padding: '8px 6px',
                  borderBottom: '1px solid #f5f5f5',
                }}
              >
                {row.iv}
              </td>
              <td
                style={{
                  padding: '8px 6px',
                  borderBottom: '1px solid #f5f5f5',
                }}
              >
                {row.ks}
              </td>
              <td
                style={{
                  padding: '8px 6px',
                  borderBottom: '1px solid #f5f5f5',
                }}
              >
                <a
                  role="button"
                  tabIndex={0}
                  aria-label={`查看${row.name}详情`}
                  onClick={() => handleViewDetail(row)}
                  onKeyDown={(e) => e.key === 'Enter' && handleViewDetail(row)}
                  style={{ color: '#1677ff', cursor: 'pointer' }}
                >
                  查看详情
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
});

const WorkspaceFileCustomPreviewFlow: React.FC = () => {
  const [nodes] = useState<(FileNode | GroupNode)[]>([
    {
      name: '自定义预览',
      type: 'word',
      collapsed: false,
      children: [
        {
          id: 'customPreviewListDemo',
          name: '变量分析结果.docx',
          size: '2.3MB',
          lastModified: '08-20 12:30',
          canPreview: true,
        },
        {
          id: 'customPreviewDomID1',
          name: '变量分析说明.html',
          size: '12KB',
          lastModified: '08-20 13:10',
          canPreview: true,
        },
      ],
    },
  ]);

  const [actionsNodes] = useState<(FileNode | GroupNode)[]>([
    {
      name: '自定义操作区域',
      type: 'pdf',
      collapsed: false,
      children: [
        {
          id: 'customActionsDemo1',
          name: '数据报告.pdf',
          size: '5.8MB',
          lastModified: '08-20 14:20',
          canPreview: true,
        },
        {
          id: 'customActionsDemo2',
          name: '分析结果.xlsx',
          size: '1.2MB',
          lastModified: '08-20 15:30',
          canPreview: true,
        },
      ],
    },
  ]);
  const previewRef = useRef<VariableAnalysisPreviewRef | null>(null);
  const fileActionRef = useRef<FileActionRef | null>(null);

  const handlePreview = async (
    file: FileNode,
  ): Promise<FileNode | React.ReactNode> => {
    // 场景一：后端返回 JSON 列表数据 → 自定义展示
    if (file.id === 'customPreviewListDemo') {
      return (
        <VariableAnalysisPreview
          ref={previewRef}
          file={file}
          fileActionRef={fileActionRef}
        />
      );
    }

    // 场景二：后端返回 HTML 片段或需要自定义展示 → 直接返回 ReactNode，仅替换内容区
    if (file.id === 'customPreviewDomID1') {
      return (
        <div style={{ padding: 16 }} aria-label="HTML 片段预览">
          <h3 style={{ margin: '8px 0' }}>变量分析说明</h3>
          <p style={{ color: '#555', lineHeight: '20px' }}>
            以下为服务端返回的片段内容（以 ReactNode
            形式直接渲染，仅替换内容区，不改动头部与工具栏）。
          </p>
          <ul style={{ paddingLeft: 18, margin: '12px 0' }}>
            <li>支持列表、标题、段落等基础排版</li>
            <li>可在内部放置代码片段、提示信息等</li>
          </ul>
          <pre
            aria-label="代码示例"
            style={{
              background: '#f6f8fa',
              padding: 12,
              borderRadius: 6,
              overflowX: 'auto',
              border: '1px solid #eee',
            }}
          >
            {`const sum = (a: number, b: number) => a + b;
console.log(sum(1, 2));`}
          </pre>
          <blockquote
            style={{
              borderLeft: '3px solid #ddd',
              paddingLeft: 10,
              color: '#666',
            }}
          >
            该区域完全由业务自定义渲染逻辑控制。
          </blockquote>
        </div>
      );
    }

    return undefined;
  };

  // 第二个 Workspace.File 的预览处理函数，展示 customActions 功能
  const handlePreviewWithActions = async (
    file: FileNode,
  ): Promise<FileNode | React.ReactNode> => {
    if (file.id === 'customActionsDemo1') {
      return (
        <div style={{ padding: 16 }} aria-label="PDF 报告预览">
          <h3 style={{ margin: '8px 0' }}>数据报告预览</h3>
          <p style={{ color: '#555', lineHeight: '20px' }}>
            这是一个展示 customActions
            功能的示例。右侧操作区域包含了自定义的操作按钮。
          </p>
          <div
            style={{
              background: '#f6f8fa',
              padding: 16,
              borderRadius: 8,
              margin: '16px 0',
              border: '1px solid #eee',
            }}
          >
            <h4>报告摘要</h4>
            <ul style={{ paddingLeft: 18, margin: '8px 0' }}>
              <li>数据处理完成率：98.5%</li>
              <li>异常数据占比：1.2%</li>
              <li>模型准确率：94.3%</li>
              <li>处理时间：2小时15分钟</li>
            </ul>
          </div>
          <blockquote
            style={{
              borderLeft: '3px solid #1677ff',
              paddingLeft: 10,
              color: '#666',
              background: '#f0f7ff',
              padding: '8px 12px',
              borderRadius: '0 4px 4px 0',
            }}
          >
            💡 提示：点击右侧的自定义操作按钮体验不同功能
          </blockquote>
        </div>
      );
    }

    if (file.id === 'customActionsDemo2') {
      return (
        <div style={{ padding: 16 }} aria-label="Excel 分析结果预览">
          <h3 style={{ margin: '8px 0' }}>分析结果预览</h3>
          <table
            style={{ width: '100%', borderCollapse: 'collapse', marginTop: 16 }}
          >
            <thead>
              <tr style={{ background: '#fafafa' }}>
                <th
                  style={{
                    padding: '8px 12px',
                    border: '1px solid #eee',
                    textAlign: 'left',
                  }}
                >
                  指标
                </th>
                <th
                  style={{
                    padding: '8px 12px',
                    border: '1px solid #eee',
                    textAlign: 'left',
                  }}
                >
                  数值
                </th>
                <th
                  style={{
                    padding: '8px 12px',
                    border: '1px solid #eee',
                    textAlign: 'left',
                  }}
                >
                  状态
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ padding: '8px 12px', border: '1px solid #eee' }}>
                  总样本数
                </td>
                <td style={{ padding: '8px 12px', border: '1px solid #eee' }}>
                  10,000
                </td>
                <td style={{ padding: '8px 12px', border: '1px solid #eee' }}>
                  ✅ 正常
                </td>
              </tr>
              <tr>
                <td style={{ padding: '8px 12px', border: '1px solid #eee' }}>
                  有效样本
                </td>
                <td style={{ padding: '8px 12px', border: '1px solid #eee' }}>
                  9,850
                </td>
                <td style={{ padding: '8px 12px', border: '1px solid #eee' }}>
                  ✅ 正常
                </td>
              </tr>
              <tr>
                <td style={{ padding: '8px 12px', border: '1px solid #eee' }}>
                  异常样本
                </td>
                <td style={{ padding: '8px 12px', border: '1px solid #eee' }}>
                  150
                </td>
                <td style={{ padding: '8px 12px', border: '1px solid #eee' }}>
                  ⚠️ 需关注
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      );
    }

    return undefined;
  };

  const handleDownload = (file: FileNode) => {
    message.info(`下载文件：${file.name}`);
  };

  const handleGroupDownload = (files: FileNode[]) => {
    message.info(`分组下载：${files.map((f) => f.name).join(', ')}`);
  };

  // 自定义操作按钮的处理函数
  const handleEdit = (file: FileNode) => {
    message.success(`编辑文件：${file.name}`);
  };

  const handleCopy = (file: FileNode) => {
    message.success(`复制文件：${file.name}`);
  };

  const handleStar = (file: FileNode) => {
    message.success(`收藏文件：${file.name}`);
  };

  const handleShare = (file: FileNode) => {
    message.success(`分享文件：${file.name}`);
  };

  // 根据文件类型返回不同的自定义操作按钮
  const getCustomActions = (file: FileNode) => {
    if (file.id === 'customActionsDemo1') {
      // PDF 文件的自定义操作
      return (
        <Space size="small">
          <Tooltip title="编辑报告">
            <Button
              size="small"
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEdit(file)}
            />
          </Tooltip>
          <Tooltip title="复制链接">
            <Button
              size="small"
              type="text"
              icon={<CopyOutlined />}
              onClick={() => handleCopy(file)}
            />
          </Tooltip>
          <Tooltip title="收藏">
            <Button
              size="small"
              type="text"
              icon={<StarOutlined />}
              onClick={() => handleStar(file)}
            />
          </Tooltip>
        </Space>
      );
    }

    if (file.id === 'customActionsDemo2') {
      // Excel 文件的自定义操作
      return (
        <Space size="small">
          <Tooltip title="在线编辑">
            <Button
              size="small"
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEdit(file)}
            >
              编辑
            </Button>
          </Tooltip>
          <Tooltip title="分享给同事">
            <Button
              size="small"
              type="text"
              icon={<ShareAltOutlined />}
              onClick={() => handleShare(file)}
            >
              分享
            </Button>
          </Tooltip>
        </Space>
      );
    }

    return null;
  };

  // 自定义返回示例：返回前先执行自定义逻辑，然后继续默认返回
  const handleBackFromPreview = async (file: FileNode) => {
    // 处于详情态：切回列表态并阻止默认返回（留在预览页）
    if (previewRef.current?.getMode() === 'detail') {
      previewRef.current.toList();
      message.info(`自定义返回：${file.name}`);
      return false;
    }
    // 列表态：允许执行默认返回（退出预览页，回到文件列表）
    return true;
  };

  return (
    <div style={{ padding: '12px' }}>
      <div
        style={{
          maxWidth: '600px',
        }}
      >
        <Workspace title="文件管理 - 自定义预览流程">
          <Workspace.File
            tab={{
              key: 'cusFilesPreview',
              title: '自定义预览',
              count: nodes.length,
            }}
            nodes={nodes}
            onDownload={handleDownload}
            onGroupDownload={handleGroupDownload}
            onPreview={handlePreview}
            onBack={handleBackFromPreview}
            actionRef={fileActionRef}
          />
          <Workspace.File
            tab={{
              key: 'cusFilePreviewActions',
              title: '自定义操作区域',
              count: actionsNodes.length,
            }}
            nodes={actionsNodes}
            onDownload={handleDownload}
            onGroupDownload={handleGroupDownload}
            onPreview={handlePreviewWithActions}
            customActions={getCustomActions}
          />
        </Workspace>
      </div>
    </div>
  );
};

export default WorkspaceFileCustomPreviewFlow;
