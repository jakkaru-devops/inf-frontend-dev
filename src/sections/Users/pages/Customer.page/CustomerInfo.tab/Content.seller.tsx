import { KeyValueItem } from 'components/common';
import { useLocale } from 'hooks/locale.hook';
import { FC, Fragment } from 'react';
import { ICustomerCounters, IUser } from 'sections/Users/interfaces';
import { formatPhoneNumber } from 'utils/common.utils';

interface IProps {
  user: IUser;
  counters: ICustomerCounters;
}

const CustomerInfoTabContentSeller: FC<IProps> = ({ user, counters }) => {
  const { locale } = useLocale();

  return (
    <Fragment>
      <KeyValueItem
        keyText={locale.other.phone}
        value={
          !user.phoneIsHidden
            ? formatPhoneNumber(user.phone)
            : 'Номер телефона скрыт'
        }
        className="mb-10"
      />
      {user?.email && (
        <KeyValueItem keyText="E-mail" value={user?.email} className="mb-10" />
      )}
      <KeyValueItem
        keyText={locale.orders.countRequests}
        value={counters.orderRequestsCount}
        className="mb-10"
      />
      <KeyValueItem
        keyText={locale.orders.countPurchases}
        value={counters.ordersCount}
        className="mb-10"
      />
      <KeyValueItem
        keyText="Возвратов"
        value={counters.refundsCount}
        className="mb-10"
      />
      <KeyValueItem
        keyText="Полученных жалоб"
        value={counters.receivedComplaintsCount}
        className="mb-10"
      />
      <KeyValueItem
        keyText="Отправленных жалоб"
        value={counters.sentComplaintsCount}
      />
    </Fragment>
  );
};

export default CustomerInfoTabContentSeller;
