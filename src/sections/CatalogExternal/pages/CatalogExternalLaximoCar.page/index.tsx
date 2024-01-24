import { useEffect, useState } from 'react';
import { APIRequest } from 'utils/api.utils';
import { API_ENDPOINTS } from 'data/paths.data';
import { useRouter } from 'next/router';
import {
  ILaximoGroupsTree,
  ILaximoVehicle,
  LaximoUrlType,
} from '../../interfaces';
import PageContainer from 'components/containers/PageContainer';
import CatalogExternalLaximoCarPageContent from './Content';
import { ILaximoNodesData } from './NodeList';

const CatalogExternalLaximoCarPage = () => {
  const router = useRouter();
  const [carInfo, setCarInfo] = useState<ILaximoVehicle | undefined>();
  const [groups, setGroups] = useState<ILaximoGroupsTree | undefined>();
  const [currentSsd, setCurrentSsd] = useState<string | undefined>();
  const [nodesData, setNodesData] = useState<ILaximoNodesData>();

  useEffect(() => {
    APIRequest({
      method: 'get',
      url: API_ENDPOINTS.LAXIMO_CAR_INFO(
        router?.query?.laximoType.toString() as LaximoUrlType,
      ),
      params: {
        catalogCode: router.query.catalogCode,
        ssd: router.query.ssd,
        vehicleId: router.query.vehicleId,
      },
    }).then(res => {
      setCarInfo(res.data.carInfo);
      setGroups(res.data.quickList);
      setCurrentSsd(res.data.carInfo.ssd);
    });
  }, []);

  useEffect(() => {
    APIRequest({
      method: 'get',
      url: API_ENDPOINTS.LAXIMO_UNITS(
        router?.query?.laximoType.toString() as LaximoUrlType,
      ),
      params: {
        vehicleId: router.query.vehicleId,
        catalogCode: router.query.catalogCode,
        ssd: router.query.ssd,
      },
    }).then(res => {
      setNodesData(res.data);
      console.log('res.data', res.data);
    });
  }, [currentSsd]);

  return (
    <PageContainer contentLoaded={!!carInfo && !!nodesData}>
      <CatalogExternalLaximoCarPageContent
        carInfo={carInfo}
        groups={groups}
        nodesData={nodesData}
        setNodesData={setNodesData}
        currentSsd={currentSsd}
      />
    </PageContainer>
  );
};

export default CatalogExternalLaximoCarPage;
