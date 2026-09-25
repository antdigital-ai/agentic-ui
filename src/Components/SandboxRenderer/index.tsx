import { ConfigProvider } from 'antd';
import classNames from 'clsx';
import React, {
  memo,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  createSandbox,
  DEFAULT_SANDBOX_CONFIG,
} from '../../Utils/proxySandbox';
import { useSandboxRendererStyle } from './style';
import type { SandboxRendererProps, SandboxRendererStatus } from './types';

const DEFAULT_HEIGHT = 320;
const DEFAULT_TIMEOUT = 3000;

/**
 * SandboxRenderer —— 安全渲染 coding agent 生成的 JavaScript 代码
 *
 * 代码在 ProxySandbox 中执行：
 * - `document.createElement` 等创建真实节点，查询被限定在渲染容器（Shadow DOM）内
 * - `shadowRoot` 指向渲染容器，脚本通过它挂载内容
 * - 超时 / 全局对象白名单 / 危险 API 拦截等安全能力继承自 ProxySandbox
 *
 * @component
 */
const SandboxRendererComponent: React.FC<SandboxRendererProps> = ({
  code,
  className,
  style,
  globals,
  timeout = DEFAULT_TIMEOUT,
  height = DEFAULT_HEIGHT,
  showStatus = true,
  onExecute,
  onError,
}) => {
  const { getPrefixCls } = useContext(ConfigProvider.ConfigContext);
  const prefixCls = getPrefixCls('sandbox-renderer');
  const { hashId } = useSandboxRendererStyle(prefixCls);

  const hostRef = useRef<HTMLDivElement>(null);
  const shadowRootRef = useRef<ShadowRoot | null>(null);
  const latestCallbacks = useRef({ onExecute, onError });
  latestCallbacks.current = { onExecute, onError };

  const [status, setStatus] = useState<SandboxRendererStatus>('idle');
  const [errorText, setErrorText] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const execute = async () => {
      const host = hostRef.current;
      if (!host || !code) return;

      // 复用同一 Shadow DOM，重跑前清空内容
      if (!shadowRootRef.current) {
        shadowRootRef.current = host.attachShadow({ mode: 'open' });
      }
      const shadowRoot = shadowRootRef.current;
      shadowRoot.innerHTML = '';

      setStatus('running');
      setErrorText(null);

      const sandbox = createSandbox({
        ...DEFAULT_SANDBOX_CONFIG,
        allowDOM: true,
        timeout,
        renderRoot: shadowRoot,
        customGlobals: globals,
      });

      try {
        const result = await sandbox.execute(code);
        if (cancelled) return;
        if (!result.success) {
          throw result.error || new Error('Sandbox execution failed');
        }
        setStatus('success');
        latestCallbacks.current.onExecute?.(result.result);
      } catch (error) {
        if (cancelled) return;
        const err = error instanceof Error ? error : new Error(String(error));
        setStatus('error');
        setErrorText(err.message);
        latestCallbacks.current.onError?.(err);
      } finally {
        sandbox.destroy();
      }
    };

    execute();
    return () => {
      cancelled = true;
    };
  }, [code, globals, timeout]);

  return (
    <div
      className={classNames(prefixCls, hashId, className)}
      style={{ ...style, height }}
      data-testid={prefixCls}
    >
      <div ref={hostRef} className={`${prefixCls}-host`} />
      {showStatus && status === 'running' && (
        <div className={`${prefixCls}-status`}>执行中…</div>
      )}
      {showStatus && status === 'error' && (
        <div className={`${prefixCls}-status`}>
          <span className={`${prefixCls}-error`}>{errorText}</span>
        </div>
      )}
    </div>
  );
};

SandboxRendererComponent.displayName = 'SandboxRenderer';

export const SandboxRenderer = memo(SandboxRendererComponent);
export type { SandboxRendererProps, SandboxRendererStatus } from './types';
