import { useRouter } from 'next/router';
import { Button, Select } from 'antd';
import { Container, ListLayoutSwitcher } from 'components/common';
import { generateUrl } from 'utils/common.utils';
import { ICatalogRouter } from 'sections/Catalog/interfaces/catalog.interfaces';
import { Fragment, useContext, useState } from 'react';
import { ProductListContext } from './context';
import { useLocale } from 'hooks/locale.hook';
import { HamburgerIcon } from 'components/icons';
import ExternalCatalogModal from 'sections/CatalogExternal/components/ExternalCatalogModal';

interface IProps {
  showExternalCatalog?: boolean;
}
const FiltersTop = ({ showExternalCatalog }: IProps) => {
  const [externalCatalogOpen, setExternalCatalogOpen] = useState(false);
  const { locale } = useLocale();
  const router = useRouter() as ICatalogRouter;
  const { orderByOptions } = useContext(ProductListContext);

  return (
    <div className="catalog__panel">
      <Container size="middle" className="catalog__wrapper">
        <div className="catalog__pages">
          {showExternalCatalog && (
            <Fragment>
              <Button
                onClick={() => setExternalCatalogOpen(true)}
                className="catalog__sidebar__external-catalog-button justify-content-start"
              >
                <HamburgerIcon />
                {locale.pages.catalogExternal.title}
              </Button>
              <ExternalCatalogModal
                open={externalCatalogOpen}
                onClose={() => setExternalCatalogOpen(false)}
              />
            </Fragment>
          )}
        </div>
        <div className="catalog__selectes catalog__selectes_ml">
          <span>{locale.common.sort}: </span>
          <div className="catalog__selectBlock">
            <Select
              size="small"
              value={
                orderByOptions.some(el => el.value === router.query?.orderBy)
                  ? router.query.orderBy
                  : orderByOptions?.[0]?.value
              }
              onChange={value => router.push(generateUrl({ orderBy: value }))}
              style={{ width: 130 }}
              options={orderByOptions}
            />
          </div>
          <div className="catalog__selectBlock">
            <Select
              size="small"
              value={router.query?.orderDirection || 'desc'}
              onChange={value =>
                router.push(generateUrl({ orderDirection: value }))
              }
              style={{ width: 150 }}
              options={[
                { value: 'asc', label: 'По возрастанию' },
                { value: 'desc', label: 'По убыванию' },
              ]}
            />
          </div>
          <div className="catalog__selectBlock">
            <ListLayoutSwitcher
              layout={router.query.layout || 'tile'}
              onChange={value => router.push(generateUrl({ layout: value }))}
            />
          </div>
        </div>
      </Container>
    </div>
  );
};

export default FiltersTop;
