import { ModalProps } from 'antd';

export interface IModalPropsBasic
  extends Omit<ModalProps, 'visible' | 'onCancel'> {
  onClose: () => void;
}

export interface IModalProps extends IModalPropsBasic {
  hideHeader?: boolean;
  hideHeaderBorder?: boolean;
  hideCloseIcon?: boolean;
  hideFooter?: boolean;
}
