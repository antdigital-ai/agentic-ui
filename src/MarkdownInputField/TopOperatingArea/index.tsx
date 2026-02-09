import { ConfigProvider } from 'antd';
import classNames from 'clsx';
import React, { useContext } from 'react';
import { BackTo } from '../../BackTo';
import { useStyle } from './style';

interface TopOperatingAreaProps {
  isShowBackTo?: boolean;
  targetRef?: React.RefObject<HTMLDivElement>;
  operationBtnRender?: () => React.ReactNode;
}
const TopOperatingArea: React.FC<TopOperatingAreaProps> = (props) => {
  const { isShowBackTo = true, targetRef, operationBtnRender } = props;

  const { getPrefixCls } = useContext(ConfigProvider.ConfigContext);
  const prefixCls = getPrefixCls('agentic-top-operating-area');
  const { wrapSSR, hashId } = useStyle(prefixCls);

  const renderOperationButtons = () => {
    if (!operationBtnRender) return null;

    return (
      <div className={classNames(`${prefixCls}-buttons`, hashId)}>
        {operationBtnRender()}
      </div>
    );
  };

  return wrapSSR(
    <div className={classNames(prefixCls, hashId)}>
      <div className={classNames(`${prefixCls}-left`, hashId)}></div>
      <div className={classNames(`${prefixCls}-center`, hashId)}>
        {renderOperationButtons()}
      </div>
      <div className={classNames(`${prefixCls}-right`, hashId)}>
        <div
          className={classNames(
            `${prefixCls}-back-buttons`,
            `${prefixCls}-back-buttons-${isShowBackTo ? 'visible' : 'hidden'}`,
            hashId,
          )}
        >
          {isShowBackTo && (
            <>
              <BackTo.Top
                target={
                  targetRef ? () => targetRef.current || window : undefined
                }
                shouldVisible={5}
                style={{
                  position: 'relative',
                  insetInlineEnd: 0,
                  bottom: 0,
                }}
              />
              <BackTo.Bottom
                target={
                  targetRef ? () => targetRef.current || window : undefined
                }
                shouldVisible={5}
                style={{
                  position: 'relative',
                  insetInlineEnd: 0,
                  bottom: 0,
                }}
              />
            </>
          )}
        </div>
      </div>
    </div>,
  );
};
export default TopOperatingArea;
