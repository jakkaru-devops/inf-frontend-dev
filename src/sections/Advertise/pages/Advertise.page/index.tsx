import AdvertisePageWelcomeSection from './WelcomeSection';
import AdvertisePageAppSection from './AppSection';
import AdvertisePageRequestSection from './RequestSection';
import AdvertisePageRatingSection from './RatingSection';
import AdvertisePageDownloadSection from './DownloadSection';
import { ADVERTISE_PAGE_CLASSNAME } from './data';
import 'swiper/css';
import { RefObject, useRef, useState } from 'react';
import classNames from 'classnames';

const CLASSNAME = ADVERTISE_PAGE_CLASSNAME;

const AdvertisePage = () => {
  const [navOpen, setNavOpen] = useState(false);
  const appSectionRef: RefObject<HTMLDivElement> = useRef();
  const downloadSectionRef: RefObject<HTMLDivElement> = useRef();

  const scrollToSection = (ref: RefObject<HTMLDivElement>) => {
    const el = ref?.current;
    if (!el) return;
    window.scrollTo({
      top: el.offsetTop,
      behavior: 'smooth',
    });
    setNavOpen(false);
  };

  return (
    <div
      className={classNames(CLASSNAME, {
        'nav-open': navOpen,
      })}
    >
      <AdvertisePageWelcomeSection
        navOpen={navOpen}
        setNavOpen={setNavOpen}
        scrollToAppSection={() => scrollToSection(appSectionRef)}
        scrollToDownloadSection={() => scrollToSection(downloadSectionRef)}
      />
      <AdvertisePageAppSection sectionRef={appSectionRef} />
      <AdvertisePageRequestSection />
      <AdvertisePageRatingSection />
      <AdvertisePageDownloadSection sectionRef={downloadSectionRef} />
    </div>
  );
};

export default AdvertisePage;
