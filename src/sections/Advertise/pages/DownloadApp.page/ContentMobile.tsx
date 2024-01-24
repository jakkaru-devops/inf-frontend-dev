import { DOWNLOAD_APP_CLASSNAME } from './data';
import { FC, ReactNode } from 'react';

const CLASSNAME = DOWNLOAD_APP_CLASSNAME;

interface IProps {
  webLinks: ReactNode;
}

const DownloadAppContentMobile: FC<IProps> = ({ webLinks }) => {
  return (
    <div className={`${CLASSNAME}__content-mobile`}>
      <div>
        <img
          src="/img/download-app-logo.svg"
          alt=""
          className={`${CLASSNAME}__logo-image`}
        />
      </div>
      <div className={`${CLASSNAME}__app-links`}>
        <div className="mb-10">скачать приложение для Android в</div>
        <a href="market://details?id=com.inf.market">
          <img
            src="/img/download-app-google-link.svg"
            alt=""
            className={`${CLASSNAME}__store-img`}
            style={{ marginTop: 1 }}
          />
        </a>
        <div className="mt-15 mb-10">и для iOS в</div>
        <a href="https://apps.apple.com/tr/app/inf-%D0%B0%D0%B2%D1%82%D0%BE%D0%B7%D0%B0%D0%BF%D1%87%D0%B0%D1%81%D1%82%D0%B8/id6448314059">
          <img
            src="/img/download-app-apple-link.svg"
            alt=""
            className={`${CLASSNAME}__store-img`}
          />
        </a>
      </div>
      <div>
        <img
          src="/img/download-app-phones.png"
          className={`${CLASSNAME}__phones-image`}
        />
      </div>
      {webLinks}
    </div>
  );
};

export default DownloadAppContentMobile;
