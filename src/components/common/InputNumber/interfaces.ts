import { InputNumberProps } from 'antd';
import { Ref } from 'react';

export interface IInputNumberProps extends InputNumberProps {
  showControls?: boolean;
  colorPrimary?: boolean;
  widthSmall?: boolean;
  textCenter?: boolean;
  inputRef?: Ref<HTMLInputElement>;
  step?: number;
  min?: number;
  max?: number;
  onChange?: (value: number) => void;
}
