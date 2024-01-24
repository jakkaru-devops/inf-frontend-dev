import PageContainer from 'components/containers/PageContainer';
import { API_ENDPOINTS } from 'data/paths.data';
import { IRowsWithCount } from 'interfaces/common.interfaces';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import {
  IAutoBrand,
  IAutoModel,
  IAutoType,
} from 'sections/Catalog/interfaces/categories.interfaces';
import { APIRequest } from 'utils/api.utils';
import { openNotification } from 'utils/common.utils';
import AutoBrandPageContent from './Content';

const AutoBrandPage = () => {
  const router = useRouter();
  const [autoTypes, setAutoTypes] = useState<IRowsWithCount<IAutoType[]>>(null);
  const [autoBrand, setAutoBrand] = useState<IAutoBrand>(null);
  const [autoModels, setAutoModels] =
    useState<IRowsWithCount<IAutoModel[]>>(null);
  const [dataLoaded, setDataLoaded] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const autoTypesRes = await APIRequest({
        method: 'get',
        url: API_ENDPOINTS.AUTO_TYPE_LIST,
      });
      if (!autoTypesRes) {
        openNotification(autoTypesRes?.message);
        return;
      }
      setAutoTypes(autoTypesRes.data);

      const autoBrandRes = await APIRequest({
        method: 'get',
        url: API_ENDPOINTS.AUTO_BRAND(router?.query?.autoBrandId as string),
      });
      if (!autoBrandRes) {
        openNotification(autoBrandRes?.message);
        return;
      }
      setAutoBrand(autoBrandRes.data?.autoBrand);

      const res = await APIRequest({
        method: 'get',
        url: API_ENDPOINTS.AUTO_MODEL_LIST,
        params: {
          autoBrand: router?.query?.autoBrandId,
          pageSize: 'all',
          showHidden: true,
          search: router?.query?.search,
        },
      });
      if (!res.isSucceed) {
        openNotification(res?.message);
        return;
      }
      setAutoModels(res.data);

      setDataLoaded(true);
    };
    fetchData();
  }, [router?.query]);

  return (
    <PageContainer contentLoaded={dataLoaded}>
      <AutoBrandPageContent
        autoTypes={autoTypes}
        autoBrand={autoBrand}
        autoModels={autoModels}
        setAutoModels={setAutoModels}
      />
    </PageContainer>
  );
};

export default AutoBrandPage;
