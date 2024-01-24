import classNames from 'classnames';
import { FC, ReactNode } from 'react';

interface IProps {
  className?: string;
  topContent?: JSX.Element;
  bottomContent?: JSX.Element;
  children: ReactNode;
}

const Page: FC<IProps> = ({ className, children }) => {
  return <div className={classNames(['app-page', className])}>{children}</div>;
};

export default Page;
