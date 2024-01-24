import { FC, ReactNode } from 'react';

const TabGroupUnderList: FC<{ children: ReactNode }> = ({ children }) =>
  children ? (
    <div className="tab-group__under-list">
      <div className="tab-group__under-list__content">{children}</div>{' '}
    </div>
  ) : (
    <></>
  );

export default TabGroupUnderList;
