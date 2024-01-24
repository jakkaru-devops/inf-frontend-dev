import {
  DeliveryAddressModal,
  PageContent,
  Preloader,
  Summary,
  TabGroup,
} from 'components/common';
import { FC, Fragment } from 'react';
import { generateInnerUrl } from 'utils/common.utils';
import CartOffer from './Offer';
import { Button } from 'antd';
import { useLocale } from 'hooks/locale.hook';
import { APP_PATHS } from 'data/paths.data';
import classNames from 'classnames';
import { useSellersTabHandlers } from './sellersTabHandlers';
import { IJuristicSubject } from 'sections/JuristicSubject/interfaces';

interface IProps {
  customerOrganizations: IJuristicSubject[];
}

const CartSellersTab: FC<IProps> = ({ customerOrganizations }) => {
  const { locale } = useLocale();
  const {
    router,
    dataLoaded,
    offers,
    setOffer,
    updateAwaiting,
    transportCompanies,
    deliveryAddress,
    cartProductsForCart,
    paymentAllowed,
    deliveryAddressModalOpen,
    setDeliveryAddressModalOpen,
    setDeliveryAddress,
    updateCartProduct,
    updateCartOffer,
    deleteCartProduct,
    createPricedOrder,
  } = useSellersTabHandlers();

  return (
    <Fragment>
      <PageContent
        className="h-100-flex cart__page-content"
        containerProps={{ style: { paddingTop: 10 } }}
      >
        <TabGroup list={[]}>
          {dataLoaded ? (
            <Fragment>
              {offers.map((offer, i) => (
                <CartOffer
                  key={`${offer.seller.id}-${offer.organization.id}`}
                  offer={offer}
                  setOffer={setOffer}
                  offerIndex={i}
                  updateCartProduct={updateCartProduct}
                  updateCartOffer={updateCartOffer}
                  deleteCartProduct={deleteCartProduct}
                  updateAwaiting={updateAwaiting}
                  transportCompanies={transportCompanies}
                  deliveryAddress={deliveryAddress}
                  customerOrganizations={customerOrganizations}
                />
              ))}
              {!offers.length && (
                <div className="d-flex">
                  <h2 className="mb-0 mr-15">
                    Товары еще не добавлены в корзину
                  </h2>
                  <Button
                    className="cart__control-btn"
                    type="primary"
                    onClick={() =>
                      router.push(generateInnerUrl(APP_PATHS.CATALOG))
                    }
                  >
                    {locale.other.backToCatalog}
                  </Button>
                </div>
              )}
            </Fragment>
          ) : (
            <div>
              <Preloader />
            </div>
          )}
        </TabGroup>
      </PageContent>

      {cartProductsForCart.length > 0 && (
        <Summary containerClassName="justify-content-end">
          <Button
            className="cart__control-btn gray"
            onClick={() => router.push(generateInnerUrl(APP_PATHS.CATALOG))}
          >
            {locale.other.backToCatalog}
          </Button>
          <Button
            className="cart__control-btn gray ml-10"
            onClick={() => setDeliveryAddressModalOpen(true)}
          >
            {locale.other.selectDeliveryPoint}
          </Button>
          <Button
            type="primary"
            className={classNames('cart__control-btn ml-10', {
              disabled: !paymentAllowed,
            })}
            style={{ minWidth: 180 }}
            onClick={createPricedOrder}
          >
            Оформить заказ
          </Button>
        </Summary>
      )}

      <DeliveryAddressModal
        address={deliveryAddress}
        setAddress={setDeliveryAddress}
        open={deliveryAddressModalOpen}
        onCancel={() => setDeliveryAddressModalOpen(false)}
        allowControl={true}
        title={locale.orders.deliveryAddress}
      />
    </Fragment>
  );
};

export default CartSellersTab;
