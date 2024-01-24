import {
  BreadCrumbs,
  Page,
  PageContent,
  Pagination,
  Summary,
} from 'components/common';
import { APP_PATHS } from 'data/paths.data';
import { useLocale } from 'hooks/locale.hook';
import { RequestsBannedAlert } from 'sections/PersonalArea/components/RequestsBannedAlert';
import { isUserRequestsBanned } from 'sections/Users/utils';
import { generateInnerUrl } from 'utils/common.utils';
import { Button } from 'antd';
import Link from 'next/link';
import { IProduct } from 'sections/Catalog/interfaces/products.interfaces';
import { FC, Fragment } from 'react';
import { IRowsWithCount } from 'interfaces/common.interfaces';
import { useAuth } from 'hooks/auth.hook';
import SaleProductListLayoutTile from 'sections/Sale/components/SaleProductListLayoutTile';
import SaleProductListWrapper from './ProductListWrapper';

interface IProps {
  products: IRowsWithCount<IProduct[]>;
}

const SaleProductListPageContentSeller: FC<IProps> = ({ products }) => {
  const auth = useAuth();
  const { locale } = useLocale();

  return (
    <Page>
      <BreadCrumbs
        list={[
          {
            link: APP_PATHS.SALE_PRODUCT_LIST,
            text: locale.common.productSale,
          },
        ]}
      />
      <PageContent>
        <Fragment>
          <SaleProductListWrapper products={products}>
            <SaleProductListLayoutTile products={products} />
          </SaleProductListWrapper>

          {isUserRequestsBanned(auth.user, auth.currentRole.id) && (
            <RequestsBannedAlert />
          )}
        </Fragment>
      </PageContent>
      <Summary containerClassName="d-flex justify-content-between">
        <div>
          {!!products.count && (
            <Pagination total={products.count} pageSize={10} />
          )}
        </div>

        <Link href={generateInnerUrl(APP_PATHS.ADD_SALE_PRODUCT)}>
          <Button type="primary">Создать</Button>
        </Link>
      </Summary>
    </Page>
  );
};

export default SaleProductListPageContentSeller;
