import {
  act,
  fireEvent,
  render,
  renderHook,
  waitFor,
} from '@testing-library/react';
import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { MarkdownInputField } from '../MarkdownInputField';
import { useComposerDraft } from '../hooks/useComposerDraft';
import type { MarkdownInputFieldProps } from '../types/MarkdownInputFieldProps';

// BorderBeamAnimation 依赖 ResizeObserver，测试环境统一 mock 掉（对齐 ideAlignment 测试）
vi.mock('../BorderBeamAnimation', () => ({
  BorderBeamAnimation: () => null,
}));

// jsdom 无 IntersectionObserver / ResizeObserver 时部分子组件降级，统一 mock
class MockObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
(globalThis as any).ResizeObserver =
  (globalThis as any).ResizeObserver ?? MockObserver;
(globalThis as any).IntersectionObserver =
  (globalThis as any).IntersectionObserver ?? MockObserver;

/**
 * 受控包装：外部 state 驱动输入内容，
 * 让「输入 → 发送 / 草稿」链路走真实组件逻辑（对齐 ideAlignment 测试模式）。
 */
const ControlledField: React.FC<
  Partial<MarkdownInputFieldProps> & { value?: string }
> = ({ value = '', ...rest }) => {
  const [text, setText] = React.useState(value);
  return <MarkdownInputField value={text} onChange={setText} {...rest} />;
};

const getRoot = (container: HTMLElement) =>
  container.querySelector<HTMLElement>('[data-testid="markdown-input-field"]')!;

const renderField = (props: Partial<MarkdownInputFieldProps> = {}) =>
  render(<MarkdownInputField {...props} />);

describe('MarkdownInputField 分支选择（branch）', () => {
  it('未传 branch 时不渲染触发器', () => {
    const { queryByTestId } = renderField();
    expect(queryByTestId('composer-branch-trigger')).toBeNull();
  });

  it('传入 branchName 渲染触发器', () => {
    const { getByTestId } = renderField({
      branch: { branchName: 'main' },
    });
    expect(getByTestId('composer-branch-trigger')).toBeTruthy();
    expect(getByTestId('composer-branch-trigger').textContent).toContain(
      'main',
    );
  });

  it('disabled 时 data-branch-mode 为 view（仅展示）', () => {
    const { getByTestId } = renderField({
      branch: {
        branchName: 'main',
        branches: [
          {
            name: 'main',
            displayName: 'main',
            isRemote: false,
            isCurrent: true,
          },
        ],
        disabled: true,
      },
    });
    expect(getByTestId('composer-branch-trigger').dataset.branchMode).toBe(
      'view',
    );
  });

  it('switching 时按钮禁用', () => {
    const { getByTestId } = renderField({
      branch: { branchName: 'feat/x', switching: true },
    });
    expect(
      (getByTestId('composer-branch-trigger') as HTMLButtonElement).disabled,
    ).toBe(true);
  });
});

describe('MarkdownInputField 上下文用量（contextUsage）', () => {
  it('usedTokens <= 0 不渲染指示器', () => {
    const { queryByTestId } = renderField({
      contextUsage: { usedTokens: 0, contextWindow: 128000 },
    });
    expect(queryByTestId('context-usage-indicator')).toBeNull();
  });

  it('正常用量渲染指示器并可点击', () => {
    const onClick = vi.fn();
    const { getByTestId } = renderField({
      contextUsage: { usedTokens: 42000, contextWindow: 128000, onClick },
    });
    const indicator = getByTestId('context-usage-indicator');
    expect(indicator).toBeTruthy();
    fireEvent.click(indicator);
    expect(onClick).toHaveBeenCalledWith(
      expect.objectContaining({ usedTokens: 42000, percent: 33 }),
    );
  });
});

describe('MarkdownInputField 草稿恢复（draft）', () => {
  afterEach(() => {
    localStorage.clear();
  });

  it('draftKey 变化时恢复 storage 中的草稿到空编辑器（非受控）', async () => {
    localStorage.setItem(
      'agentic-ui-composer-draft:session-restore',
      '上次的草稿内容',
    );
    // 恢复语义要求宿主非受控（外部 value 会覆盖恢复内容）
    renderField({ draft: { draftKey: 'session-restore' } });

    await waitFor(
      () => {
        const editor = document.querySelector('[data-slate-editor]');
        expect(editor?.textContent).toContain('上次的草稿内容');
      },
      { timeout: 3000 },
    );
  });

  it('编辑器内容变化后 idle 自动提交草稿（reason: idle）', async () => {
    // hook 级验证：直接驱动 notifyInput（等价于编辑器 onChange 触发）
    const onDraftCommit = vi.fn();
    const mdRef = {
      current: {
        store: {
          getMDContent: () => 'idle 草稿',
          setMDContent: vi.fn(),
        },
      },
    } as any;
    const { result } = renderHook(() =>
      useComposerDraft({
        draftKey: 's-idle',
        idleDelay: 30,
        onDraftCommit,
        markdownEditorRef: mdRef,
      }),
    );
    act(() => {
      result.current.notifyInput();
    });
    await waitFor(() => {
      expect(onDraftCommit).toHaveBeenCalledWith('idle 草稿', 'idle');
    });
  });

  it('宿主 onDraftCommit 返回 false 时不写 localStorage', async () => {
    const { container } = render(
      <ControlledField
        draft={{
          draftKey: 's-host',
          idleDelay: 50,
          onDraftCommit: () => false,
        }}
        value="owned"
      />,
    );
    await waitFor(
      () => {
        const editor = container.querySelector('[data-slate-editor]');
        expect(editor?.textContent).toContain('owned');
      },
      { timeout: 3000 },
    );
    await new Promise((r) => setTimeout(r, 200));
    // 宿主接管持久化，storage 不应有内容
    expect(
      localStorage.getItem('agentic-ui-composer-draft:s-host'),
    ).toBeFalsy();
  });
});

describe('MarkdownInputField 发送前 gate（composerChips.onSlashChipGate）', () => {
  it('未启用 composerChips 时 gate 不生效', async () => {
    const onSend = vi.fn().mockResolvedValue(undefined);
    const { container } = render(
      <ControlledField onSend={onSend} value="普通内容" />,
    );
    const root = getRoot(container);
    fireEvent.keyDown(root, { key: 'Enter' });
    await waitFor(() => {
      expect(onSend).toHaveBeenCalled();
    });
  });

  it('编辑器内无 chip 时 gate 放行', async () => {
    const onSlashChipGate = vi.fn();
    const onSend = vi.fn().mockResolvedValue(undefined);
    const { container } = render(
      <ControlledField
        onSend={onSend}
        composerChips={{ enable: true, onSlashChipGate }}
        value="plain text"
      />,
    );
    const root = getRoot(container);
    fireEvent.keyDown(root, { key: 'Enter' });
    await waitFor(() => {
      expect(onSend).toHaveBeenCalled();
    });
    expect(onSlashChipGate).not.toHaveBeenCalled();
  });
});
