import { PagePreloader } from 'components/common';
import { FC, ReactNode } from 'react';

interface IProps {
  contentLoaded: boolean;
  children: ReactNode;
}

const PageContainer: FC<IProps> = ({ contentLoaded, children }) => {
  return !contentLoaded ? <PagePreloader /> : <>{children}</>;
};

export default PageContainer;
