import { ReactNode } from 'react';
import { ADVERTISE_PAGE_CLASSNAME } from './data';
import { Swiper, SwiperSlide } from 'swiper/react';

const CLASSNAME = ADVERTISE_PAGE_CLASSNAME;

const ITEMS: Array<{ imgUrl: string; title: string; text: ReactNode }> = [
  {
    imgUrl: '/img/advertise/request-section-item-1.png',
    title: 'Оставьте заявку',
    text: 'указав модель, фото, описав текстом или голосом',
  },
  {
    imgUrl: '/img/advertise/request-section-item-2.png',
    title: 'Запрос увидят все поставщики',
    text: 'у которых есть запчасти данной марки',
  },
  {
    imgUrl: '/img/advertise/request-section-item-3.png',
    title: 'Поставщики формируют предложение',
    text: 'предлагают цены и услувия',
  },
  {
    imgUrl: '/img/advertise/request-section-item-4.png',
    title: 'Получаете деталь',
    text: 'по самой выгодной цене и удобным условиям доставки',
  },
];

const AdvertisePageRequestSection = () => {
  return (
    <section className={`${CLASSNAME}-request-section dark`}>
      <div className="container">
        <h2>Сломалась деталь?</h2>
        <p className={`${CLASSNAME}-description text-center`}>
          Благодаря приложению Inf.market вы сможете найти деталь по всей России
          <br />
          по самой низкой цене и удобным срокам и способам доставки
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
              <div className={`${CLASSNAME}-request-section-item`}>
                <div
                  className={`${CLASSNAME}-request-section-item-image-wrapper`}
                >
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

export default AdvertisePageRequestSection;
