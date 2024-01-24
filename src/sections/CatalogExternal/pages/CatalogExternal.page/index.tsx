import PageContainer from 'components/containers/PageContainer';
import { API_ENDPOINTS } from 'data/paths.data';
import { useState, useEffect } from 'react';
import { APIRequest } from 'utils/api.utils';
import CatalogExternalPageContent from './Content';
import { IAutoTypeExternal } from 'sections/Catalog/interfaces/categories.interfaces';

const CatalogExternalPage = () => {
  const [autoTypes, setAutoTypes] = useState<IAutoTypeExternal[]>(null);

  useEffect(() => {
    const fetchData = async () => {
      const res = await APIRequest({
        method: 'get',
        url: API_ENDPOINTS.ACAT_AUTO_TYPE_LIST,
      });
      if (!res.isSucceed) return;
      setAutoTypes(res.data);
    };
    fetchData();
  }, []);

  return (
    <PageContainer contentLoaded={!!autoTypes}>
      <CatalogExternalPageContent autoTypes={autoTypes} />
    </PageContainer>
  );
};

export default CatalogExternalPage;
