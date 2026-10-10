import { ConfigProvider, Popover, Tooltip } from 'antd';
import classNames from 'clsx';
import React, { useContext, useRef, useState } from 'react';
import { Editor, Transforms } from 'slate';
import { ReactEditor, useSlateStatic } from 'slate-react';
import { I18nContext } from '../../../../I18n';
import {
  ComposerChipData,
  ComposerFileChip,
  ComposerSlashChip,
  ComposerSymbolChip,
  readComposerChipData,
} from './types';

interface ComposerChipElementProps {
  attributes: Record<string, any>;
  children: React.ReactNode;
  element: { type: 'composer-chip'; chip: ComposerChipData };
  readonly?: boolean;
  prefixCls?: string;
}

/** slash chip 色调分档（对齐 IDE resolveSlashCommandToneKey：section 优先，plan/goal 名称专属 tone） */
const SLASH_TONE_COLOR: Record<string, string> = {
  default: 'var(--color-blue-text, #1677ff)',
  goal: 'var(--color-green-text, #52c41a)',
  plan: 'var(--color-orange-text, #fa8c16)',
  custom: 'var(--color-purple-text, #722ed1)',
  skill: 'var(--color-green-text, #52c41a)',
};

const resolveSlashToneKey = (commandName: string, section: string): string => {
  const normalized = commandName.trim().replace(/^\/+/, '').toLowerCase();
  if (section === 'custom') return 'custom';
  if (section === 'skill') return 'skill';
  if (normalized === 'plan') return 'plan';
  if (normalized === 'goal') return 'goal';
  return 'default';
};

const chipBaseStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 4,
  height: 22,
  padding: '0 8px',
  borderRadius: 6,
  fontSize: 13,
  lineHeight: '20px',
  userSelect: 'none',
  backgroundColor: 'var(--color-gray-bg-gray-3, rgba(0,0,0,0.04))',
  verticalAlign: 'middle',
  maxWidth: 240,
  whiteSpace: 'nowrap',
};

/** slash chip 视觉（对齐 IDE glass-composer-slash 色调分档 + placeholder） */
const SlashChipView: React.FC<{
  chip: ComposerSlashChip;
  prefixCls: string;
  label: string;
  /** 无后续输入时展示 placeholder（对齐 hasFollowingInput 反逻辑） */
  placeholder?: string;
}> = ({ chip, prefixCls, label, placeholder }) => {
  const color = SLASH_TONE_COLOR[resolveSlashToneKey(chip.name, chip.section)];
  return (
    <span className={`${prefixCls}-slash`} style={{ ...chipBaseStyle, color }}>
      <span className={`${prefixCls}-slash-icon`} style={{ fontWeight: 600 }}>
        /
      </span>
      <span
        className={`${prefixCls}-slash-label`}
        style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}
      >
        {label}
      </span>
      {placeholder ? (
        <span
          className={`${prefixCls}-slash-placeholder`}
          style={{ opacity: 0.55, fontSize: 11 }}
        >
          {placeholder}
        </span>
      ) : chip.placeholderKey && !chip.payload ? (
        <span style={{ opacity: 0.55, fontSize: 11 }}>…</span>
      ) : null}
    </span>
  );
};

/** file/folder chip 视觉（对齐 IDE MentionFileIcon + 中部省略） */
const FileChipView: React.FC<{
  chip: ComposerFileChip;
  prefixCls: string;
  label: string;
}> = ({ chip, prefixCls, label }) => (
  <span
    className={`${prefixCls}-file`}
    style={{
      ...chipBaseStyle,
      color:
        chip.source === 'local'
          ? 'var(--color-gray-text, inherit)'
          : 'var(--color-blue-text, #1677ff)',
    }}
    data-source={chip.source ?? 'project'}
    data-kind={chip.kind}
  >
    <span className={`${prefixCls}-file-icon`} aria-hidden>
      {chip.kind === 'folder' ? '📂' : '📄'}
    </span>
    <span
      className={`${prefixCls}-file-label`}
      style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}
      title={chip.path}
    >
      {label}
    </span>
  </span>
);

/** symbol chip 视觉（主标签 + kind 副标题） */
const SymbolChipView: React.FC<{
  chip: ComposerSymbolChip;
  prefixCls: string;
  label: string;
}> = ({ chip, prefixCls, label }) => (
  <span className={`${prefixCls}-symbol`} style={chipBaseStyle}>
    <span
      className={`${prefixCls}-symbol-kind`}
      style={{ fontSize: 11, opacity: 0.65 }}
    >
      {chip.symbolKind}
    </span>
    <span
      className={`${prefixCls}-symbol-label`}
      style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}
    >
      {label}
    </span>
    {chip.containerName ? (
      <span
        className={`${prefixCls}-symbol-container`}
        style={{ fontSize: 11, opacity: 0.55 }}
      >
        {chip.containerName}
      </span>
    ) : null}
  </span>
);

/** 长文本折叠 chip 视觉（统计 + 展开提示），点击弹出原文预览（对齐 ComposerLongTextPreview） */
const LongTextChipView: React.FC<{
  chip: Extract<ComposerChipData, { kind: 'long-text' }>;
  prefixCls: string;
  locale: any;
  onPreview?: () => void;
}> = ({ chip, prefixCls, locale, onPreview }) => {
  const content = (
    <span className={`${prefixCls}-long-text`} style={chipBaseStyle}>
      <span
        className={`${prefixCls}-long-text-badge`}
        style={{ fontWeight: 500 }}
      >
        {locale?.['composer.chip.longText'] ?? '长文本'}
      </span>
      <span
        className={`${prefixCls}-long-text-stats`}
        style={{ fontSize: 11, opacity: 0.65 }}
      >
        {chip.characterCount} {locale?.['composer.chip.chars'] ?? '字符'} ·{' '}
        {chip.lineCount} {locale?.['composer.chip.lines'] ?? '行'}
      </span>
    </span>
  );
  if (!onPreview) return content;
  return (
    <span
      role="button"
      tabIndex={0}
      className={`${prefixCls}-long-text-trigger`}
      onClick={(e) => {
        e.stopPropagation();
        onPreview();
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onPreview();
        }
      }}
      style={{ cursor: 'pointer' }}
    >
      {content}
    </span>
  );
};

