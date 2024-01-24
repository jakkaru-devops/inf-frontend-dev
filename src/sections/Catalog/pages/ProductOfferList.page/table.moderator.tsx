import { Table } from 'components/common';
import { APP_PATHS } from 'data/paths.data';
import { IProductOffer } from 'sections/Catalog/interfaces/products.interfaces';
import formatDate from 'date-fns/format';
import { getUserName } from 'sections/Users/utils';
import { defineProductOfferStatus } from 'sections/Catalog/data';
import { useLocale } from 'hooks/locale.hook';
import { IRowsWithCount } from 'interfaces/common.interfaces';
import { generateInnerUrl } from 'utils/common.utils';
import { FC } from 'react';

interface IProps {
  productOffers: IRowsWithCount<IProductOffer[]>;
}

const ProductOfferListTableModerator: FC<IProps> = ({ productOffers }) => {
  const { locale } = useLocale();

  return (
    <Table
      cols={[
        { content: 'Наименование', width: '30%' },
        { content: 'Артикул', width: '15%' },
        { content: 'Дата запроса', width: '15%' },
        { content: 'Статус', width: '15%' },
        { content: 'Продавец', width: '25%' },
      ]}
      rows={productOffers.rows.map(productOffer => ({
        cols: [
          {
            content: productOffer?.product?.name || 'Товар удален',
            href: generateInnerUrl(APP_PATHS.PRODUCT_OFFER(productOffer.id), {
              text: productOffer?.product?.name || 'Товар удален',
            }),
          },
          { content: productOffer?.product?.article || 'Товар удален' },
          {
            content: formatDate(new Date(productOffer.createdAt), 'dd.MM.yyyy'),
          },
          {
            content: (
              <span
                style={{
                  color: defineProductOfferStatus(productOffer, locale).color,
                }}
              >
                {defineProductOfferStatus(productOffer, locale).status}
              </span>
            ),
          },
          { content: getUserName(productOffer.seller) },
        ],
        notificationsNumber: productOffer?.unreadNotifications?.length || 0,
      }))}
    />
  );
};

export default ProductOfferListTableModerator;
