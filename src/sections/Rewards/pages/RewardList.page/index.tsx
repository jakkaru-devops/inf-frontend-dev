import { API_ENDPOINTS } from 'data/paths.data';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { APIRequest } from 'utils/api.utils';
import RewardListPageContent from './content';
import { IRewardGroup } from 'sections/Orders/interfaces';
import { IRowsWithCount } from 'interfaces/common.interfaces';
import PageContainer from 'components/containers/PageContainer';
import { useAuth } from 'hooks/auth.hook';

interface IResponseData {
  rewardGroups: IRowsWithCount<IRewardGroup[]>;
  filters: {
    years: number[];
    months: string[];
  };
}

const RewardListPage = () => {
  const auth = useAuth();
  const [rewardGroups, setRewardGroups] =
    useState<IResponseData['rewardGroups']>(null);
  const [filters, setFilters] = useState<IResponseData['filters']>(null);
  const [dataLoaded, setDataLoaded] = useState(false);

  const router = useRouter();

  useEffect(() => {
    if (auth?.currentRole?.label === 'seller' && auth?.hideSellerRewards) {
      router.push('/');
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      const res = await APIRequest({
        method: 'get',
        url: API_ENDPOINTS.ORDER_REWARD_LIST,
        params: {
          year: router.query?.year,
          month: router.query?.month,
          page: router.query?.page,
          pageSize: router.query?.pageSize,
        },
        requireAuth: true,
      });
      if (res.isSucceed) {
        const data: IResponseData = res.data;
        console.log(data);
        setRewardGroups(data.rewardGroups);
        setFilters(data.filters);
      }
      setDataLoaded(true);
    };
    fetchData();
  }, [router.query]);

  return (
    <PageContainer contentLoaded={dataLoaded}>
      <RewardListPageContent rewardGroups={rewardGroups} filters={filters} />
    </PageContainer>
  );
};

export default RewardListPage;
