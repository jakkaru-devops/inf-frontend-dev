import {
  BreadCrumbs,
  KeyValueItem,
  Link,
  Page,
  PageContent,
  PageTop,
  RateString,
} from 'components/common';
import { APP_PATHS } from 'data/paths.data';
import PersonalAreaNavItem from 'sections/PersonalArea/components/PersonalAreaNavItem';
import { isUserRequestsBanned } from 'sections/Users/utils';
import { RequestsBannedAlert } from 'sections/PersonalArea/components/RequestsBannedAlert';
import { useLocale } from 'hooks/locale.hook';
import { IPersonalAreaNavItem } from 'sections/PersonalArea/interfaces';
import { generateInnerUrl, generateUrl } from 'utils/common.utils';
import { DEFAULT_NAV_PATHS } from 'data/nav.data';
import { useAuth } from 'hooks/auth.hook';
import { useMessenger } from 'hooks/messenger.hook';
import { FC } from 'react';

interface IProps {
  pendingPostponedPaymentsNumber: number;
}

const PersonalAreaSellerContent: FC<IProps> = ({
  pendingPostponedPaymentsNumber,
}) => {
  const auth = useAuth();
  const { unreadNotificationsCount } = useMessenger();
  const { locale } = useLocale();

  const menu: IPersonalAreaNavItem[] = [
    {
      path: generateInnerUrl(APP_PATHS.ORDER_REQUEST_LIST, {
        searchParams: { page: null },
      }),
      text: locale.other.requests,
      img: '/img/icons/requests.svg',
      notificationsNumber: unreadNotificationsCount.orderRequests,
      isBlocked:
        auth.isAuthenticated &&
        isUserRequestsBanned(auth.user, auth.currentRole.id),
    },
    {
      path: generateInnerUrl(APP_PATHS.ORDER_LIST, {
        searchParams: { page: null },
      }),
      text: locale.orders.myOrdersList,
      img: '/img/icons/orders.svg',
      notificationsNumber: unreadNotificationsCount.orders,
    },
    {
      path: generateInnerUrl(APP_PATHS.ORDER_HISTORY_LIST, {
        text: locale.navigation['orders-history'],
        searchParams: { page: null },
      }),
      text: locale.orders.ordersHistoryList,
      img: '/img/icons/order-history.svg',
      notificationsNumber: unreadNotificationsCount.orderHistory,
    },
    {
      path: generateInnerUrl(APP_PATHS.REFUND_LIST, {
        searchParams: { page: null },
      }),
      text: locale.other.returns,
      img: '/img/icons/refunds.svg',
      notificationsNumber: unreadNotificationsCount.refunds,
    },
    {
      path: generateInnerUrl(APP_PATHS.USER_SETTINGS, {
        text: locale.navigation['user-settings'],
      }),
      text: locale.common.accountSettings,
      img: '/img/icons/user-data.svg',
    },
    {
      path: generateInnerUrl(APP_PATHS.SELLER_PRODUCT_CATEGORIES, {
        text: locale.navigation['product-categories'],
      }),
      text: locale.common.categoriesSelecting,
      img: '/img/icons/product-categories-selecting.svg',
    },
    {
      path: generateInnerUrl(APP_PATHS.PRODUCT_OFFER_LIST),
      text: locale.digitization.digitization,
      img: '/img/icons/digitization.svg',
    },
    !auth?.hideSellerRewards && {
      path: generateInnerUrl(APP_PATHS.REWARD_LIST),
      text: locale.common.rewards,
      img: '/img/icons/reward.svg',
    },
    {
      path: generateInnerUrl(APP_PATHS.SALE_PRODUCT_LIST),
      text: locale.common.productSale,
      img: '/img/icons/sale.svg',
    },
    {
      path: generateInnerUrl(APP_PATHS.POSTPONED_PAYMENT_LIST),
      text: locale.common.postponedPayments,
      img: '/img/icons/postponed-payments.svg',
      notificationsNumber: pendingPostponedPaymentsNumber || 0,
    },
  ].filter(Boolean);

  return (
    <Page className="personal-area-page">
      <BreadCrumbs list={[]} />
      <PageTop title={locale.common.personalArea} />
      <PageContent>
        <KeyValueItem
          keyText={<span className="text-normal">{locale.common.rating}</span>}
          value={
            <Link
              href={generateUrl(
                {
                  history: DEFAULT_NAV_PATHS.USER_SETTINGS,
                  tab: 'reviews',
                },
                {
                  pathname: APP_PATHS.USER_SETTINGS,
                },
              )}
            >
              <RateString rate={(auth.user.ratingValue || 0).gaussRound(1)} />
            </Link>
          }
        />
        <ul className="personal-area-page__nav-list">
          {menu.map((item, i) => (
            <PersonalAreaNavItem key={i} {...item} />
          ))}
        </ul>

        {auth.isAuthenticated &&
          isUserRequestsBanned(auth.user, auth.currentRole.id) && (
            <RequestsBannedAlert />
          )}
      </PageContent>
    </Page>
  );
};

export default PersonalAreaSellerContent;
