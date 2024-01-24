import { ICustomerCounters, IUser } from 'sections/Users/interfaces';
import { FC, Fragment } from 'react';
import CustomerInfoTabContentCustomer from './Content.customer';
import CustomerInfoTabContentSeller from './Content.seller';
import CustomerInfoTabContentManager from './Content.manager';
import { useAuth } from 'hooks/auth.hook';

interface IProps {
  user: IUser;
  setUser: (user: IUser) => void;
  counters: ICustomerCounters;
}

const CustomerInfoTabContent: FC<IProps> = data => {
  const auth = useAuth();

  return (
    <Fragment>
      {auth?.currentRole?.label === 'customer' && (
        <CustomerInfoTabContentCustomer {...data} />
      )}
      {auth?.currentRole?.label === 'seller' && (
        <CustomerInfoTabContentSeller {...data} />
      )}
      {['manager', 'operator'].includes(auth?.currentRole?.label) && (
        <CustomerInfoTabContentManager {...data} />
      )}
    </Fragment>
  );
};

export default CustomerInfoTabContent;
