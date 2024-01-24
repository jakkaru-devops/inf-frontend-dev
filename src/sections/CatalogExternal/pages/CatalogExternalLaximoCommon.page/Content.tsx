import { ILaximoCatalogInfo, LaximoFeaturesEnum } from '../../interfaces';
import { Page, PageContent, PageTop } from 'components/common';
import { CatalogExternalBreadCrumbs } from '../../components/CatalogExternalBreadCrumbs';
import SearchWithVinOrFrame from './SearchWithVinOrFrame';
import CatalogExternalLaximoSearchWithParams from './SearchWithParams';
import SearchWithChassis from './SearchWithChassis';
import SearchWithDetail from './SearchWithDetail';
import _ from 'lodash';
import { useRouter } from 'next/router';
import { FC, useEffect, useState } from 'react';
import CatalogExternalLaximoFilters from './Filters';

type LaximoFeaturesFlags = {
  [Property in keyof typeof LaximoFeaturesEnum]?: boolean;
};

interface ICatalogExternalLaximoCommonPageProps {
  catalogInfo: ILaximoCatalogInfo;
}

const CatalogExternalLaximoContentPage: FC<
  ICatalogExternalLaximoCommonPageProps
> = ({ catalogInfo }) => {
  const router = useRouter();

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
    <Page>
      <CatalogExternalBreadCrumbs breadcrumbs={hleb} laximo />
      <PageTop title={catalogInfo?.name} />
      <PageContent>
        <CatalogExternalLaximoFilters catalogInfo={catalogInfo} />
      </PageContent>
    </Page>
  );
};

export default CatalogExternalLaximoContentPage;
