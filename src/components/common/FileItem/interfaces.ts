import { IFileItem } from 'interfaces/files.interfaces';
import { MouseEvent as ReactMouseEvent } from 'react';

export interface IFileItemProps {
  file: IFileItem;
  className?: string;
  size?: 'default' | 'small';
  onClick?: (e: ReactMouseEvent<HTMLAnchorElement, MouseEvent>) => void;
  onDelete?: (file: IFileItem) => void;
}
