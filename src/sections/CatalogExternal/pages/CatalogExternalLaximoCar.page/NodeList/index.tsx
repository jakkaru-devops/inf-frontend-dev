import { FC, Fragment, useEffect, useState } from 'react';
import SearchWithOem from '../../CatalogExternalLaximoCommon.page/SearchUnitWithOem';
import { Button, Modal } from 'antd';
import {
  ILaximoVehicle,
  LaximoUrlType,
} from 'sections/CatalogExternal/interfaces';
import { APIRequest } from 'utils/api.utils';
import { API_ENDPOINTS } from 'data/paths.data';
import { useRouter } from 'next/router';
import { ISetState } from 'interfaces/common.interfaces';
import { Container } from 'components/common';
import Link from 'next/link';

interface ICategory {
  categoryid: string;
  code: string;
  name: string;
  parentcategoryid: string;
  selected: boolean;
  ssd: string;
  units: any;
  children?: ICategory[];
}

interface IUnit {
  attributes: Array<{ key: string; name: string; value: string }>;
  code: string;
  details: any;
  detailsByCode: any[];
  filter: string;
  imageurl: string;
  largeimageurl: string;
  name: string;
  ssd: string;
  unitid: string;
}

export interface ILaximoNodesData {
  carInfo: ILaximoVehicle;
  categories: ICategory[];
  units: IUnit[];
}

interface IPreview {
  productId: string;
  isOpen: boolean;
}

interface IProps {
  nodesData: ILaximoNodesData;
  setNodesData: ISetState<ILaximoNodesData>;
  toggleList?: () => void;
}

const LaximoNodeList: FC<IProps> = ({
  nodesData,
  setNodesData,
  toggleList,
}) => {
  const router = useRouter();
  const [unitsFromSearch, setUnitsFromSearch] = useState<any>();
  const [unitsByCategory, setUnitsByCategory] = useState<any>();
  const [preview, setPreview] = useState<IPreview[]>();
  const routeWithoutSsd = router.asPath.split('?')[0];

  useEffect(() => {
    if (unitsFromSearch) {
      setUnitsByCategory(unitsFromSearch[0].units);
      return;
    }
    setUnitsByCategory(nodesData.units);
    setPreview(
      nodesData.units.map(unit => ({
        productId: unit.unitid,
        isOpen: false,
      })),
    );
  }, [unitsFromSearch, nodesData?.units]);

  const updateNodesDataByCategorySsd = (ssd: string, categoryId: string) => {
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
      setNodesData(res.data);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  };

  const handleChooseCategory = (ssd: string, categoryId: string) => {
    setUnitsFromSearch(null);
    updateNodesDataByCategorySsd(ssd, categoryId);
  };

  const handleOpenModal = (unitId: string) => {
    const newPreview = [...preview];
    newPreview[preview.findIndex(({ productId }) => productId === unitId)] = {
      productId: unitId,
      isOpen: true,
    };
    setPreview(newPreview);
  };

  const handleCancelModal = (unitId: string) => {
    const newPreview = [...preview];
    newPreview[preview.findIndex(({ productId }) => productId === unitId)] = {
      productId: unitId,
      isOpen: false,
    };
    setPreview(newPreview);
  };

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        width: '100%',
      }}
    >
      <div>
        <SearchWithOem setUnits={setUnitsFromSearch} />
        <Button
          style={{ marginBottom: 15 }}
          type={'primary'}
          onClick={toggleList}
        >
          Поиск по группам
        </Button>
        {nodesData.categories &&
          Object.values(nodesData.categories).map((category, index) => (
            <Button
              key={index}
              style={{
                border: 'none',
                fontSize: 'large',
                fontWeight: 'bold',
                marginBottom: 5,
              }}
              onClick={() => {
                console.log(category);
                handleChooseCategory(category.ssd, category.categoryid);
              }}
            >
              {category.name}
            </Button>
          ))}
      </div>
      <div>
        {unitsByCategory?.map(unit => (
          <Fragment>
            <Container
              key={unit.id}
              style={{ marginBottom: 20 }}
              size="extraSmall"
            >
              <Container
                size="extraSmall"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  border: '1px solid #E5E5E5',
                  boxSizing: 'border-box',
                  borderRadius: 3,
                  marginRight: 15,
                  cursor: 'pointer',
                }}
              >
                <div
                  style={{
                    position: 'relative',
                    right: 118,
                    top: 5,
                  }}
                >
                  <img
                    src="/img/icons/catalog-ext-lupa.svg"
                    onClick={() => handleOpenModal(unit.unitid)}
                  />
                </div>
                <Link
                  href={[
                    routeWithoutSsd,
                    `${unit.unitid}?ssd=${unit.ssd}&laximoType=${router.query.laximoType}`,
                  ].join('/')}
                >
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <img
                      src={unit.imageurl.replace('%size%', '250')}
                      alt={unit.name}
                    />
                    <span>{`${unit.code}: ${unit.name}`}</span>
                  </div>
                </Link>
              </Container>
            </Container>
            <Modal
              open={
                preview?.find(item => item?.productId === unit?.unitid)?.isOpen
              }
              title={unit.name}
              footer={null}
              onCancel={() => handleCancelModal(unit.unitid)}
              centered
              width={700}
              wrapClassName="product-image-modal"
            >
              <img
                alt={unit.name}
                style={{ maxWidth: 900, width: '100%' }}
                src={unit.largeimageurl.replace('%size%', 'source')}
              />
            </Modal>
          </Fragment>
        ))}
      </div>
    </div>
  );
};

export default LaximoNodeList;
