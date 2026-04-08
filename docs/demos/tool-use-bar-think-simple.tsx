import { ToolUseBarThink } from '@ant-design/agentic-ui';
import React, { useState } from 'react';

const thinkContent = `让我分析一下这个电商后台系统的数据库设计方案。

首先看核心实体关系：
1. 用户表（users）和订单表（orders）是一对多关系，一个用户可以有多个订单
2. 订单表和订单详情表（order_items）也是一对多关系
3. 商品表（products）和分类表（categories）是多对一关系

关于索引优化：
- orders 表的 user_id 和 created_at 字段需要建立复合索引，因为查询经常按用户和时间范围筛选
- products 表的 category_id 和 status 字段也需要索引
- 考虑到热点查询，建议对 order_items 的 order_id 建立覆盖索引

分表策略建议：
- 订单量达到千万级后，按月份进行水平分表
- 使用 ShardingSphere 作为分库分表中间件
- 归档超过 6 个月的历史订单到冷存储`;

const SimpleThinkDemo = () => {
  const [expanded, setExpanded] = useState(false);
  const [floatingExpanded, setFloatingExpanded] = useState(false);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        padding: '20px',
      }}
    >
      <h3>ToolUseBarThink 基础用法</h3>

      {/* Loading 状态 */}
      <div>
        <h4>Loading 状态（hover 显示浮动按钮）</h4>
        <ToolUseBarThink
          toolName="深度思考"
          toolTarget="分析数据库设计方案"
          time="3.5s"
          status="loading"
          expanded={expanded}
          onExpandedChange={setExpanded}
          floatingExpanded={floatingExpanded}
          onFloatingExpandedChange={setFloatingExpanded}
          thinkContent={thinkContent}
        />
      </div>

      {/* Success 状态 */}
      <div>
        <h4>Success 状态</h4>
        <ToolUseBarThink
          toolName="已完成思考"
          toolTarget="数据库优化方案"
          time="5.2s"
          status="success"
          thinkContent={thinkContent}
        />
      </div>

      {/* Error 状态 */}
      <div>
        <h4>Error 状态</h4>
        <ToolUseBarThink
          toolName="思考中断"
          toolTarget="性能压测分析"
          time="12.0s"
          status="error"
          thinkContent={thinkContent}
        />
      </div>
    </div>
  );
};

export default SimpleThinkDemo;
