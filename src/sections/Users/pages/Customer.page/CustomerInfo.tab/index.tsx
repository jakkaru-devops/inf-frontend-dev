import { ICustomerCounters, IUser } from 'sections/Users/interfaces';
import CustomerInfoTabContent from './Content';
import { FC } from 'react';

interface IProps {
  user: IUser;
  setUser: (user: IUser) => void;
  counters: ICustomerCounters;
}

const CustomerInfoTab: FC<IProps> = data => {
  return <CustomerInfoTabContent {...data} />;
};

export default CustomerInfoTab;
