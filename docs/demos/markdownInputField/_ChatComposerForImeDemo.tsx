import {
  MarkdownInputField,
  useRefFunction,
  type AttachmentFile,
  type MarkdownEditorInstance,
} from '@ant-design/agentic-ui';
import {
  PaperClipOutlined,
  ThunderboltOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { List, Tooltip, Typography } from 'antd';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { mockUpload } from './_constants';
import { logCaughtError } from './_logCaughtError';

const { Text } = Typography;

const DRAFT_STORAGE_KEY = 'agentic-ui-ime-compose-enter-draft';

export interface DemoMentionItem {
  label: string;
  description?: string;
}

export interface DemoQuickExecuteItem {
  label: string;
  category: 'skill' | 'system';
  description?: string;
}

export interface ChatComposerForImeDemoProps {
  triggerSendKey?: 'Enter' | 'Mod+Enter';
  onSent?: (text: string, files?: AttachmentFile[]) => void;
  placeholder?: string;
  style?: React.CSSProperties;
}

type ComposerInputStore = {
  getMDContent?: () => string;
  setMDContent: (md: string) => void;
  clearContent?: () => void;
  focus?: () => void;
};

const DEFAULT_QUICK_ITEMS: DemoQuickExecuteItem[] = [
  { label: 'reset', category: 'system', description: '重置会话（演示用）' },
  { label: 'compact', category: 'system', description: '压缩上下文（演示用）' },
  { label: 'summarize', category: 'skill', description: '总结当前对话' },
];

const DEFAULT_MENTION_ITEMS: DemoMentionItem[] = [
  { label: '客服助理', description: '解答产品问题' },
  { label: '代码助手', description: '编写与审查代码' },
  { label: '数据分析', description: '表格与图表解读' },
];

const panelStyle: React.CSSProperties = {
  background: 'var(--color-gray-bg-card-white, #fff)',
  border: '1px solid var(--color-gray-border-light, #e8e8e8)',
  borderRadius: 8,
  boxShadow: '0 6px 16px rgba(0,0,0,0.08)',
  left: 0,
  maxHeight: 220,
  overflow: 'auto',
  position: 'absolute',
  right: 0,
  top: '100%',
  zIndex: 20,
};

const iconBtnStyle: React.CSSProperties = {
  alignItems: 'center',
  borderRadius: 6,
  cursor: 'pointer',
  display: 'inline-flex',
  height: 28,
  justifyContent: 'center',
  width: 28,
};

function buildSkillSlashMarkMarkdown(commandBody: string): string {
  const body = commandBody.trim();
  if (!body) return '';
  return `<mark>/${body}</mark> \u00a0`;
}

function replaceTrailingSlashSegment(
  current: string,
  replacement: string,
): string {
  const lastSlash = current.lastIndexOf('/');
  if (lastSlash < 0) return replacement;
  return current.slice(0, lastSlash) + replacement;
}

function applyComposerMarkdown(store: ComposerInputStore, markdown: string) {
  store.setMDContent(markdown);
  requestAnimationFrame(() => {
    store.focus?.();
  });
}

function applySkillSlashToComposer(
  store: ComposerInputStore,
  commandBody: string,
) {
  const current = store.getMDContent?.() ?? '';
  applyComposerMarkdown(
    store,
    replaceTrailingSlashSegment(
      current,
      buildSkillSlashMarkMarkdown(commandBody),
    ),
  );
}

function detectActiveTriggerQuery(
  text: string,
  char: '@' | '/',
): string | null {
  const lastIndex = text.lastIndexOf(char);
  if (lastIndex < 0) return null;
  const before = lastIndex > 0 ? text[lastIndex - 1] : '';
  const after = text.slice(lastIndex + 1);
  if (before && !/[\s\u00a0\n]/.test(before)) return null;
  if (/[\s\u00a0\n]/.test(after)) return null;
  return after;
}

function FloatingPanel(props: {
  visible: boolean;
  title: string;
  items: { key: string; label: React.ReactNode; onClick: () => void }[];
}) {
  if (!props.visible) return null;
  return (
    <div style={panelStyle} role="listbox" aria-label={props.title}>
      <Text
        type="secondary"
        style={{ display: 'block', fontSize: 12, padding: '8px 12px 4px' }}
      >
        {props.title}
      </Text>
      <List
        size="small"
        dataSource={props.items}
        renderItem={(item) => (
          <List.Item
            style={{ cursor: 'pointer', padding: '6px 12px' }}
            onMouseDown={(e) => {
              e.preventDefault();
              item.onClick();
            }}
          >
            {item.label}
          </List.Item>
        )}
      />
    </div>
  );
}

/**
 * 文档站专用：对齐业务 ChatInputField 的封装形态（@ / 面板、actionsRender、附件、inputRef），
 * 用于验证中文输入法 Enter 确认选字不会误发送。
 */
export function ChatComposerForImeDemo({
  triggerSendKey = 'Enter',
  onSent,
  placeholder,
  style,
}: ChatComposerForImeDemoProps) {
  const inputRef = useRef<MarkdownEditorInstance>();
  const inputWrapperRef = useRef<HTMLDivElement>(null);
  const composerWrapRef = useRef<HTMLDivElement>(null);
  const skipDraftPersistRef = useRef(false);

  const [value, setValue] = useState('');
  const [fileMap, setFileMap] = useState<Map<string, AttachmentFile>>(
    new Map(),
  );
  const [slashPanelVisible, setSlashPanelVisible] = useState(false);
  const [slashFilterText, setSlashFilterText] = useState('');
  const [mentionPanelVisible, setMentionPanelVisible] = useState(false);
  const [mentionFilterText, setMentionFilterText] = useState('');
  const slashCooldownRef = useRef(0);
  const mentionCooldownRef = useRef(0);
  /** composition 结束后短暂冷却，避免 IME 确认 Enter 后面板立刻弹出并抢焦点 */
  const slashPanelImeCooldownRef = useRef(0);
  const [compositionActive, setCompositionActive] = useState(false);

  const quickExecuteItems = DEFAULT_QUICK_ITEMS;
  const mentionItems = DEFAULT_MENTION_ITEMS;

  useEffect(() => {
    try {
      const draft = sessionStorage.getItem(DRAFT_STORAGE_KEY);
      if (!draft) return;
      inputRef.current?.store?.setMDContent(draft);
      setValue(draft);
    } catch (caughtError) {
      logCaughtError(
        'docs/demos/markdownInputField/_ChatComposerForImeDemo.tsx:draft-restore',
        caughtError,
      );
    }
  }, []);

  const handleChange = useRefFunction((v: string) => {
    setValue(v);

    const composing =
      compositionActive ||
      inputRef.current?.store?.inputComposition === true ||
      Date.now() < slashPanelImeCooldownRef.current;

    // IME 组合期间不展示 @ / 面板，避免与选字条叠在一起且 Enter 误触
    if (composing) {
      setSlashPanelVisible(false);
      setMentionPanelVisible(false);
      if (!skipDraftPersistRef.current) {
        try {
          sessionStorage.setItem(DRAFT_STORAGE_KEY, v);
        } catch (caughtError) {
          logCaughtError(
            'docs/demos/markdownInputField/_ChatComposerForImeDemo.tsx:draft-write',
            caughtError,
          );
        }
      }
      return;
    }

    if (Date.now() < slashCooldownRef.current) {
      setSlashPanelVisible(false);
    } else {
      const slashQuery = detectActiveTriggerQuery(v, '/');
      if (slashQuery !== null) {
        setSlashPanelVisible(true);
        setSlashFilterText(slashQuery);
        setMentionPanelVisible(false);
      } else {
        setSlashPanelVisible(false);
      }
    }

    if (Date.now() < mentionCooldownRef.current) {
      setMentionPanelVisible(false);
    } else {
      const mentionQuery = detectActiveTriggerQuery(v, '@');
      if (mentionQuery !== null) {
        setMentionPanelVisible(true);
        setMentionFilterText(mentionQuery);
        setSlashPanelVisible(false);
      } else {
        setMentionPanelVisible(false);
      }
    }

    if (!skipDraftPersistRef.current) {
      try {
        sessionStorage.setItem(DRAFT_STORAGE_KEY, v);
      } catch (caughtError) {
        logCaughtError(
          'docs/demos/markdownInputField/_ChatComposerForImeDemo.tsx:draft-write',
          caughtError,
        );
      }
    }
  });

  const handleSlashSelect = useRefFunction((skillName: string) => {
    const matched = quickExecuteItems.find((s) => s.label === skillName);
    const store = inputRef.current?.store;
    slashCooldownRef.current = Date.now() + 300;
    setSlashPanelVisible(false);

    if (matched?.category !== 'skill') {
      if (store) {
        if (store.clearContent) store.clearContent();
        else store.setMDContent('');
        requestAnimationFrame(() => store.focus?.());
      }
      skipDraftPersistRef.current = true;
      try {
        sessionStorage.removeItem(DRAFT_STORAGE_KEY);
      } catch (caughtError) {
        logCaughtError(
          'docs/demos/markdownInputField/_ChatComposerForImeDemo.tsx:draft-clear',
          caughtError,
        );
      }
      void onSent?.(`/${skillName}`);
      skipDraftPersistRef.current = false;
      return;
    }

    if (store) {
      applySkillSlashToComposer(store, skillName);
    }
  });

  const handleMentionSelect = useRefFunction((item: DemoMentionItem) => {
    mentionCooldownRef.current = Date.now() + 300;
    setMentionPanelVisible(false);
    setMentionFilterText('');
    const store = inputRef.current?.store;
    if (!store) return;
    const current = store.getMDContent?.() ?? '';
    const lastAtIndex = current.lastIndexOf('@');
    const next =
      lastAtIndex >= 0
        ? `${current.slice(0, lastAtIndex)}@${item.label}\u00a0`
        : `@${item.label}\u00a0`;
    store.setMDContent(next);
    requestAnimationFrame(() => store.focus?.());
  });

  const appendTriggerChar = useRefFunction((char: '@' | '/') => {
    const store = inputRef.current?.store;
    if (!store) return;
    const current = store.getMDContent?.() ?? '';
    const needsSpace = current.length > 0 && !/[\s\u00a0\n]$/.test(current);
    store.setMDContent(`${current}${needsSpace ? ' ' : ''}${char}`);
    requestAnimationFrame(() => store.focus?.());
  });

  const composerIconButtons = useMemo(
    () => [
      <Tooltip key="mention" title="@助理">
        <span
          role="button"
          tabIndex={0}
          aria-label="选择助理"
          style={iconBtnStyle}
          onClick={() => {
            appendTriggerChar('@');
            setMentionPanelVisible(true);
            setMentionFilterText('');
            setSlashPanelVisible(false);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              appendTriggerChar('@');
            }
          }}
        >
          <UserOutlined />
        </span>
      </Tooltip>,
      <Tooltip key="slash" title="快捷执行">
        <span
          role="button"
          tabIndex={0}
          aria-label="快捷执行"
          style={iconBtnStyle}
          onClick={() => {
            appendTriggerChar('/');
            setSlashPanelVisible(true);
            setSlashFilterText('');
            setMentionPanelVisible(false);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              appendTriggerChar('/');
            }
          }}
        >
          <ThunderboltOutlined />
        </span>
      </Tooltip>,
    ],
    [appendTriggerChar],
  );

  const composedActionsRender = useMemo(
    () =>
      (
        _state: unknown,
        defaultActions: React.ReactNode[],
      ): React.ReactNode[] => [...composerIconButtons, ...defaultActions],
    [composerIconButtons],
  );

  const filteredSlashItems = quickExecuteItems.filter((item) =>
    item.label.toLowerCase().includes(slashFilterText.toLowerCase()),
  );
  const filteredMentionItems = mentionItems.filter((item) =>
    item.label.toLowerCase().includes(mentionFilterText.toLowerCase()),
  );

  useEffect(() => {
    if (!slashPanelVisible && !mentionPanelVisible) return;
    const onMouseDown = (e: MouseEvent) => {
      if (
        inputWrapperRef.current &&
        !inputWrapperRef.current.contains(e.target as Node)
      ) {
        setSlashPanelVisible(false);
        setMentionPanelVisible(false);
      }
    };
    document.addEventListener('mousedown', onMouseDown);
    return () => document.removeEventListener('mousedown', onMouseDown);
  }, [slashPanelVisible, mentionPanelVisible]);

  const attachment = useMemo(
    () => ({
      enable: true as const,
      upload: mockUpload,
      fileMap,
      onFileMapChange: (files?: Map<string, AttachmentFile>) => {
        if (files) setFileMap(files);
      },
      supportedFormat: {
        type: 'file' as const,
        content: '演示：图片与文档，最大 10MB',
        maxSize: 10 * 1024 * 1024,
        extensions: ['.png', '.jpg', '.pdf', '.txt', '.md'],
        icon: <PaperClipOutlined />,
      },
    }),
    [fileMap],
  );

  return (
    <div ref={inputWrapperRef} style={{ position: 'relative' }}>
      <FloatingPanel
        visible={slashPanelVisible}
        title="快捷执行 /"
        items={filteredSlashItems.map((item) => ({
          key: item.label,
          label: (
            <div>
              <Text strong>/{item.label}</Text>
              {item.description ? (
                <Text type="secondary" style={{ marginLeft: 8, fontSize: 12 }}>
                  {item.description}
                </Text>
              ) : null}
            </div>
          ),
          onClick: () => handleSlashSelect(item.label),
        }))}
      />
      <FloatingPanel
        visible={mentionPanelVisible}
        title="选择助理 @"
        items={filteredMentionItems.map((item) => ({
          key: item.label,
          label: (
            <div>
              <Text strong>@{item.label}</Text>
              {item.description ? (
                <Text type="secondary" style={{ marginLeft: 8, fontSize: 12 }}>
                  {item.description}
                </Text>
              ) : null}
            </div>
          ),
          onClick: () => handleMentionSelect(item),
        }))}
      />

      <div ref={composerWrapRef} style={{ position: 'relative' }}>
        <MarkdownInputField
          inputRef={inputRef}
          style={style}
          value={value}
          onChange={handleChange}
          triggerSendKey={triggerSendKey}
          placeholder={placeholder}
          actionsRender={composedActionsRender}
          markdownProps={{
            onCompositionActiveChange: (active) => {
              setCompositionActive(active);
              if (active) {
                setSlashPanelVisible(false);
                setMentionPanelVisible(false);
              } else {
                slashPanelImeCooldownRef.current = Date.now() + 300;
              }
            },
          }}
          attachment={attachment}
          pasteConfig={{
            allowedTypes: ['text/plain', 'Files'],
            enabled: true,
            plainTextOnly: true,
          }}
          onSend={async (md) => {
            setSlashPanelVisible(false);
            setMentionPanelVisible(false);
            const combined = (md ?? '').trim();
            if (!combined) return;
            const normalized = combined.replace(/\u00a0/g, ' ').trim();
            const isSystemCmd = quickExecuteItems.some(
              (item) =>
                item.category !== 'skill' && normalized === `/${item.label}`,
            );
            skipDraftPersistRef.current = true;
            try {
              sessionStorage.removeItem(DRAFT_STORAGE_KEY);
            } catch (caughtError) {
              logCaughtError(
                'docs/demos/markdownInputField/_ChatComposerForImeDemo.tsx:send-draft-clear',
                caughtError,
              );
            }
            const files = Array.from(fileMap.values());
            setFileMap(new Map());
            if (isSystemCmd) {
              await onSent?.(normalized);
            } else {
              await onSent?.(combined, files.length > 0 ? files : undefined);
            }
            skipDraftPersistRef.current = false;
          }}
        />
      </div>
    </div>
  );
}
