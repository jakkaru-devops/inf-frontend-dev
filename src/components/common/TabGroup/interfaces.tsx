import { CSSProperties, ReactNode } from 'react';
import { IUserRoleLabelsDefault } from 'sections/Users/interfaces';

export interface ITabGroup {
  list: ITabGroupItem[];
  className?: string;
  children?: ReactNode | null;
  style?: CSSProperties;
  scroll?: boolean;
}

export interface ITabGroupItem {
  href?: string;
  onClick?: (router: any, tabLabel: string) => void | null;
  label: string | null;
  title: string | JSX.Element | null;
  isActive?: boolean;
  notificationsNumber?: number;
  rollback?: boolean;
  access?: IUserRoleLabelsDefault[];
}
