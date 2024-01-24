import { Table } from 'components/common';
import { IProductOffer } from 'sections/Catalog/interfaces/products.interfaces';
import formatDate from 'date-fns/format';
import { APP_PATHS } from 'data/paths.data';
import { defineProductOfferStatus } from 'sections/Catalog/data';
import { useLocale } from 'hooks/locale.hook';
import { IRowsWithCount } from 'interfaces/common.interfaces';
import { generateInnerUrl } from 'utils/common.utils';
import { FC } from 'react';

interface IProps {
  productOffers: IRowsWithCount<IProductOffer[]>;
}

const ProductOfferListTableSeller: FC<IProps> = ({ productOffers }) => {
  const { locale } = useLocale();

  return (
    <Table
      cols={[
        { content: 'Наименование', width: '30%' },
        { content: 'Артикул', width: '20%' },
        { content: 'Дата запроса', width: '20%' },
        { content: 'Статус', width: '15%' },
        { content: 'Рейтинг', width: '15%' },
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
          {
            content: !!productOffer?.addedRating
              ? `+${productOffer?.addedRating}`.replace('.', ',')
              : '-',
          },
        ],
        notificationsNumber: productOffer?.unreadNotifications?.length || 0,
      }))}
    />
  );
};

export default ProductOfferListTableSeller;