/**
 * ComposerChip — 编辑器内的内联原子 chip。
 *
 * - void inline 元素：整 chip 不可编辑文本，删除按整体进行（见 withComposerChips）。
 * - 点击 slash chip 触发 onSlashChipClick（宿主可打开结构化配置浮层）。
 * - readonly 模式仅展示，无交互。
 */
export const ComposerChip: React.FC<ComposerChipElementProps> = (props) => {
  const { attributes, children, element, readonly } = props;
  const editor = useSlateStatic();
  const antdContext = useContext(ConfigProvider.ConfigContext);
  const { locale } = useContext(I18nContext);
  const baseCls = antdContext?.getPrefixCls('agentic-md-editor-chip');
  const chipRef = useRef<HTMLSpanElement>(null);
  const [longTextPreviewOpen, setLongTextPreviewOpen] = useState(false);

  const chip = readComposerChipData(element.chip);

  if (!chip) {
    // 数据损坏时退化为空 span，序列化层同样会丢弃
    return (
      <span {...attributes} data-composer-chip="invalid">
        {children}
      </span>
    );
  }

  const handleRemove = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    if (readonly) return;
    const path = ReactEditor.findPath(editor, element);
    if (path) {
      // 对齐 IDE resolveMentionDeleteRange：连带 chip 后紧跟的空格一起删除
      Editor.withoutNormalizing(editor, () => {
        Transforms.removeNodes(editor, { at: path });
        try {
          const nextPath = [...path.slice(0, -1), path[path.length - 1]];
          const nextNode = Editor.hasPath(editor, nextPath)
            ? Editor.node(editor, nextPath)
            : null;
          if (nextNode && (nextNode[0] as any)?.text === ' ') {
            Transforms.delete(editor, {
              at: nextPath,
              unit: 'character',
              distance: 1,
            });
          }
        } catch {
          // path 失效时静默
        }
      });
    }
  };

  const handleSlashClick = (event: React.MouseEvent) => {
    if (readonly) return;
    event.stopPropagation();
    // 宿主通过 chipClickRef 挂载配置浮层（对齐 IDE structuredSkillOverlay）
    (editor as any).__composerChipClick?.(chip);
  };

  const renderChipContent = () => {
    switch (chip.kind) {
      case 'slash':
        return (
          <SlashChipView
            chip={chip}
            prefixCls={baseCls}
            label={chip.name}
            placeholder={
              chip.placeholderKey && !chip.payload
                ? ((element as any).contextProps?.placeholderText as
                    | string
                    | undefined)
                : undefined
            }
          />
        );
      case 'file':
      case 'folder':
        return (
          <FileChipView chip={chip} prefixCls={baseCls} label={chip.name} />
        );
      case 'symbol':
        return (
          <SymbolChipView chip={chip} prefixCls={baseCls} label={chip.name} />
        );
      case 'long-text':
        return (
          <LongTextChipView
            chip={chip}
            prefixCls={baseCls}
            locale={locale}
            onPreview={() => setLongTextPreviewOpen(true)}
          />
        );
      default:
        return null;
    }
  };

  const isSlash = chip.kind === 'slash';
  const isLongText = chip.kind === 'long-text';
  const tooltipTitle =
    chip.kind === 'file' || chip.kind === 'folder'
      ? chip.path
      : chip.kind === 'symbol'
        ? chip.containerName
          ? `${chip.name} · ${chip.containerName}`
          : chip.name
        : undefined;

  const innerChip = (
    <Tooltip title={tooltipTitle}>
      <span
        className={`${baseCls}-inner`}
        role={isSlash && !readonly ? 'button' : undefined}
        tabIndex={isSlash && !readonly ? 0 : undefined}
        onClick={isSlash ? handleSlashClick : undefined}
      >
        {renderChipContent()}
      </span>
    </Tooltip>
  );

  return (
    <span
      {...attributes}
      ref={chipRef}
      data-composer-chip={chip.kind}
      data-chip-id={chip.id}
      contentEditable={false}
      className={classNames(baseCls, {
        [`${baseCls}-readonly`]: readonly,
      })}
    >
      {isLongText && !readonly ? (
        <Popover
          open={longTextPreviewOpen}
          trigger={[]}
          placement="top"
          onOpenChange={setLongTextPreviewOpen}
          content={
            <div
              className={`${baseCls}-long-text-preview`}
              style={{ maxWidth: 480 }}
            >
              <pre
                style={{
                  margin: 0,
                  maxHeight: 320,
                  overflow: 'auto',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  fontSize: 12,
                  lineHeight: '20px',
                }}
              >
                {chip.kind === 'long-text' ? chip.text : ''}
              </pre>
            </div>
          }
        >
          {innerChip}
        </Popover>
      ) : (
        innerChip
      )}
      {!readonly ? (
        <button
          type="button"
          className={`${baseCls}-remove`}
          contentEditable={false}
          aria-label="remove chip"
          onClick={handleRemove}
        >
          ×
        </button>
      ) : null}
      {children}
    </span>
  );
};

export const ReadonlyComposerChip: React.FC<ComposerChipElementProps> = (
  props,
) => <ComposerChip {...props} readonly />;
