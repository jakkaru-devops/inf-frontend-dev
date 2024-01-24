import { Button, Checkbox } from 'antd';
import { Modal } from 'components/common';
import { IModalPropsBasic } from 'components/common/Modal/interfaces';
import { useLocale } from 'hooks/locale.hook';
import { useRouter } from 'next/router';
import { FC, useEffect, useState } from 'react';
import { IProduct } from 'sections/Catalog/interfaces/products.interfaces';
import { IOfferFilterBy } from 'sections/Offers/interfaces/offers.interfaces';
import { IRequestProduct } from 'sections/Orders/interfaces';
import { generateUrl, openNotification } from 'utils/common.utils';

interface IProps extends IModalPropsBasic {
  filterProductId: IProduct['id'];
  filterBy: IOfferFilterBy;
  requestProducts: IRequestProduct[];
}

const FILTER_BY_OPTIONS: Array<{ value: IOfferFilterBy; name: string }> = [
  { value: 'PRICE', name: '3 лучших по цене на товар' },
  { value: 'DELIVERY', name: ' 3 лучших по срокам доставки' },
];

const OffersFiltersModal: FC<IProps> = ({
  requestProducts,
  filterBy: filterByInitial,
  filterProductId: filterProductIdInitial,
  ...modalProps
}) => {
  const router = useRouter();
  const { locale } = useLocale();
  const [filterBy, setFilterBy] = useState(filterByInitial);
  const [filterProductId, setFilterProductId] = useState(
    filterProductIdInitial,
  );

  useEffect(() => setFilterBy(filterByInitial), [filterByInitial]);
  useEffect(
    () => setFilterProductId(filterProductIdInitial),
    [filterProductIdInitial],
  );

  const applyFilters = () => {
    if (!filterBy) return openNotification(locale.orders.noSelectedFilter);
    if (!filterProductId)
      return openNotification(locale.orders.noSelectedFilterProduct);
    if (!!filterBy && !!filterProductId) {
      router.push(generateUrl({ filterBy, filterProductId }));
      modalProps.onClose();
    }
  };

  const cancelFilters = () => {
    router.push(generateUrl({ filterBy: null, filterProductId: null }));
    modalProps.onClose();
  };

  return (
    <Modal {...modalProps} hideFooter>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          flexWrap: 'wrap',
          height: 'fit-content',
          width: 'fit-content',
        }}
      >
        <a
          style={{
            textDecoration: 'underline',
            marginBottom: '10px',
            color: '#db0d0d',
          }}
          onClick={cancelFilters}
        >
          Показать все предложения
        </a>

        {FILTER_BY_OPTIONS.map(option => (
          <Checkbox
            key={option.value}
            value={option.value}
            checked={filterBy === option.value}
            onChange={() => setFilterBy(option.value)}
            className="ml-0 mr-20 mb-10"
          >
            {option.name}
          </Checkbox>
        ))}

        <div style={{ borderBottom: '3px solid #EEEEEE' }}></div>

        <div style={{ maxHeight: 200, overflow: 'auto' }}>
          {requestProducts.map(requestProduct => (
            <Checkbox
              key={requestProduct.productId}
              value={requestProduct.productId}
              checked={filterProductId === requestProduct.productId}
              onChange={() => setFilterProductId(requestProduct.productId)}
              className="ml-0 mr-20 mt-10"
            >
              {requestProduct.product?.name}
            </Checkbox>
          ))}
        </div>
      </div>
      <br />

      <div className="d-flex justify-content-start">
        <Button type="primary" onClick={applyFilters} className="ml-0">
          Показать
        </Button>
      </div>
    </Modal>
  );
};

export default OffersFiltersModal;
