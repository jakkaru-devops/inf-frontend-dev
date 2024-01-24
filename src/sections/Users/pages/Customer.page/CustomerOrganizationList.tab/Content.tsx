import { ISetState, IRowsWithCount } from 'interfaces/common.interfaces';
import { FC, Fragment, useContext, useEffect } from 'react';
import { IJuristicSubject } from 'sections/JuristicSubject/interfaces';
import { IUser } from 'sections/Users/interfaces';
import CustomerOrganizationListTabContentCustomer from './Content.customer';
import CustomerOrganizationListTabContentSeller from './Content.seller';
import CustomerOrganizationListTabContentManager from './Content.manager';
import { Context } from '../context';
import { Pagination } from 'components/common';
import { useAuth } from 'hooks/auth.hook';

interface IProps {
  user: IUser;
  jurSubjects: IRowsWithCount<IJuristicSubject[]>;
  setJurSubjects: ISetState<IProps['jurSubjects']>;
}

const CustomerOrganizationListTabContent: FC<IProps> = data => {
  const auth = useAuth();
  const { setSummaryContentLeft } = useContext(Context);

  useEffect(() => {
    setSummaryContentLeft(
      <>
        {data.jurSubjects.count > 0 && (
          <Pagination total={data.jurSubjects.count} pageSize={12} />
        )}
      </>,
    );
  }, []);

  return (
    <Fragment>
      {auth?.currentRole?.label === 'customer' && (
        <CustomerOrganizationListTabContentCustomer {...data} />
      )}
      {auth?.currentRole?.label === 'seller' && (
        <CustomerOrganizationListTabContentSeller {...data} />
      )}
      {['manager', 'operator'].includes(auth?.currentRole?.label) && (
        <CustomerOrganizationListTabContentManager {...data} />
      )}
    </Fragment>
  );
};

export default CustomerOrganizationListTabContent;
