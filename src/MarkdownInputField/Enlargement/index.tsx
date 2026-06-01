import { ExpandAlt, FoldAlt } from '@sofa-design/icons';
import React from 'react';
import { ActionIconBox } from '../../Components/ActionIconBox';
import { useLocale } from '../../I18n';

interface EnlargementProps {
  /** 是否处于放大状态 */
  isEnlarged?: boolean;
  /** 点击放大图标的回调 */
  onEnlargeClick?: () => void;
}

const Enlargement: React.FC<EnlargementProps> = ({
  isEnlarged = false,
  onEnlargeClick,
}) => {
  const locale = useLocale();
  const title = isEnlarged
    ? (locale?.shrink ?? '缩小')
    : (locale?.enlarge ?? '放大');
  return (
    <ActionIconBox title={title} onClick={onEnlargeClick}>
      {isEnlarged ? <FoldAlt /> : <ExpandAlt />}
    </ActionIconBox>
  );
};

export default Enlargement;
