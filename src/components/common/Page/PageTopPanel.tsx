import classNames from 'classnames';
import { FC, ReactNode } from 'react';

interface IProps {
  className?: string;
  paddingSize?: 'default' | 'small';
  children?: ReactNode;
}

const PageTopPanel: FC<IProps> = ({
  className,
  paddingSize = 'default',
  children,
}) => {
  return (
    <div
      className={classNames(['app-page__top-panel mt-20', className], {
        'padding-small': paddingSize === 'small',
      })}
    >
      {children}
    </div>
  );
};

export default PageTopPanel;
