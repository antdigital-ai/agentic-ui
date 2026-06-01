/**
 * AgentRunBar 组件测试用的 testid 常量
 *
 * 与 prefixCls 解耦：即便日后 ConfigProvider 自定义了 prefix，
 * 测试代码仍可通过 `getByTestId(AGENT_RUN_BAR_TEST_ID)` 稳定定位。
 */
export const AGENT_RUN_BAR_TEST_ID = 'agent-run-bar';
