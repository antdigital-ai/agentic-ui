import { Quote } from '@ant-design/agentic-ui';
import { ConfigProvider, message } from 'antd';
import React from 'react';

export default function QuoteDemo() {
  const handleFileClick = (fileName: string, lineRange?: string) => {
    console.log('点击文件:', fileName, lineRange ? `行号: ${lineRange}` : '');
    message.success(
      `打开文件: ${fileName}${lineRange ? ` (${lineRange})` : ''}`,
    );
  };

  const handleClose = () => {
    message.success('引用已关闭');
  };

  return (
    <ConfigProvider prefixCls="ant">
      <div
        style={{
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
        }}
      >
        <h2>Quote 组件演示</h2>

        <div>
          <h3>基础用法</h3>
          <Quote
            fileName="src/hooks/useAuth.ts"
            lineRange="18-32"
            quoteDescription="用户认证状态管理 Hook，处理 Token 刷新和登录态维护"
            popupDetail={`export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      validateToken(token)
        .then(setUser)
        .catch(() => localStorage.removeItem('auth_token'))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  return { user, loading, isAuthenticated: !!user };
};`}
            onFileClick={handleFileClick}
          />
        </div>

        <div>
          <h3>可关闭的引用</h3>
          <Quote
            fileName="src/components/DataTable.tsx"
            lineRange="56-78"
            quoteDescription="数据表格组件的分页和排序逻辑"
            closable={true}
            onClose={handleClose}
            onFileClick={handleFileClick}
          />
        </div>

        <div>
          <h3>不传文件名</h3>
          <Quote
            quoteDescription="项目采用微前端架构，主应用负责路由调度和公共状态管理"
            popupDetail={`架构设计说明：

1. 主应用（Shell）：基于 qiankun 框架，负责子应用的生命周期管理
2. 子应用通过 props 和 globalState 与主应用通信
3. 公共依赖通过 externals 方式共享，避免重复打包
4. 每个子应用独立部署，支持灰度发布`}
          />
        </div>

        <div>
          <h3>纯内容引用</h3>
          <Quote
            fileName="docs/deployment-guide.md"
            quoteDescription="生产环境部署流程和注意事项"
            onFileClick={handleFileClick}
          />
        </div>

        <div>
          <h3>长文件名测试</h3>
          <Quote
            fileName="src/modules/analytics/components/RealtimeDashboard/charts/MultiAxisTimeSeriesChart.tsx"
            lineRange="120-185"
            quoteDescription="实时数据大盘的多轴时序图组件，包含数据聚合和自动刷新逻辑"
            popupDetail={`interface MultiAxisChartConfig {
  axes: AxisConfig[];
  refreshInterval: number;
  aggregation: 'sum' | 'avg' | 'max' | 'min';
  timeRange: TimeRange;
  dataSource: DataSourceConfig;
}`}
            onFileClick={handleFileClick}
          />
        </div>

        <div>
          <h3>弹出方向示例</h3>
          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '300px' }}>
              <h4>左侧弹出（默认）</h4>
              <Quote
                fileName="src/utils/format.ts"
                lineRange="1-15"
                quoteDescription="日期和数字格式化工具函数"
                popupDirection="left"
                popupDetail={`export const formatCurrency = (amount: number, currency = 'CNY') => {
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
};

export const formatDate = (date: Date, pattern = 'YYYY-MM-DD') => {
  return dayjs(date).format(pattern);
};`}
                onFileClick={handleFileClick}
              />
            </div>
            <div style={{ flex: 1, minWidth: '300px' }}>
              <h4>右侧弹出</h4>
              <Quote
                fileName="src/utils/validator.ts"
                lineRange="1-18"
                quoteDescription="表单校验规则和自定义校验器"
                popupDirection="right"
                popupDetail={`export const validators = {
  email: (value: string) =>
    /^[\\w.-]+@[\\w.-]+\\.\\w+$/.test(value) || '请输入有效的邮箱地址',
  phone: (value: string) =>
    /^1[3-9]\\d{9}$/.test(value) || '请输入有效的手机号码',
  password: (value: string) =>
    value.length >= 8 || '密码长度不能少于 8 位',
  required: (value: string) =>
    !!value?.trim() || '此字段为必填项',
};`}
                onFileClick={handleFileClick}
              />
            </div>
          </div>
        </div>
      </div>
    </ConfigProvider>
  );
}
