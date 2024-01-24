import { ADVERTISE_PAGE_CLASSNAME } from './data';

const CLASSNAME = ADVERTISE_PAGE_CLASSNAME;

const AdvertisePageRatingSection = () => {
  return (
    <section className={`${CLASSNAME}-rating-section`}>
      <div className="container">
        <div className={`${CLASSNAME}-rating-section-wrapper`}>
          <span>Рейтинг приложения:</span>
          <div className={`${CLASSNAME}-rating-section-stars`}>
            {[0, 1, 2, 3, 4].map(i => (
              <svg
                key={i}
                width="23"
                height="21"
                viewBox="0 0 23 21"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M11.5 0L14.0819 7.9463H22.4371L15.6776 12.8574L18.2595 20.8037L11.5 15.8926L4.74047 20.8037L7.32238 12.8574L0.56285 7.9463H8.91809L11.5 0Z"
                  fill="#E6332A"
                />
              </svg>
            ))}
          </div>
          <span>4.8 по отзывам более</span>
          <span>400 тысяч пользователей</span>
        </div>
      </div>
    </section>
  );
};

export default AdvertisePageRatingSection;
