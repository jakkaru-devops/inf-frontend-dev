import classNames from 'classnames';
import { IComponentCommonProps } from 'interfaces/common.interfaces';
import { FC } from 'react';

const EmptyListMark: FC<IComponentCommonProps> = ({
  children,
  className,
  style,
}) => {
  return (
    <div className={classNames(['empty-list-mark', className])} style={style}>
      {children}
    </div>
  );
};

export default EmptyListMark;
