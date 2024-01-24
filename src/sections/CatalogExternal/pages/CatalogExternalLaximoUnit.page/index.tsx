import { useRouter } from 'next/router';
import { APIRequest } from 'utils/api.utils';
import { API_ENDPOINTS } from 'data/paths.data';
import PageContainer from 'components/containers/PageContainer';
import CatalogExternalLaximoUnitContent from './Content';
import { ILaximoCatalogInfo, LaximoUrlType } from '../../interfaces';
import { useEffect, useState } from 'react';

const CatalogExternalLaximoUnitPage = () => {
  const router = useRouter();
  const { unitId, catalogCode, ssd } = router.query;
  const [unitInfo, setUnitInfo] = useState<any>();
  const [catalogInfo, setCatalogInfo] = useState<ILaximoCatalogInfo>();
  const [carInfo, setCarInfo] = useState<any>();
  const [error, setError] = useState<boolean>();

  useEffect(() => {
    APIRequest({
      method: 'get',
      url: API_ENDPOINTS.LAXIMO_DETAIL_IN_UNIT(
        router?.query?.laximoType.toString() as LaximoUrlType,
      ),
      params: {
        unitId,
        catalogCode,
        ssd,
      },
    }).then(res => {
      res.isSucceed ? setUnitInfo(res.data) : setError(true);
    });

    APIRequest({
      method: 'get',
      url: API_ENDPOINTS.LAXIMO_CATALOG_INFO(
        router?.query?.laximoType.toString() as LaximoUrlType,
      ),
      params: {
        catalogCode: router.query.catalogCode,
      },
    }).then(res => {
      res.isSucceed ? setCatalogInfo(res.data) : setError(true);
    });

    APIRequest({
      method: 'get',
      url: API_ENDPOINTS.LAXIMO_CAR_INFO(
        router?.query?.laximoType.toString() as LaximoUrlType,
      ),
      params: {
        catalogCode: router.query.catalogCode,
        vehicleId: router.query.vehicleId,
        ssd,
      },
    }).then(res => {
      res.isSucceed ? setCarInfo(res.data) : setError(true);
    });
  }, []);

  return (
    <PageContainer contentLoaded={!!unitInfo && !!catalogInfo && !!carInfo}>
      {unitInfo && (
        <CatalogExternalLaximoUnitContent
          unit={unitInfo}
          catalog={catalogInfo}
          carInfo={carInfo}
        />
      )}
    </PageContainer>
  );
};

export default CatalogExternalLaximoUnitPage;
