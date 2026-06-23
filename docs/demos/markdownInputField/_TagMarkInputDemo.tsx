import {
  MarkdownInputField,
  useRefFunction,
  type MarkdownEditorInstance,
} from '@ant-design/agentic-ui';
import { ThunderboltOutlined, UserOutlined } from '@ant-design/icons';
import { List, Tooltip, Typography } from 'antd';
import React, { useMemo, useRef, useState } from 'react';
import {
  TAG_MARK_MENTION_ITEMS,
  TAG_MARK_SKILL_ITEMS,
  buildMentionMarkMarkdown,
  buildSkillSlashMarkMarkdown,
  detectActiveTriggerQuery,
  replaceTrailingTriggerSegment,
  tagMarkIconBtnStyle,
  tagMarkPanelStyle,
} from './_tagMarkDemoUtils';
import { useDemoSend } from './useDemoSend';

const { Text } = Typography;

type ComposerStore = {
  getMDContent?: () => string;
  setMDContent: (md: string) => void;
  focus?: () => void;
};

function focusAfterUpdate(store: ComposerStore) {
  requestAnimationFrame(() => store.focus?.());
}

function FloatingPanel(props: {
  visible: boolean;
  title: string;
  items: { key: string; label: React.ReactNode; onClick: () => void }[];
}) {
  if (!props.visible) return null;
  return (
    <div style={tagMarkPanelStyle} role="listbox" aria-label={props.title}>
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

export interface TagMarkInputDemoProps {
  initialValue: string;
  style?: React.CSSProperties;
  tagInputItems: (
    props: { placeholder?: string } | undefined,
  ) => Promise<{ key: string; label: string }[]>;
}

export const TagMarkInputDemo: React.FC<TagMarkInputDemoProps> = ({
  initialValue,
  style,
  tagInputItems,
}) => {
  const inputRef = useRef<MarkdownEditorInstance>();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const { handleSend, handleStop } = useDemoSend();

  const [value, setValue] = useState(initialValue);
  const [slashPanelVisible, setSlashPanelVisible] = useState(false);
  const [slashFilterText, setSlashFilterText] = useState('');
  const [mentionPanelVisible, setMentionPanelVisible] = useState(false);
  const [mentionFilterText, setMentionFilterText] = useState('');
  const slashCooldownRef = useRef(0);
  const mentionCooldownRef = useRef(0);

  const handleChange = useRefFunction((next: string) => {
    setValue(next);

    if (Date.now() < slashCooldownRef.current) {
      setSlashPanelVisible(false);
    } else {
      const slashQuery = detectActiveTriggerQuery(next, '/');
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
      const mentionQuery = detectActiveTriggerQuery(next, '@');
      if (mentionQuery !== null) {
        setMentionPanelVisible(true);
        setMentionFilterText(mentionQuery);
        setSlashPanelVisible(false);
      } else {
        setMentionPanelVisible(false);
      }
    }
  });

  const appendTriggerChar = useRefFunction((char: '@' | '/') => {
    const store = inputRef.current?.store;
    if (!store) return;
    const current = store.getMDContent?.() ?? '';
    const needsSpace = current.length > 0 && !/[\s\u00a0\n]$/.test(current);
    store.setMDContent(`${current}${needsSpace ? ' ' : ''}${char}`);
    focusAfterUpdate(store);
    if (char === '@') {
      setMentionPanelVisible(true);
      setMentionFilterText('');
      setSlashPanelVisible(false);
    } else {
      setSlashPanelVisible(true);
      setSlashFilterText('');
      setMentionPanelVisible(false);
    }
  });

  const handleMentionSelect = useRefFunction(
    (item: (typeof TAG_MARK_MENTION_ITEMS)[number]) => {
      mentionCooldownRef.current = Date.now() + 300;
      setMentionPanelVisible(false);
      setMentionFilterText('');
      const store = inputRef.current?.store;
      if (!store) return;
      const current = store.getMDContent?.() ?? '';
      store.setMDContent(
        replaceTrailingTriggerSegment(
          current,
          '@',
          buildMentionMarkMarkdown(item.label),
        ),
      );
      focusAfterUpdate(store);
    },
  );

  const handleSlashSelect = useRefFunction(
    (skillName: (typeof TAG_MARK_SKILL_ITEMS)[number]['label']) => {
      slashCooldownRef.current = Date.now() + 300;
      setSlashPanelVisible(false);
      setSlashFilterText('');
      const store = inputRef.current?.store;
      if (!store) return;
      const current = store.getMDContent?.() ?? '';
      store.setMDContent(
        replaceTrailingTriggerSegment(
          current,
          '/',
          buildSkillSlashMarkMarkdown(skillName),
        ),
      );
      focusAfterUpdate(store);
    },
  );

  const composerIconButtons = useMemo(
    () => [
      <Tooltip key="mention" title="@ 助理 mark">
        <span
          role="button"
          tabIndex={0}
          aria-label="插入 @ 助理"
          style={tagMarkIconBtnStyle}
          onClick={() => appendTriggerChar('@')}
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
      <Tooltip key="slash" title="/ 技能 mark">
        <span
          role="button"
          tabIndex={0}
          aria-label="插入 / 技能"
          style={tagMarkIconBtnStyle}
          onClick={() => appendTriggerChar('/')}
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

  const actionsRender = useMemo(
    () =>
      (
        _state: unknown,
        defaultActions: React.ReactNode[],
      ): React.ReactNode[] => [...composerIconButtons, ...defaultActions],
    [composerIconButtons],
  );

  const filteredSlashItems = TAG_MARK_SKILL_ITEMS.filter((item) =>
    item.label.toLowerCase().includes(slashFilterText.toLowerCase()),
  );
  const filteredMentionItems = TAG_MARK_MENTION_ITEMS.filter((item) =>
    item.label.toLowerCase().includes(mentionFilterText.toLowerCase()),
  );

  return (
    <div ref={wrapperRef} style={{ position: 'relative' }}>
      <FloatingPanel
        visible={slashPanelVisible}
        title="技能 /（mark）"
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
        title="助理 @（mark）"
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

      <MarkdownInputField
        inputRef={inputRef}
        style={style}
        value={value}
        onChange={handleChange}
        tagInputProps={{
          enable: true,
          items: tagInputItems,
        }}
        actionsRender={actionsRender}
        onSend={handleSend}
        onStop={handleStop}
        placeholder="输入 $ 选 tag；@ / 或点左侧按钮插入 mark"
      />
    </div>
  );
};
