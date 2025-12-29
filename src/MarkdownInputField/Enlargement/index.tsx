import { ExpandAlt, FoldAlt } from '@sofa-design/icons';
import React from 'react';
import { ActionIconBox } from '../../components/ActionIconBox';

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
  return (
    <ActionIconBox
      title={isEnlarged ? '缩小' : '放大'}
      onClick={onEnlargeClick}
    >
      {isEnlarged ? <FoldAlt /> : <ExpandAlt />}
    </ActionIconBox>
  );
};

export default Enlargement;
