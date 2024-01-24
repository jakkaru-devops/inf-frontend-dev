import { FC, useState } from 'react';
import { useRouter } from 'next/router';
import {
  ICatalogExternalPageEnum,
  ILaximoGroupsTree,
  ILaximoVehicle,
} from '../../interfaces';
import { setCatalogExternalPageType } from 'store/reducers/catalogExternal.reducer';
import { useDispatch } from 'react-redux';
import { Container, Page, PageTop } from 'components/common';
import { CatalogExternalBreadCrumbs } from 'sections/CatalogExternal/components/CatalogExternalBreadCrumbs';
import LaximoNodeList, { ILaximoNodesData } from './NodeList';
import { ISetState } from 'interfaces/common.interfaces';
import LaximoGroupsWrapper from './Groups';

interface IProps {
  carInfo: ILaximoVehicle;
  groups: ILaximoGroupsTree;
  nodesData: ILaximoNodesData;
  setNodesData: ISetState<ILaximoNodesData>;
  currentSsd: string;
}

const CatalogExternalLaximoCarPageContent: FC<IProps> = ({
  carInfo,
  groups,
  nodesData,
  setNodesData,
  currentSsd,
}) => {
  const router = useRouter();
  const dispatch = useDispatch();
  const [listType, setListType] = useState<'groups' | 'nodes'>('groups');

  const setUnitsList = () =>
    dispatch(setCatalogExternalPageType(ICatalogExternalPageEnum.units));
  const setGroupsSearch = () =>
    dispatch(setCatalogExternalPageType(ICatalogExternalPageEnum.groups));

  const typeName =
    router.query.laximoType == 'cars'
      ? 'Легковые (иномарки)'
      : 'Грузовые (иномарки)';

  const catalogUrl =
    router.query.laximoType == 'cars' ? 'CARS_FOREIGN' : 'TRUCKS_FOREIGN';

  const breadCrumbs = [
    { name: 'Каталог', url: '/catalog' },
    {
      name: typeName,
      url: catalogUrl,
    },
    {
      name: carInfo?.brand,
      url: `${router.query.catalogCode}?laximoType=${router.query.laximoType}`,
    },
    {
      name: carInfo?.name,
      url: `${router.query.catalogCode}/${router.query.vehicleId}?laximoType=${router.query.laximoType}&ssd=${router.query.ssd}`,
    },
  ];

  /* useEffect(() => {
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
      setUnits(res.data.quickList);
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
      setUnitsState(res.data);
    });
  }, [currentSsd]);

  const setUnitsByCategorySsd = (ssd: string, categoryId: string) => {
    APIRequest({
      method: 'get',
      url: API_ENDPOINTS.LAXIMO_UNITS(
        router?.query?.laximoType.toString() as LaximoUrlType,
      ),
      params: {
        vehicleId: router.query.vehicleId,
        catalogCode: router.query.catalogCode,
        ssd: ssd,
        categoryId: categoryId,
      },
    }).then(res => {
      setUnitsState(res.data);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }; */

  console.log('groups', groups);

  return (
    <Page>
      <CatalogExternalBreadCrumbs breadcrumbs={breadCrumbs} laximo />
      <PageTop
        title={`${carInfo.brand} ${carInfo.name}`}
        containerProps={{ size: 'fluid' }}
      />
      <Container
        size={'fluid'}
        style={{
          display: 'flex',
          flex: 1,
          paddingTop: 30,
          paddingBottom: 25,
          justifyContent: 'space-between',
        }}
        className="catalog-external__product-groups"
      >
        {listType === 'groups' && (
          <LaximoGroupsWrapper
            carInfo={carInfo}
            groups={groups}
            currentSsd={currentSsd}
            toggleList={() => setListType('nodes')}
          />
        )}
        {listType === 'nodes' && (
          <LaximoNodeList
            nodesData={nodesData}
            setNodesData={setNodesData}
            toggleList={() => setListType('groups')}
          />
        )}
      </Container>
    </Page>
  );
};

export default CatalogExternalLaximoCarPageContent;
