import { IOrganization } from 'sections/Organizations/interfaces';
import { FC, Fragment, useContext, useEffect, useState } from 'react';
import { ISetState, IRowsWithCount } from 'interfaces/common.interfaces';
import SellerOrganizationListTabContentCustomer from './Content.customer';
import SellerOrganizationListTabContentSeller from './Content.seller';
import SellerOrganizationListTabContentManager from './Content.manager';
import { Context } from '../context';
import { Pagination } from 'components/common';
import { Button, Modal } from 'antd';
import { IUser } from 'sections/Users/interfaces';
import { APIRequest } from 'utils/api.utils';
import { API_ENDPOINTS } from 'data/paths.data';
import { openNotification } from 'utils/common.utils';
import { useAuth } from 'hooks/auth.hook';

interface IProps {
  organizations: IRowsWithCount<IOrganization[]>;
  setOrganizations: ISetState<IProps['organizations']>;
  setStateCounter: ISetState<number>;
  user: IUser;
}

const SellerOrganizationListTabContent: FC<IProps> = ({
  setOrganizations,
  setStateCounter,
  ...data
}) => {
  const auth = useAuth();
  const { setSummaryContentLeft } = useContext(Context);
  const [sellerDetachAllowed, setSellerDetachAllowed] = useState(false);
  const [organization, setOrganization] = useState<IOrganization>(null);

  useEffect(() => {
    setSummaryContentLeft(
      <>
        {data.organizations.count > 0 && (
          <Pagination total={data.organizations.count} pageSize={12} />
        )}
      </>,
    );
  }, []);

  const checkOrganizationDetach = async (organizationId: string) => {
    const res = await APIRequest({
      method: 'get',
      url: API_ENDPOINTS.ORGANIZATION_SELLER_DETACH,
      params: {
        userId: data?.user?.id,
        organizationId,
      },
      requireAuth: true,
    });
    if (!res.isSucceed) {
      openNotification(res?.message);
      return;
    }
    const hasActiveOrders = res?.data?.hasActiveOrders as boolean;
    setSellerDetachAllowed(!hasActiveOrders);
    setOrganization(
      data?.organizations.rows.find(org => org.id === organizationId),
    );
  };

  const detachOrganizationSeller = async () => {
    const res = await APIRequest({
      method: 'delete',
      url: API_ENDPOINTS.ORGANIZATION_SELLER_DETACH,
      params: {
        userId: data?.user?.id,
        organizationId: organization?.id,
      },
      requireAuth: true,
    });
    if (!res.isSucceed) {
      openNotification(res?.message);
      return;
    }
    openNotification(
      ['manager', 'operator'].includes(auth?.currentRole?.label)
        ? `Продавец откреплен от организации ${organization?.name}`
        : `Вы откреплены от организации ${organization?.name}`,
    );
    setSellerDetachAllowed(false);
    setOrganization(null);
    setOrganizations(prev => ({
      count: prev.count - 1,
      rows: prev.rows.filter(org => org.id !== organization?.id),
    }));
    setStateCounter(prev => prev + 1);
  };

  return (
    <Fragment>
      {auth?.currentRole?.label === 'customer' && (
        <SellerOrganizationListTabContentCustomer {...data} />
      )}
      {auth?.currentRole?.label === 'seller' && (
        <SellerOrganizationListTabContentSeller
          {...data}
          checkOrganizationDetach={checkOrganizationDetach}
        />
      )}
      {['manager', 'operator'].includes(auth?.currentRole?.label) && (
        <SellerOrganizationListTabContentManager
          {...data}
          checkOrganizationDetach={checkOrganizationDetach}
        />
      )}

      <Modal
        open={!!organization}
        onCancel={() => setOrganization(null)}
        centered
        destroyOnClose
        title={<></>}
        footer={null}
        className="close-icon-hidden header-hidden header-border-hidden footer-hidden"
        width={500}
      >
        {sellerDetachAllowed ? (
          <>
            {['manager', 'operator'].includes(auth?.currentRole?.label) ? (
              <h2 className="text-center">
                Вы хотите открепить продавца от организации «
                {organization?.name}»
              </h2>
            ) : (
              <h2 className="text-center">
                Вы хотите открепиться от организации «{organization?.name}»
              </h2>
            )}
            <div className="d-flex justify-content-center mt-20">
              <Button
                style={{ width: 150, textAlign: 'center' }}
                className="gray mr-10"
                onClick={() => setOrganization(null)}
              >
                Отмена
              </Button>
              <Button
                style={{ width: 150, textAlign: 'center' }}
                className="gray"
                onClick={detachOrganizationSeller}
              >
                {['manager', 'operator'].includes(auth?.currentRole?.label)
                  ? 'Открепить'
                  : 'Открепиться'}
              </Button>
            </div>
          </>
        ) : (
          <>
            <h2 className="text-center">
              По организации «{organization?.name}» есть незавершенные заказы.
            </h2>
            <div className="d-flex justify-content-center mt-20">
              <Button
                style={{ width: 150, textAlign: 'center' }}
                type="primary"
                onClick={() => setOrganization(null)}
              >
                Ок
              </Button>
            </div>
          </>
        )}
      </Modal>
    </Fragment>
  );
};

export default SellerOrganizationListTabContent;
