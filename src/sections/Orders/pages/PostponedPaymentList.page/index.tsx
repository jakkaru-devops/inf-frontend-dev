import PageContainer from 'components/containers/PageContainer';
import { IRowsWithCount } from 'interfaces/common.interfaces';
import { useEffect, useState } from 'react';
import { IPostponedPayment } from 'sections/Orders/interfaces';
import PostponedPaymentListPageContent from './Content';
import { APIRequest } from 'utils/api.utils';
import { API_ENDPOINTS_V2 } from 'data/api.data';
import { useRouter } from 'next/router';

const PostponedPaymentListPage = () => {
  const router = useRouter();
  const [postponedPayments, setPostponedPayments] =
    useState<IRowsWithCount<IPostponedPayment[]>>(null);

  const fetchData = async () => {
    const res = await APIRequest({
      method: 'get',
      url: API_ENDPOINTS_V2.postponedPayments.getList,
      params: {
        page: router.query?.page,
        pageSize: router.query?.pageSize,
      },
    });
    setPostponedPayments(res.data);
  };

  useEffect(() => {
    fetchData();
  }, [router.query]);

  return (
    <PageContainer contentLoaded={!!postponedPayments}>
      <PostponedPaymentListPageContent postponedPayments={postponedPayments} />
    </PageContainer>
  );
};

export default PostponedPaymentListPage;
