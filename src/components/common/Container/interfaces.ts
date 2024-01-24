import { IComponentCommonProps } from 'interfaces/common.interfaces';
import { RefObject } from 'react';

export interface IContainerProps extends IComponentCommonProps {
  size?: 'fluid' | 'middle' | 'small' | 'extraSmall';
  noPadding?: boolean;
  verticalPadding?: boolean;
  ref?: RefObject<HTMLDivElement>;
}
