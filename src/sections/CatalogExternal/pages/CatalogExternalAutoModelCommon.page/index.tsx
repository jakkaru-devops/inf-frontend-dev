import PageContainer from 'components/containers/PageContainer';
import { API_ENDPOINTS } from 'data/paths.data';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import {
  IAcatMark,
  IAcatModel,
  IAcatType,
} from 'sections/CatalogExternal/interfaces';
import { APIRequest } from 'utils/api.utils';
import CatalogExternalGroupListPage from '../CatalogExternalGroupList.page';
import CatalogExternalAutoModelModificationsPage from '../CatalogExternalAutoModelModifications.page';
import CatalogExternalPartsPage from '../CatalogExternalParts.page';
import CatalogExternalProductPage from '../CatalogExternalProduct.page';

const definePageFromData = ({
  type,
  mark,
  models,
  autoModel,
  params,
}: {
  type: IAcatType;
  mark: IAcatMark;
  models: IAcatModel[];
  autoModel: string;
  params?: string[];
}): 'groups' | 'parts' | 'modifications' | 'product' => {
  const autoModelEntity = models.find(el => el.id === autoModel);
  if (!autoModelEntity) return null;

  if (!autoModelEntity.hasModifications) {
    if (params?.length === 2) return 'product';
    if (params?.length === 1) return 'parts';
    return 'groups';
  }

  if (params?.length === 1) return 'groups';
  if (params?.length === 2) return 'parts';
  if (params?.length > 2) return 'product';
  return 'modifications';
};

const CatalogExternalAutoModelCommonPage = () => {
  const [data, setData] = useState<{
    type: IAcatType;
    mark: IAcatMark;
    models: IAcatModel[];
  }>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      const res = await APIRequest({
        method: 'get',
        url: API_ENDPOINTS.ACAT_MODEL_LIST,
        params: {
          autoType: router.query.autoType,
          autoBrand: router.query.autoBrand,
          autoModel: router.query.autoModel,
        },
      });
      if (!res.isSucceed) return;
      setData(res.data);
    };
    fetchData();
  }, []);

  const definePage = () => {
    if (!data) return;
    console.log(
      definePageFromData({
        ...data,
        autoModel: router.query?.autoModel as string,
        params: router.query?.restParams as string[],
      }),
    );
    switch (
      definePageFromData({
        ...data,
        autoModel: router.query?.autoModel as string,
        params: router.query?.restParams as string[],
      })
    ) {
      case 'groups':
        return <CatalogExternalGroupListPage />;
      case 'modifications':
        return <CatalogExternalAutoModelModificationsPage />;
      case 'parts':
        return <CatalogExternalPartsPage />;
      case 'product':
        return <CatalogExternalProductPage />;
    }
  };

  return <PageContainer contentLoaded={!!data}>{definePage()}</PageContainer>;
};

export default CatalogExternalAutoModelCommonPage;
