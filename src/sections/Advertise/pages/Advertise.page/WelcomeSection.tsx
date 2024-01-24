import { Popover } from 'antd';
import AdvertisePageLogoText from './LogoText';
import { ADVERTISE_PAGE_CLASSNAME } from './data';
import { FC } from 'react';
import { ISetState } from 'interfaces/common.interfaces';

const CLASSNAME = ADVERTISE_PAGE_CLASSNAME;

interface IProps {
  navOpen: boolean;
  setNavOpen: ISetState<boolean>;
  scrollToAppSection: () => void;
  scrollToDownloadSection: () => void;
}

const AdvertisePageWelcomeSection: FC<IProps> = ({
  navOpen,
  setNavOpen,
  scrollToAppSection,
  scrollToDownloadSection,
}) => {
  const renderNav = (className: string) => (
    <nav className={className}>
      <a
        href="#app"
        onClick={e => {
          e.preventDefault();
          scrollToAppSection();
        }}
      >
        О приложении
      </a>
      <a
        href="#download"
        onClick={e => {
          e.preventDefault();
          scrollToDownloadSection();
        }}
      >
        Скачать
      </a>
      <a href="/">Сайт</a>
    </nav>
  );

  return (
    <section className={`${CLASSNAME}-welcome-section dark`}>
      <div className="container">
        <div className="row">
          <div className="col col-left">
            <img
              src="/img/advertise/phones.png"
              className={`${CLASSNAME}-welcome-section-phones`}
              alt=""
            />
          </div>
          <div className="col col-right">
            <div className="nav-wrapper">
              {renderNav('nav-desktop')}
              <div className="nav-mobile-wrapper">
                <Popover
                  content={renderNav('nav-mobile')}
                  placement="bottomLeft"
                  trigger="click"
                  overlayClassName={`${CLASSNAME}-welcome-section-nav-popover`}
                  open={navOpen}
                  onOpenChange={open => setNavOpen(open)}
                >
                  <button className="nav-button">
                    <svg
                      width="44"
                      height="30"
                      viewBox="0 0 44 30"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M3 3H41"
                        stroke="white"
                        strokeWidth="6"
                        strokeLinecap="round"
                      />
                      <path
                        d="M3 15H41"
                        stroke="white"
                        strokeWidth="6"
                        strokeLinecap="round"
                      />
                      <path
                        d="M3 27H41"
                        stroke="white"
                        strokeWidth="6"
                        strokeLinecap="round"
                      />
                    </svg>
                  </button>
                </Popover>
              </div>

              <div className="logo-text-wrapper">
                <a href="/" className="logo-text">
                  <AdvertisePageLogoText />
                </a>
              </div>
            </div>
            <h2>Купить запчасти просто и быстро</h2>
            <p>
              Inf.market предлагает широкий ассортимент автозапчестей напрямую
              от поставщиков по самым низким ценам
            </p>
            <div className={`${CLASSNAME}-welcome-section-apps`}>
              <a href="https://apps.apple.com/tr/app/inf-%D0%B0%D0%B2%D1%82%D0%BE%D0%B7%D0%B0%D0%BF%D1%87%D0%B0%D1%81%D1%82%D0%B8/id6448314059">
                <img src="/img/download-app-apple-link.svg" alt="" />
              </a>
              <a href="market://details?id=com.inf.market">
                <img src="/img/download-app-google-link.svg" alt="" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AdvertisePageWelcomeSection;
