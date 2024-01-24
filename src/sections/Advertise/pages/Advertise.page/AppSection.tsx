import { FC, ReactNode, RefObject } from 'react';
import { ADVERTISE_PAGE_CLASSNAME } from './data';
import { Swiper, SwiperSlide } from 'swiper/react';

const CLASSNAME = ADVERTISE_PAGE_CLASSNAME;

const ITEMS: Array<{ imgUrl: string; title: string; text: ReactNode }> = [
  {
    imgUrl: '/img/advertise/app-section-item-1.png',
    title: 'Удобные функции поиска',
    text: (
      <>
        помогут вам быстро
        <br />
        найти нужную запчасть
      </>
    ),
  },
  {
    imgUrl: '/img/advertise/app-section-item-2.png',
    title: 'Все необходимые детали',
    text: 'для ремонта и обслуживания автомобилей и спецтехники',
  },
  {
    imgUrl: '/img/advertise/app-section-item-3.png',
    title: 'Общайтесь напрямую',
    text: 'с продавцами в удобном внутреннем мессенджере',
  },
  {
    imgUrl: '/img/advertise/app-section-item-4.png',
    title: 'Широкий ассортимент',
    text: 'запчастей от ведущих производителей',
  },
];

const AdvertisePageAppSection: FC<{
  sectionRef: RefObject<HTMLDivElement>;
}> = ({ sectionRef }) => {
  return (
    <section className={`${CLASSNAME}-app-section`} ref={sectionRef}>
      <div className="container">
        <div className={`${CLASSNAME}-app-section-bg`}></div>
        <h2>Приложение для каждого автомобилиста</h2>
        <p className={`${CLASSNAME}-description text-center`}>
          Inf.market предлагает широкий ассортимент автозапчестей напряую от
          поставщиков по самым низким ценам
        </p>
        <p className={`${CLASSNAME}-description text-center`}>
          В базе более 1 400 000 автозапчастей по всей России
        </p>
        <Swiper
          spaceBetween={0}
          loop={true}
          loopedSlides={3}
          breakpoints={{
            1300: {
              enabled: false,
              centeredSlides: false,
              slidesPerView: 4,
            },
            320: {
              slidesPerView: 'auto',
              enabled: true,
              centeredSlides: true,
            },
          }}
        >
          {[...ITEMS, ...ITEMS].map((item, i) => (
            <SwiperSlide key={i}>
              <div className={`${CLASSNAME}-app-section-item`}>
                <div className={`${CLASSNAME}-app-section-item-image-wrapper`}>
                  <img src={item.imgUrl} alt="" />
                </div>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
};

export default AdvertisePageAppSection;
