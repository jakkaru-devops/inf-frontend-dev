import { Modal as AntdModal } from 'antd';
import classNames from 'classnames';
import { FC } from 'react';
import { IModalProps } from './interfaces';

const Modal: FC<IModalProps> = ({
  hideHeader,
  hideHeaderBorder,
  hideCloseIcon,
  hideFooter = true,
  className,
  footer,
  onClose,
  ...rest
}) => {
  return (
    <AntdModal
      centered
      destroyOnClose
      className={classNames(className, {
        'header-hidden': hideHeader,
        'header-border-hidden': hideHeaderBorder,
        'close-icon-hidden': hideCloseIcon,
        'footer-hidden': hideFooter,
      })}
      footer={!hideFooter ? footer : null}
      onCancel={onClose}
      {...rest}
    />
  );
};

export default Modal;
