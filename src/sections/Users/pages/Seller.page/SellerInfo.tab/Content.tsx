import { ISellerUpdateApplication, IUser } from 'sections/Users/interfaces';
import { FC, Fragment } from 'react';
import SellerInfoTabContentCustomer from './Content.customer';
import SellerInfoTabContentSeller from './Content.seller';
import SellerInfoTabContentManager from './Content.manager';
import { ISetState } from 'interfaces/common.interfaces';
import { IOrganizationBranch } from 'sections/Organizations/interfaces';
import { useAuth } from 'hooks/auth.hook';

interface IProps {
  user: IUser;
  refundsNumber: number;
  updateApplication: ISellerUpdateApplication;
  setUpdateApplication: ISetState<ISellerUpdateApplication>;
  orgBranches: IOrganizationBranch[];
}

const SellerInfoTabContent: FC<IProps> = data => {
  const auth = useAuth();

  return (
    <Fragment>
      {auth?.currentRole?.label === 'customer' && (
        <SellerInfoTabContentCustomer {...data} />
      )}
      {auth?.currentRole?.label === 'seller' && (
        <SellerInfoTabContentSeller {...data} />
      )}
      {['manager', 'operator'].includes(auth?.currentRole?.label) && (
        <SellerInfoTabContentManager {...data} />
      )}
    </Fragment>
  );
};

export default SellerInfoTabContent;
