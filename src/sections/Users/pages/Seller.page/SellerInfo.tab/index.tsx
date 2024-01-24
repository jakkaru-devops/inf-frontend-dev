import PageContainer from 'components/containers/PageContainer';
import { API_ENDPOINTS } from 'data/paths.data';
import { FC, useEffect, useState } from 'react';
import { IOrganizationBranch } from 'sections/Organizations/interfaces';
import { ISellerUpdateApplication, IUser } from 'sections/Users/interfaces';
import { APIRequest } from 'utils/api.utils';
import SellerInfoTabContent from './Content';
import { useAuth } from 'hooks/auth.hook';

interface IProps {
  user: IUser;
  refundsNumber: number;
}

const SellerInfoTab: FC<IProps> = data => {
  const auth = useAuth();
  const [updateApplication, setUpdateApplication] =
    useState<ISellerUpdateApplication>(null);
  const [orgBranches, setOrgBranches] = useState<IOrganizationBranch[]>([]);
  const [dataLoaded, setDataLoaded] = useState(false);

  useEffect(() => {
    if (auth.currentRole.label === 'customer') return;

    const fetchData = async () => {
      const updateApplicationRes = await APIRequest({
        method: 'get',
        url: API_ENDPOINTS.SELLER_UPDATE_APPLICATION(data.user.id),
        requireAuth: true,
      });
      setUpdateApplication(
        updateApplicationRes?.data?.sellerUpdateApplication || null,
      );

      const branchesRes = await APIRequest({
        method: 'get',
        url: API_ENDPOINTS.SELLER_ORGANIZATIONS_BRANCHES,
        params: {
          sellerId: data.user.id,
        },
        requireAuth: true,
      });
      setOrgBranches(
        (branchesRes.data?.branches as IOrganizationBranch[])?.filter(
          branch => !branch?.isMain,
        ) || [],
      );

      setDataLoaded(true);
    };
    fetchData();
  }, []);

  return (
    <PageContainer
      contentLoaded={dataLoaded || auth.currentRole.label === 'customer'}
    >
      <SellerInfoTabContent
        {...data}
        updateApplication={updateApplication}
        setUpdateApplication={setUpdateApplication}
        orgBranches={orgBranches}
      />
    </PageContainer>
  );
};

export default SellerInfoTab;
