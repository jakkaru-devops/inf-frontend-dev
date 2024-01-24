import { Popover } from 'antd';
import { DOWNLOAD_APP_CLASSNAME } from './data';
import QrAndroind from 'components/complex/Footer/QrAndroind';
import QrIos from 'components/complex/Footer/QrIos';
import { FC, ReactNode } from 'react';

const CLASSNAME = DOWNLOAD_APP_CLASSNAME;

interface IProps {
  webLinks: ReactNode;
}

const DownloadAppContentDesktop: FC<IProps> = ({ webLinks }) => {
  return (
    <div className={`${CLASSNAME}__content-desktop`}>
      <div className={`${CLASSNAME}__col-left`}>
        <img
          src="/img/download-app-phones.png"
          className={`${CLASSNAME}__phones-image`}
        />
      </div>
      <div className={`${CLASSNAME}__col-right`}>
        <div>
          <img
            src="/img/download-app-logo.svg"
            alt=""
            className={`${CLASSNAME}__logo-image`}
          />
        </div>
        <div className={`${CLASSNAME}__app-links`}>
          скачать приложение для Android в{' '}
          <Popover
            content={<QrAndroind />}
            placement="top"
            trigger="click"
            overlayClassName="app-qr-popover"
          >
            <img
              src="/img/download-app-google-link.svg"
              alt=""
              className={`${CLASSNAME}__store-img`}
              style={{ marginTop: 1 }}
            />
          </Popover>{' '}
          <br />и для iOS в{' '}
          <Popover
            content={<QrIos />}
            placement="top"
            trigger="click"
            overlayClassName="app-qr-popover"
          >
            <img
              src="/img/download-app-apple-link.svg"
              alt=""
              className={`${CLASSNAME}__store-img`}
            />
          </Popover>
        </div>
        {webLinks}
      </div>
    </div>
  );
};

export default DownloadAppContentDesktop;
