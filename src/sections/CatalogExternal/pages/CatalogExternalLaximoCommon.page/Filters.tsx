import {
  ILaximoCatalogInfo,
  ILaximoVehicle,
  LaximoFeaturesEnum,
} from '../../interfaces';
import SearchWithVinOrFrame from './SearchWithVinOrFrame';
import CatalogExternalLaximoSearchWithParams from './SearchWithParams';
import SearchWithChassis from './SearchWithChassis';
import SearchWithDetail from './SearchWithDetail';
import _ from 'lodash';
import { useRouter } from 'next/router';
import { FC, Fragment, useEffect, useState } from 'react';

type LaximoFeaturesFlags = {
  [Property in keyof typeof LaximoFeaturesEnum]?: boolean;
};

interface ICatalogExternalLaximoCommonPageProps {
  catalogInfo: ILaximoCatalogInfo;
  onVehicleClick?: (car: ILaximoVehicle) => Promise<void>;
}

const CatalogExternalLaximoFilters: FC<
  ICatalogExternalLaximoCommonPageProps
> = ({ catalogInfo, onVehicleClick }) => {
  const [features, setFeatures] = useState<LaximoFeaturesFlags>();
  const router = useRouter();

  useEffect(() => {
    catalogInfo.operations?.map(operation => {
      const keyName = Object.entries(LaximoFeaturesEnum).find(
        ([_, val]) => val === operation.name,
      )?.[0];
      setFeatures(prevState => {
        return { ...prevState, [keyName]: true };
      });
    });
    catalogInfo.features.map(feature => {
      const keyName = Object.entries(LaximoFeaturesEnum).find(
        ([_, val]) => val === feature.name,
      )?.[0];
      setFeatures(prevState => {
        return { ...prevState, [keyName]: true };
      });
    });
  }, []);

  const typeName =
    router.query.laximoType == 'cars'
      ? 'Легковые (иномарки)'
      : 'Грузовые (иномарки)';

  const catalogUrl =
    router.query.laximoType == 'cars' ? 'CARS_FOREIGN' : 'TRUCKS_FOREIGN';

  const hleb = [
    { name: 'Каталог', url: '/catalog' },
    {
      name: typeName,
      url: catalogUrl,
    },
    {
      name: catalogInfo?.name,
      url: `${catalogInfo?.code}?laximoType=${router.query.laximoType}`,
    },
  ];

  return (
    <Fragment>
      {features?.VIN_SEARCH && (
        <SearchWithVinOrFrame onVehicleClick={onVehicleClick} />
      )}
      {features?.WIZARD_SEARCH && (
        <CatalogExternalLaximoSearchWithParams
          catalogCode={catalogInfo.code}
          laximoType={catalogInfo.urlType}
          onVehicleClick={onVehicleClick}
        />
      )}
      {features?.SEARCH_BY_CHASSIS && (
        <SearchWithChassis
          operations={_.find(catalogInfo.operations, {
            description: 'Search by chassis',
          })}
          onVehicleClick={onVehicleClick}
        />
      )}
      {features?.DETAIL_APPLICABILITY && (
        <SearchWithDetail onVehicleClick={onVehicleClick} />
      )}
    </Fragment>
  );
};

export default CatalogExternalLaximoFilters;
