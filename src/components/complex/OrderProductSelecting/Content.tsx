import { useDispatch } from 'react-redux';
import { Button } from 'antd';
import { EllipsisOutlined, CloseOutlined } from '@ant-design/icons';
import classNames from 'classnames';
import { FileUpload, Link } from 'components/common';
import { APP_PATHS } from 'data/paths.data';
import { useLocale } from 'hooks/locale.hook';
import { getServerFileUrl } from 'utils/files.utils';
import { generateInnerUrl, generateUrl, renderHtml } from 'utils/common.utils';
import { DEFAULT_NAV_PATHS } from 'data/nav.data';
import { setOfferProductSelection } from 'store/reducers/offerProductSelection.reducer';
import { useOfferProductSelection } from 'hooks/offerProductSelection.hook';

const OrderProductSelectingContent = () => {
  const offerProductSelection = useOfferProductSelection();
  const dispatch = useDispatch();
  const { locale } = useLocale();

  const {
    orderRequest,
    activeProductIndex,
    products,
    describedProduct,
    isVisible,
  } = offerProductSelection;
  const product = products?.[activeProductIndex]?.product;

  return (
    <div className="order-product-selecting__wrapper">
      <Button
        className="order-product-selecting__visible-trigger"
        shape="circle"
        type="primary"
        size="large"
        onClick={() =>
          dispatch(
            setOfferProductSelection({
              ...offerProductSelection,
              isVisible: !isVisible,
            }),
          )
        }
      >
        {!offerProductSelection.isVisible ? (
          <EllipsisOutlined />
        ) : (
          <CloseOutlined />
        )}
      </Button>

      <div
        className={classNames('order-product-selecting', {
          'is-visible': isVisible,
        })}
      >
        <h3 className="order-name">
          <Link
            href={generateUrl(
              {
                history: DEFAULT_NAV_PATHS.ORDER_REQUEST(
                  orderRequest.id,
                  orderRequest.idOrder,
                ),
              },
              {
                pathname: APP_PATHS.ORDER_REQUEST(orderRequest.id),
              },
            )}
            className="text-underline"
          >
            Запрос {orderRequest.idOrder}
          </Link>
        </h3>
        {describedProduct?.productFiles?.length > 0 && (
          <div className="block mb-10">
            <div className="block__title">{locale.orders.productPhoto}</div>
            <FileUpload
              url=""
              initFiles={describedProduct.productFiles.map(({ file }) => ({
                ...file,
                url: getServerFileUrl(file.path),
              }))}
              disabled={true}
              size="small"
              hideUploadButton
            />
          </div>
        )}
        {describedProduct?.description?.trim().length > 0 && (
          <div className="block mb-10">
            <div className="block__title">{locale.orders.productDesc}</div>
            <div className="desc">
              {renderHtml(describedProduct.description)}
            </div>
          </div>
        )}
        {product ? (
          <div className="block mb-10">
            <div className="block__title">{locale.orders.selectedProduct}</div>
            <Link
              href={generateInnerUrl(APP_PATHS.PRODUCT(product.id), {
                text: product.name,
                searchParams: {
                  orderRequestId: orderRequest.id,
                },
              })}
              className="text-underline"
            >
              {product.name}
            </Link>
          </div>
        ) : (
          <div className="block mb-10">
            <div className="block__title">
              {locale.orders.noSelectedProduct}
            </div>
          </div>
        )}

        <div className="block">
          <div className="block__title">
            {locale.catalog.noProductInCatalog}
          </div>
          <Link
            href={`${APP_PATHS.ADD_PRODUCT_OFFER}?orderRequestId=${orderRequest.id}`}
            className="text-underline"
          >
            {locale.digitization.digitizeProduct}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderProductSelectingContent;
