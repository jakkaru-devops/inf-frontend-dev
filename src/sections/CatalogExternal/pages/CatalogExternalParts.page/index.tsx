import PageContainer from 'components/containers/PageContainer';
import { API_ENDPOINTS } from 'data/paths.data';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { APIRequest } from 'utils/api.utils';
import CatalogExternalPartsPageContent from './Content';
import { IAcatProductGroup } from 'sections/CatalogExternal/interfaces';

const CatalogExternalPartsPage = () => {
  const [data, setData] = useState<any>(null);
  const [groups, setGroups] = useState<IAcatProductGroup[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      const groupsRes = await APIRequest({
        method: 'get',
        url: API_ENDPOINTS.ACAT_GROUP_LIST,
        params: {
          autoType: router.query.autoType,
          autoBrand: router.query.autoBrand,
          autoModel: router.query.autoModel,
          modification: router.query?.restParams?.[0],
        },
      });
      setGroups(groupsRes?.data?.groups);
    };

    fetchData();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      const params = router.query?.restParams as string[];
      const modification = params?.length > 1 && params[0];
      const [parentGroup, group] = params?.pop()?.split('--');

      const res = await APIRequest({
        method: 'get',
        url: API_ENDPOINTS.ACAT_PARTS_LIST,
        params: {
          autoType: router.query.autoType,
          autoBrand: router.query.autoBrand,
          autoModel: router.query.autoModel,
          modification,
          parentGroup,
          group,
        },
      });
      if (!res.isSucceed) return;

      setData(res.data);
    };
    fetchData();
  }, [router.query]);

  return (
    <PageContainer contentLoaded={!!data}>
      <CatalogExternalPartsPageContent data={data} groups={groups} />
    </PageContainer>
  );
};

export default CatalogExternalPartsPage;
