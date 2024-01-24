import { BreadCrumbs, Page, PageContent, PageTop } from 'components/common';
import { APP_PATHS } from 'data/paths.data';
import PersonalAreaNavItem from 'sections/PersonalArea/components/PersonalAreaNavItem';
import { useLocale } from 'hooks/locale.hook';
import { IPersonalAreaNavItem } from 'sections/PersonalArea/interfaces';
import { generateInnerUrl } from 'utils/common.utils';
import { useMessenger } from 'hooks/messenger.hook';

const PersonalAreaManagerContent = () => {
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
      path: generateInnerUrl(APP_PATHS.ORGANIZATION_LIST),
      text: locale.organizations.organizationList,
      img: '/img/icons/organizations.svg',
      notificationsNumber: unreadNotificationsCount.organizations,
    },
    {
      path: generateInnerUrl(APP_PATHS.CUSTOMER_LIST),
      text: locale.common.buyers,
      img: '/img/icons/customers.svg',
      notificationsNumber: unreadNotificationsCount.customers,
    },
    {
      path: generateInnerUrl(APP_PATHS.SELLER_LIST),
      text: locale.other.sellers,
      img: '/img/icons/sellers.svg',
      notificationsNumber: unreadNotificationsCount.sellers,
    },
    {
      path: generateInnerUrl(APP_PATHS.COMPLAINT_LIST),
      text: locale.other.сomplaints,
      img: '/img/icons/complaints.svg',
      notificationsNumber: unreadNotificationsCount.userComplaints,
    },
    {
      path: generateInnerUrl(APP_PATHS.REWARD_LIST),
      text: locale.common.rewards,
      img: '/img/icons/reward.svg',
    },
    {
      path: generateInnerUrl(APP_PATHS.METRICS),
      text: locale.common.metrics,
      img: '/img/icons/metrics.png',
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

export default PersonalAreaManagerContent;
