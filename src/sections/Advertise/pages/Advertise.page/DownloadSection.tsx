import QrAndroind from 'components/complex/Footer/QrAndroind';
import AdvertisePageLogoText from './LogoText';
import { ADVERTISE_PAGE_CLASSNAME } from './data';
import QrIos from 'components/complex/Footer/QrIos';
import { FC, RefObject } from 'react';
import { ANDROID_APP_URL, IOS_APP_URL } from 'data/external.data';

const CLASSNAME = ADVERTISE_PAGE_CLASSNAME;

const AdvertisePageDownloadSection: FC<{
  sectionRef: RefObject<HTMLDivElement>;
}> = ({ sectionRef }) => {
  return (
    <section className={`${CLASSNAME}-download-section dark`} ref={sectionRef}>
      <div className="container">
        <h2>
          Скачать приложение{' '}
          <a href="/">
            <AdvertisePageLogoText />
          </a>
        </h2>
        <p className={`${CLASSNAME}-description text-center`}>
          Загрузите официальное приложение Inf.market бесплатно и пользуйтесь им
          без ограничений
        </p>
        <div className="d-table m-auto">
          <div className={`${CLASSNAME}-download-section-apps`}>
            <div className={`${CLASSNAME}-download-section-apps-item`}>
              <a href={IOS_APP_URL}>
                <img src="/img/download-app-apple-link.svg" alt="" />
              </a>
              <QrIos />
            </div>
            <div className={`${CLASSNAME}-download-section-apps-item`}>
              <a href={ANDROID_APP_URL}>
                <img src="/img/download-app-google-link.svg" alt="" />
              </a>
              <QrAndroind />
            </div>
          </div>
        </div>
        <p className={`${CLASSNAME}-description scan-qr-text text-center`}>
          Отсканируйте QR-код с помощью телефона, чтобы скачать приложение
        </p>
        <div className={`${CLASSNAME}-download-section-copyright`}>
          © ООО «ИНФИНИТУМ», 2023
        </div>
      </div>
    </section>
  );
};

export default AdvertisePageDownloadSection;
