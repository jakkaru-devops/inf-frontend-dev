import { useRouter } from 'next/router';
import { Select } from 'antd';
import {
  Container,
  KeyValueItem,
  ListLayoutSwitcher,
  Pagination,
  SelectSettlementsModal,
} from 'components/common';
import { generateUrl } from 'utils/common.utils';
import { ICatalogRouter } from 'sections/Catalog/interfaces/catalog.interfaces';
import { FC, useContext, useState } from 'react';
import { useLocale } from 'hooks/locale.hook';
import { getPlural } from 'utils/languages.utils';
import _ from 'lodash';
import { ProductListContext } from 'sections/Catalog/pages/ProductList.page/context';
import { ISetState } from 'interfaces/common.interfaces';

interface IProps {
  savedRegions: any[];
  setSavedRegions: ISetState<any[]>;
}

const SaleProductsFilters: FC<IProps> = ({ savedRegions, setSavedRegions }) => {
  const { locale } = useLocale();
  const router = useRouter() as ICatalogRouter;
  const [settlementsModalOpen, setSettlementsModalOpen] = useState(false);
  const savedRegionsCount = _.uniqBy(savedRegions, 'regionId').length;
  const { products } = useContext(ProductListContext);

  const handleRegionsChange = (items: any) => {
    const ids = items.map(item => item?.fias_id);
    router.push(generateUrl({ region: ids }));
    setSavedRegions(items);
  };

  return (
    <div className="catalog__panel mt-10">
      <Container size="middle" className="catalog__wrapper">
        <div className="catalog__pages">
          <Pagination
            total={products.count}
            pageSize={Number(router.query.pageSize) || 36}
          />
        </div>
        <div className="catalog__selectes catalog__selectes_ml">
          <div className="catalog__selectBlock mr-50">
            <KeyValueItem
              keyText="Регион"
              value={
                !!savedRegionsCount
                  ? `${savedRegionsCount} ${getPlural({
                      language: 'ru',
                      num: savedRegionsCount,
                      forms: locale.plurals.region,
                    })}`
                  : 'Все'
              }
              valueClassName="text-underline"
              onValueClick={() => setSettlementsModalOpen(true)}
            />
          </div>
          <div className="catalog__selectBlock">
            <span>{locale.common.sort}: </span>
            <Select
              className="sort-filter"
              size="small"
              value={router.query.orderBy || 'price'}
              onChange={value => router.push(generateUrl({ orderBy: value }))}
              style={{ width: 130 }}
            >
              <Select.Option value="price">
                {locale.common.byPrice}
              </Select.Option>
              <Select.Option value="date">{locale.common.byDate}</Select.Option>
              <Select.Option value="name">{locale.common.byName}</Select.Option>
            </Select>
          </div>
          <div className="catalog__selectBlock">
            <ListLayoutSwitcher
              layout={router.query.layout || 'row'}
              onChange={value => router.push(generateUrl({ layout: value }))}
            />
          </div>
        </div>
      </Container>
      <SelectSettlementsModal
        open={settlementsModalOpen}
        onCancel={() => setSettlementsModalOpen(false)}
        regionsInit={savedRegions}
        onSubmit={handleRegionsChange}
        mode="sale"
      />
    </div>
  );
};

export default SaleProductsFilters;
