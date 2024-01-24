import PageContainer from 'components/containers/PageContainer';
import { API_ENDPOINTS } from 'data/paths.data';
import { IRowsWithCount } from 'interfaces/common.interfaces';
import { useEffect, useState } from 'react';
import { IAutoType } from 'sections/Catalog/interfaces/categories.interfaces';
import { APIRequest } from 'utils/api.utils';
import { openNotification } from 'utils/common.utils';
import AutoTypeListPageContent from './Content';

const AutoTypeListPage = () => {
  const [autoTypes, setAutoTypes] = useState<IRowsWithCount<IAutoType[]>>(null);

  useEffect(() => {
    const fetchData = async () => {
      const res = await APIRequest({
        method: 'get',
        url: API_ENDPOINTS.AUTO_TYPE_LIST,
        params: {
          pageSize: 'all',
        },
      });
      if (!res.isSucceed) {
        openNotification(res?.message);
        return;
      }
      setAutoTypes(res.data);
    };
    fetchData();
  }, []);

  return (
    <PageContainer contentLoaded={!!autoTypes}>
      <AutoTypeListPageContent autoTypes={autoTypes} />
    </PageContainer>
  );
};

export default AutoTypeListPage;
