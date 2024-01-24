import { Button, Popover } from 'antd';
import {
  BreadCrumbs,
  Link,
  Page,
  PageContent,
  PageTop,
  Pagination,
  Summary,
} from 'components/common';
import { APP_PATHS } from 'data/paths.data';
import { useLocale } from 'hooks/locale.hook';
import { ISetState, IRowsWithCount } from 'interfaces/common.interfaces';
import { useRouter } from 'next/router';
import { FC, useState } from 'react';
import { IProductOffer } from 'sections/Catalog/interfaces/products.interfaces';
import { generateInnerUrl, generateUrl } from 'utils/common.utils';
import ProductOfferListTableModerator from './table.moderator';
import ProductOfferListTableSeller from './table.seller';
import { useAuth } from 'hooks/auth.hook';

interface IProps {
  productOffers: IRowsWithCount<IProductOffer[]>;
  filterMonths: number[];
  newItemsCount: number;
  setNewItemsCount: ISetState<number>;
}

const ProductOfferListPageContent: FC<IProps> = ({
  productOffers,
  filterMonths,
  newItemsCount,
  setNewItemsCount,
}) => {
  const auth = useAuth();
  const router = useRouter();
  const { locale } = useLocale();
  const [monthFilterVisible, setMonthFilterVisible] = useState(false);

  const MONTH_LIST = locale.time.months.map((el, i) => ({
    name: el[0],
    index: i,
  }));
  const selectedMonth = Number(router?.query?.month || undefined) || null;

  const handleMonthChange = (value: number) => {
    setMonthFilterVisible(false);
    router.push(
      generateUrl({
        month: value,
        page: 1,
      }),
    );
  };

  return (
    <Page>
      <BreadCrumbs
        list={[{ link: APP_PATHS.PRODUCT_OFFER_LIST, text: 'Оцифровка' }]}
      />
      <PageTop
        title={
          <div className="d-flex align-items-center">
            <h2>Оцифровка</h2>
            {newItemsCount > 0 && (
              <Button
                type="default"
                className="ml-20 mt-5"
                onClick={() => {
                  router.push(generateUrl({ page: 1 }));
                  setNewItemsCount(0);
                }}
              >
                <span>Показать новые заявки</span>
                <span className="ml-15">{newItemsCount}</span>
              </Button>
            )}
          </div>
        }
      />
      <PageContent>
        {productOffers?.rows?.length > 0 ? (
          <>
            {auth?.currentRole?.label === 'moderator' && (
              <>
                {!(!productOffers.count && !selectedMonth) && (
                  <div className="mb-10">
                    Показать историю за:{' '}
                    <span>
                      <Popover
                        placement="bottomLeft"
                        content={
                          <ul>
                            <li
                              onClick={() => handleMonthChange(null)}
                              className="text-underline color-primary-hover cursor-pointer"
                            >
                              Всё время
                            </li>
                            {MONTH_LIST.filter(month =>
                              filterMonths.includes(month.index),
                            ).map(month => (
                              <li
                                key={month.name}
                                onClick={() =>
                                  handleMonthChange(month.index + 1)
                                }
                                className="text-underline color-primary-hover cursor-pointer"
                              >
                                {month.name}
                              </li>
                            ))}
                          </ul>
                        }
                        trigger="click"
                        open={monthFilterVisible}
                        onOpenChange={value => setMonthFilterVisible(value)}
                      >
                        <span className="color-primary text-underline cursor-pointer">
                          {MONTH_LIST?.[selectedMonth - 1]?.name || 'Всё время'}
                        </span>
                      </Popover>
                    </span>
                  </div>
                )}
                <ProductOfferListTableModerator productOffers={productOffers} />
              </>
            )}
            {auth?.currentRole?.label === 'seller' && (
              <ProductOfferListTableSeller productOffers={productOffers} />
            )}
          </>
        ) : (
          <h3>Заявки на оцифровку не найдены</h3>
        )}
      </PageContent>
      <Summary containerClassName="d-flex justify-content-between">
        <div>
          {productOffers.count > 0 && (
            <Pagination total={productOffers.count} pageSize={10} />
          )}
        </div>
        <Link
          href={generateInnerUrl(
            auth?.currentRole?.label === 'moderator'
              ? APP_PATHS.ADD_PRODUCT
              : APP_PATHS.ADD_PRODUCT_OFFER,
          )}
        >
          <Button className="gray">Добавить товар</Button>
        </Link>
      </Summary>
    </Page>
  );
};

export default ProductOfferListPageContent;
