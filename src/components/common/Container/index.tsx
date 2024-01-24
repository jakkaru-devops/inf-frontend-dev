import classNames from 'classnames';
import { IContainerProps } from './interfaces';
import { FC } from 'react';

const Container: FC<IContainerProps> = ({
  size = 'middle',
  noPadding,
  verticalPadding,
  className,
  style,
  children,
}) => {
  return (
    <div
      className={classNames(['container', className], {
        'container-fluid': size === 'fluid',
        'container-middle': size === 'middle',
        'container-small': size === 'small',
        'container-extra-small': size === 'extraSmall',
        'container--no-padding': noPadding,
        'pt-10 pb-10': verticalPadding,
      })}
      style={style}
    >
      {children}
    </div>
  );
};

export default Container;
