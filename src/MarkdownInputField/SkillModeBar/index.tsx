import { CloseOutlined } from '@ant-design/icons';
import { ConfigProvider, Divider, Flex } from 'antd';
import classNames from 'clsx';
import { AnimatePresence, motion } from 'framer-motion';
import React, { useContext } from 'react';
import { useSkillModeState } from './hooks';
import { useStyle } from './style';

/**
 * 技能模式配置接口
 * @interface SkillModeConfig
 * @property {boolean} [enable] - 是否启用技能模式组件，默认为 true
 * @property {boolean} [open] - 是否打开技能模式
 * @property {React.ReactNode} [title] - 技能模式标题，支持字符串或React节点
 * @property {React.ReactNode | React.ReactNode[]} [rightContent] - 右侧自定义内容，支持单个节点或数组
 * @property {boolean} [closable] - 是否显示默认关闭按钮
 * @property {React.CSSProperties} [style] - 技能模式容器样式
 * @property {string} [className] - 技能模式容器类名
 */
export interface SkillModeConfig {
  /**
   * 是否启用技能模式组件
   * @description 控制整个技能模式组件是否渲染，当为 false 时组件完全不渲染任何内容
   * @default true
   * @example enable={skillModeFeatureEnabled}
   */
  enable?: boolean;

  /**
   * 是否打开技能模式
   * @description 控制技能模式的显示与隐藏状态
   * @default false
   * @example open={skillModeEnabled}
   */
  open?: boolean;

  /**
   * 技能模式标题
   * @description 支持字符串或React节点
   * @example title="AI助手模式"
   * @example title={<Space><Icon />助手模式</Space>}
   */
  title?: React.ReactNode;

  /**
   * 右侧自定义内容
   * @description 在技能模式右侧显示的自定义内容，支持单个节点或数组
   * @example rightContent={<Tag>v2.0</Tag>}
   * @example rightContent={[<Tag key="version">v2.0</Tag>, <Button key="settings">设置</Button>]}
   */
  rightContent?: React.ReactNode | React.ReactNode[];

  /**
   * 是否显示默认关闭按钮
   * @description 控制是否在右侧显示默认的关闭按钮，点击后会触发 onSkillModeOpenChange(false)
   * @default true
   * @example closable={false} // 不显示关闭按钮
   */
  closable?: boolean;

  /**
   * 技能模式容器样式
   * @description 应用于技能模式容器的内联样式
   */
  style?: React.CSSProperties;

  /**
   * 技能模式容器类名
   * @description 应用于技能模式容器的CSS类名
   */
  className?: string;
}

export interface SkillModeBarProps {
  /**
   * 技能模式配置
   */
  skillMode?: SkillModeConfig;

  /**
   * 技能模式开关状态变化时触发的回调函数
   * @description 监听技能模式 open 状态的所有变化，包括用户点击关闭按钮和外部直接修改状态
   * @param open 新的开关状态
   * @example onSkillModeOpenChange={(open) => {
   *   console.log(`技能模式${open ? '打开' : '关闭'}`);
   *   setSkillModeEnabled(open);
   * }}
   */
  onSkillModeOpenChange?: (open: boolean) => void;
}

/**
 * 技能模式条内部组件
 * @description 包含所有hooks和渲染逻辑的内部实现组件
 * @param props - 组件属性
 * @returns React 组件
 */
const SkillModeBarInner: React.FC<SkillModeBarProps> = ({
  skillMode,
  onSkillModeOpenChange,
}) => {
  // 获取样式前缀和配置
  const { getPrefixCls } = useContext(ConfigProvider.ConfigContext);
  const prefixCls = getPrefixCls('agentic-skill-mode');

  // 注册样式
  const { wrapSSR, hashId } = useStyle(prefixCls);

  // 使用技能模式状态管理 hook
  const handleInternalSkillModeChange = useSkillModeState(
    skillMode,
    onSkillModeOpenChange,
  );

  // 提取常用判断条件，消除重复逻辑
  // 将 rightContent 统一转换为数组处理
  const rightContentArray = React.useMemo(() => {
    if (!skillMode?.rightContent) return [];
    return Array.isArray(skillMode.rightContent)
      ? skillMode.rightContent
      : [skillMode.rightContent];
  }, [skillMode?.rightContent]);

  const hasRightContent = rightContentArray.length > 0;
  const isClosable = skillMode?.closable !== false;
  const shouldShowDivider = hasRightContent && isClosable;

  const handleCloseClick = (e: React.MouseEvent) => {
    e.stopPropagation();

    // 使用内部状态变化处理函数
    handleInternalSkillModeChange(false);
  };

  return wrapSSR(
    <AnimatePresence>
      {skillMode?.open && (
        <motion.div
          role="region"
          aria-live="polite"
          aria-label="技能模式"
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
          className={classNames(`${prefixCls}-container`, hashId)}
          data-testid="skill-mode-bar"
        >
          <motion.div
            initial={{
              padding: '0px',
              backgroundColor: 'transparent',
              borderColor: 'transparent',
            }}
            animate={{
              padding: '12px',
              backgroundColor: 'var(--color-gray-bg-page)',
              borderColor: 'rgba(0, 16, 64, 0.0627)',
            }}
            exit={{
              padding: '0px',
              backgroundColor: 'transparent',
              borderColor: 'transparent',
            }}
            transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
            style={skillMode?.style}
            className={classNames(`${prefixCls}`, hashId, skillMode?.className)}
          >
            {/* 左侧区域 - 技能模式标题 */}
            <div className={classNames(`${prefixCls}-title`, hashId)}>
              {skillMode?.title}
            </div>

            {/* 右侧区域 */}
            <Flex
              justify="flex-end"
              align="center"
              gap={8}
              className={classNames(`${prefixCls}-right`, hashId)}
            >
              {/* 右侧自定义内容 */}
              {rightContentArray.map((content, index) => {
                // 优先使用React元素的key，fallback到index
                const key =
                  React.isValidElement(content) && content.key
                    ? content.key
                    : index;
                return <React.Fragment key={key}>{content}</React.Fragment>;
              })}

              {/* 分割线 - 只有当有右侧内容且可关闭时才显示 */}
              {shouldShowDivider && (
                <Divider
                  type="vertical"
                  className={classNames(`${prefixCls}-divider`, hashId)}
                />
              )}

              {/* 技能模式关闭按钮 */}
              {isClosable && (
                <button
                  type="button"
                  aria-label="关闭技能模式"
                  className={classNames(`${prefixCls}-close`, hashId)}
                  onClick={handleCloseClick}
                  data-testid="skill-mode-close"
                >
                  <CloseOutlined />
                </button>
              )}
            </Flex>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
  );
};

/**
 * 技能模式条组件
 * @description 用于显示技能模式的标题栏，包含标题、右侧内容和关闭按钮
 * @param props - 组件属性
 * @returns React 组件
 */
export const SkillModeBar: React.FC<SkillModeBarProps> = ({
  skillMode,
  onSkillModeOpenChange,
}) => {
  // 早期返回：当 skillMode 不存在或 enable 为 false 时，不渲染任何内容且不执行任何逻辑
  if (!skillMode || skillMode.enable === false) {
    return null;
  }

  // 渲染内部组件，确保 hooks 始终按相同顺序执行
  return (
    <SkillModeBarInner
      skillMode={skillMode}
      onSkillModeOpenChange={onSkillModeOpenChange}
    />
  );
};
