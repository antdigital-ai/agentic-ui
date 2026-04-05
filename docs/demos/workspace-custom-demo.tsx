import { Workspace } from '@ant-design/agentic-ui';
import { Button, Card, Progress, Statistic, Table, Tag } from 'antd';
import React, { useState } from 'react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

// 自定义图表组件
const CustomChart: React.FC = () => {
  const data = [
    { name: 'Q1', value: 400 },
    { name: 'Q2', value: 600 },
    { name: 'Q3', value: 800 },
  ];

  return (
    <Card title="销售趋势图" size="small">
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="value" stroke="#8884d8" />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
};

// 自定义统计面板
const CustomStats: React.FC = () => {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: 16,
      }}
    >
      <Card size="small">
        <Statistic title="总用户数" value={11280} />
      </Card>
      <Card size="small">
        <Statistic title="今日活跃" value={1128} />
      </Card>
      <Card size="small">
        <Statistic title="总收入" value={11280} prefix="¥" />
      </Card>
      <Card size="small">
        <Statistic title="转化率" value={11.28} suffix="%" />
      </Card>
    </div>
  );
};

// 自定义表格组件
const CustomTable: React.FC = () => {
  const [data] = useState([
    {
      key: '1',
      name: '张三',
      age: 32,
      address: '北京',
      status: 'active',
    },
    {
      key: '2',
      name: '李四',
      age: 42,
      address: '上海',
      status: 'inactive',
    },
  ]);

  const columns = [
    { title: '姓名', dataIndex: 'name', key: 'name' },
    { title: '年龄', dataIndex: 'age', key: 'age' },
    { title: '地址', dataIndex: 'address', key: 'address' },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'active' ? 'green' : 'red'}>
          {status === 'active' ? '活跃' : '非活跃'}
        </Tag>
      ),
    },
  ];

  return (
    <Card title="用户列表" size="small">
      <Table
        columns={columns}
        dataSource={data}
        pagination={false}
        size="small"
      />
    </Card>
  );
};

// 自定义控制面板
const CustomControlPanel: React.FC = () => {
  const [progress, setProgress] = useState(0);

  const handleStart = () => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 500);
  };

  const handleReset = () => {
    setProgress(0);
  };

  return (
    <Card title="控制面板" size="small">
      <div style={{ marginBottom: 16 }}>
        <Progress
          percent={progress}
          status={progress === 100 ? 'success' : 'active'}
        />
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <Button
          type="primary"
          onClick={handleStart}
          disabled={progress > 0 && progress < 100}
        >
          开始
        </Button>
        <Button onClick={handleReset}>重置</Button>
      </div>
    </Card>
  );
};

const WorkspaceCustomDemo: React.FC = () => {
  return (
    <div style={{ height: 600, width: '100%' }}>
      <Workspace title="自定义内容工作空间">
        <Workspace.Custom tab={{ key: 'chart', title: '图表展示' }}>
          <CustomChart />
        </Workspace.Custom>

        <Workspace.Custom tab={{ key: 'stats', title: '数据统计' }}>
          <CustomStats />
        </Workspace.Custom>

        <Workspace.Custom tab={{ key: 'table', title: '数据表格' }}>
          <CustomTable />
        </Workspace.Custom>

        <Workspace.Custom tab={{ key: 'control', title: '控制面板' }}>
          <CustomControlPanel />
        </Workspace.Custom>
      </Workspace>
    </div>
  );
};

export default WorkspaceCustomDemo;
