import { Link, Table } from 'components/common';
import { CloseOutlined } from '@ant-design/icons';
import { APP_PATHS } from 'data/paths.data';
import { IRequestProduct } from 'sections/Orders/interfaces';
import { FC, useState } from 'react';
import { generateInnerUrl } from 'utils/common.utils';

interface IProps {
  products: IRequestProduct[];
  manipulationAvailable: boolean;
  handlers: {
    handleDeleteProducts: (productId: IRequestProduct['id']) => void;
  };
}

export const SelectedProductsList: FC<IProps> = ({
  products,
  manipulationAvailable,
  handlers: { handleDeleteProducts },
}) => {
  const [selectedProductList, setSelectedProductList] = useState(products);

  return (
    <Table
      cols={[
        { content: 'Наименование', width: '35%' },
        { content: 'Производитель', width: '20%' },
        { content: 'Артикул', width: '15%' },
        { content: 'Кол-во', width: '10%' },
        { content: 'Сумма, ₽', width: '10%' },
        { content: 'Удалить'.toLowerCase(), width: '10%' },
      ]}
      rows={selectedProductList.map(product => ({
        cols: [
          {
            content: (
              <div>
                {!!product?.product ? (
                  <Link
                    href={generateInnerUrl(
                      APP_PATHS.PRODUCT(product.product.id),
                      {
                        text: product.product.name,
                      },
                    )}
                    className="color-black"
                  >
                    {product.product.name}
                  </Link>
                ) : (
                  product?.reserveName
                )}
              </div>
            ),
          },
          {
            content:
              product?.product?.manufacturer ||
              product?.reserveManufacturer ||
              '-',
          },
          {
            content: product?.product?.article || product?.reserveArticle,
          },
          { content: product.count || '-' },
          {
            content: product.totalPrice.roundFraction().separateBy(' '),
          },
          {
            content: manipulationAvailable ? (
              <CloseOutlined
                className="text_18 color-primary"
                onClick={() => {
                  setSelectedProductList(selectedProductList =>
                    selectedProductList.filter(
                      ({ productId }) => productId !== product.product.id,
                    ),
                  );
                  handleDeleteProducts(product.product.id);
                }}
              />
            ) : null,
          },
        ],
      }))}
    />
  );
};
