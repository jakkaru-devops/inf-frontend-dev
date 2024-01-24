import { Button } from 'antd';
import { InputNumber, Link, Modal, Table } from 'components/common';
import { IModalPropsBasic } from 'components/common/Modal/interfaces';
import { APP_PATHS } from 'data/paths.data';
import { FC, Fragment, useState } from 'react';
import {
  IOrder,
  IOrderAttachment,
  IOrderRequest,
  IRequestProduct,
} from 'sections/Orders/interfaces';
import ordersService from 'sections/Orders/orders.service';
import { generateInnerUrl, openNotification } from 'utils/common.utils';

interface IProps extends IModalPropsBasic {
  orderId: IOrderRequest['id'];
  offerId: IOrder['id'];
  offerProducts: IRequestProduct[];
  commission: number;
  commissionType: IOrderRequest['commissionType'];
  onSuccess: (attachment: IOrderAttachment) => void;
}

const GenerateAcceptanceActModal: FC<IProps> = ({
  orderId,
  offerId,
  offerProducts,
  commission,
  commissionType,
  onSuccess,
  ...modalProps
}) => {
  if (!modalProps?.open) return <></>;

  const [products, setProducts] = useState(
    offerProducts
      .filter(
        offerProduct =>
          (offerProduct.transferedQuantity || 0) < offerProduct.count,
      )
      .map(
        offerProduct =>
          ({
            ...offerProduct,
            count: offerProduct.count - (offerProduct.transferedQuantity || 0),
            quantity:
              offerProduct.count - (offerProduct.transferedQuantity || 0),
            maxQuantity:
              offerProduct.count - (offerProduct.transferedQuantity || 0),
          } as IRequestProduct),
      ),
  );
  const [submitting, setSubmitting] = useState(false);
  const totalQuantity = products
    .map(product => product.quantity)
    .reduce((a, b) => a + b, 0);
  const totalPrice = products
    .map(product => product.quantity * product.unitPrice)
    .reduce((a, b) => a + b, 0);
  const commissionSum = (totalPrice / 100) * (commission || 0);
  let commissionTitle = 'Комиссия';

  if (commissionType === 'acquiring')
    commissionTitle = 'Комиссия по эквайрингу';
  if (commissionType === 'invoice') commissionTitle = 'Комиссия по счету';

  const handleProductQuantityChange = (value: number, i: number) => {
    products[i].quantity = value;
    setProducts([...products]);
  };

  const deleteProduct = (i: number) => {
    if (products.length <= 1) return;
    setProducts(prev => prev.filter((__, index) => index !== i));
  };

  const getAcceptanceAct = async () => {
    if (submitting) return;

    setSubmitting(true);
    const res = await ordersService.getAcceptanceActDocument({
      orderId,
      offerId,
      products: products.map(product => ({
        id: product.id,
        quantity: product.quantity,
      })),
    });
    setSubmitting(false);

    if (!res.isSucceed) {
      openNotification(res?.message);
      return;
    }

    modalProps.onClose();
    openNotification('Акт сформирован');
    onSuccess(res.data.attachment);
  };

  return (
    <Modal {...modalProps} width={800} hideCloseIcon>
      <Table
        cols={[
          { content: '', width: '5%' },
          { content: 'Наименование', width: '24%' },
          { content: 'Производитель', width: '15%' },
          { content: 'Артикул', width: '15%' },
          { content: 'Кол-во', width: '11%' },
          { content: 'Цена за ед., ₽', width: '15%', highlightBorder: true },
          { content: 'Сумма, ₽', width: '15%' },
        ]}
        rows={products.map((product, i) => ({
          cols: [
            {
              content: (
                <button
                  className="no-bg no-border d-flex align-items-center cursor-pointer"
                  onClick={() => deleteProduct(i)}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M14.8672 12.4405L12.8569 14.4508L1.32659 2.92048L3.33688 0.910188L14.8672 12.4405ZM15.0867 2.8396L2.84009 15.0862L0.70271 12.9488L12.9493 0.702227L15.0867 2.8396Z"
                      fill="#E5332A"
                    />
                  </svg>
                </button>
              ),
            },
            {
              content: (
                <div>
                  {!!product?.product ? (
                    <Link
                      href={generateInnerUrl(
                        APP_PATHS.PRODUCT(product?.product?.id),
                        {
                          text: product?.product?.name,
                        },
                      )}
                      className="color-black"
                    >
                      {product?.altName || product?.product?.name}
                    </Link>
                  ) : (
                    product?.altName || product?.reserveName
                  )}
                </div>
              ),
            },
            {
              content:
                product?.altManufacturer ||
                product?.product?.manufacturer ||
                product?.reserveManufacturer ||
                '-',
            },
            {
              content:
                product?.altArticle ||
                product?.product?.article ||
                product?.reserveArticle,
            },
            {
              // content: product.quantity,
              content: (
                <InputNumber
                  value={product.quantity}
                  onChange={value => {
                    handleProductQuantityChange(value, i);
                  }}
                  precision={0}
                  min={1}
                  max={product.maxQuantity}
                  keyboard={false}
                  size="small"
                  showControls
                  textCenter
                  colorPrimary
                  widthSmall
                />
              ),
            },
            { content: product.unitPrice.roundFraction().separateBy(' ') },
            {
              content: (product.quantity * product.unitPrice)
                .roundFraction()
                .separateBy(' '),
            },
          ],
        }))}
      />
      <table className="table">
        <tbody>
          <tr className="sub-table">
            <td className="sub-table__item">Итого:</td>
            <td className="sub-table__item" style={{ width: '11%' }}>
              {totalQuantity}
            </td>
            <td
              className="sub-table__item border-highlighted"
              style={{ width: '15%' }}
            ></td>
            <td className="sub-table__item" style={{ width: '15%' }}>
              {totalPrice.roundFraction().separateBy(' ')}
            </td>
          </tr>
          {commissionSum && (
            <Fragment>
              <tr className="sub-table">
                <td className="sub-table__item">{commissionTitle}:</td>
                <td className="sub-table__item" style={{ width: '11%' }}></td>
                <td
                  className="sub-table__item border-highlighted"
                  style={{ width: '15%' }}
                ></td>
                <td className="sub-table__item" style={{ width: '15%' }}>
                  {commissionSum.roundFraction().separateBy(' ')}
                </td>
              </tr>
              <tr className="sub-table">
                <td className="sub-table__item">За вычетом комиссии:</td>
                <td className="sub-table__item" style={{ width: '11%' }}></td>
                <td
                  className="sub-table__item border-highlighted"
                  style={{ width: '15%' }}
                ></td>
                <td className="sub-table__item" style={{ width: '15%' }}>
                  {(totalPrice - commissionSum).roundFraction().separateBy(' ')}
                </td>
              </tr>
              <tr className="sub-table"></tr>
            </Fragment>
          )}
        </tbody>
      </table>
      <div className="d-flex justify-content-end mt-20">
        <Button type="primary" loading={submitting} onClick={getAcceptanceAct}>
          Сформировать акт
        </Button>
      </div>
    </Modal>
  );
};

export default GenerateAcceptanceActModal;
