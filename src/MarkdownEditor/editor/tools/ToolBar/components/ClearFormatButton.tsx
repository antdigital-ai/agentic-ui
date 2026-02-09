import classnames from 'clsx';
import React from 'react';
import { ToolBarItem } from './ToolBarItem';

const ClearIcon = React.memo(() => {
  return (
    <svg
      viewBox="0 0 1024 1024"
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
    >
      <path
        d="M604.536246 736.222443l288.794439-282.693148-287.777557-270.999007-270.999007 283.201589z m-72.70705 71.181728L264.389275 539.455809 145.922542 660.973188l164.734856 164.734856a50.844091 50.844091 0 0 0 36.099305 14.744786h107.789474a101.688183 101.688183 0 0 0 71.181728-28.981132z m109.314796 35.082423h254.220457a50.844091 50.844091 0 0 1 0 101.688183H346.248262a152.532274 152.532274 0 0 1-107.789474-44.742801l-164.734856-164.734856a101.688183 101.688183 0 0 1 0-142.363456l457.596823-480.476663a101.688183 101.688183 0 0 1 143.380337-3.559086l287.269117 270.999007a101.688183 101.688183 0 0 1 4.067527 143.888778l-3.050646 3.050646z"
        fill="currentColor"
      />
    </svg>
  );
});

ClearIcon.displayName = 'ClearIcon';

interface ClearFormatButtonProps {
  baseClassName: string;
  hashId?: string;
  i18n: any;
  onClear: () => void;
}

export const ClearFormatButton = React.memo<ClearFormatButtonProps>(
  ({ baseClassName, hashId, i18n, onClear }) => {
    return (
      <ToolBarItem
        title={i18n?.locale?.clearFormatting || '清除格式'}
        icon={<ClearIcon />}
        onClick={onClear}
        className={classnames(`${baseClassName}-item`, hashId)}
      />
    );
  },
);

ClearFormatButton.displayName = 'ClearFormatButton';
