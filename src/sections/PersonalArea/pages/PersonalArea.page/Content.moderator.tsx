import { BreadCrumbs, Page, PageContent, PageTop } from 'components/common';
import { APP_PATHS } from 'data/paths.data';
import PersonalAreaNavItem from 'sections/PersonalArea/components/PersonalAreaNavItem';
import { useLocale } from 'hooks/locale.hook';
import { IPersonalAreaNavItem } from 'sections/PersonalArea/interfaces';
import { generateInnerUrl } from 'utils/common.utils';
import { useMessenger } from 'hooks/messenger.hook';

const PersonalAreaModeratorContent = () => {
  const { unreadNotificationsCount } = useMessenger();
  const { locale } = useLocale();

  const menu: IPersonalAreaNavItem[] = [
    {
      path: generateInnerUrl(APP_PATHS.CATALOG_EXTERNAL),
      text: 'Каталог',
      img: '/img/icons/catalog.svg',
    },
    {
      path: generateInnerUrl(APP_PATHS.CATALOG),
      text: locale.catalog.spareParts,
      img: '/img/catalog.svg',
    },
    {
      path: generateInnerUrl(APP_PATHS.PRODUCT_OFFER_LIST),
      text: locale.digitization.digitization,
      img: '/img/icons/digitization.svg',
      notificationsNumber: unreadNotificationsCount.productOffers,
    },
    {
      path: generateInnerUrl(APP_PATHS.ALL_PRODUCT_CATEGORIES, {
        text: locale.navigation['product-categories'],
      }),
      text: 'Категории товаров',
      img: '/img/icons/product-categories.svg',
    },
  ];

  return (
    <Page className="personal-area-page">
      <BreadCrumbs list={[]} />
      <PageTop title={locale.common.personalArea} />
      <PageContent>
        <ul className="personal-area-page__nav-list">
          {menu.map((item, i) => (
            <PersonalAreaNavItem key={i} {...item} />
          ))}
        </ul>
      </PageContent>
    </Page>
  );
};

export default PersonalAreaModeratorContent;
