import { KeyValueItem } from 'components/common';
import { FC, Fragment } from 'react';
import { IUser } from 'sections/Users/interfaces';
import { formatPhoneNumber } from 'utils/common.utils';

interface IProps {
  user: IUser;
  refundsNumber: number;
}

const SellerInfoTabContentCustomer: FC<IProps> = ({ user, refundsNumber }) => {
  return (
    <Fragment>
      <KeyValueItem
        keyText="Телефон продавца"
        value={formatPhoneNumber(user.phone)}
        inline={false}
        className="mb-15"
      />
      <KeyValueItem
        keyText="Электронная почта"
        value={user.email}
        inline={false}
        className="mb-15"
      />
      <KeyValueItem
        keyText="Количество сделок"
        value={user.salesNumber || 0}
        inline={false}
        className="mb-15"
      />
      <KeyValueItem
        keyText="Количество возвратов"
        value={refundsNumber || 0}
        inline={false}
      />
    </Fragment>
  );
};

export default SellerInfoTabContentCustomer;
