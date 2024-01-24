import { MessageOutlined } from '@ant-design/icons';
import { Button, Checkbox, Popover } from 'antd';
import { KeyValueItem, Link, InputNumber } from 'components/common';
import { RateString } from 'components/common';
import { convertAddressToString } from 'components/common/YandexMap/utils';
import { startChatWithUser } from 'components/complex/Messenger/utils/messenger.utils';
import { useLocale } from 'hooks/locale.hook';
import { IOrder, IOrderRequest } from 'sections/Orders/interfaces';
import { IUser } from 'sections/Users/interfaces';
import { getUserName } from 'sections/Users/utils';
import { API_ENDPOINTS, APP_PATHS } from 'data/paths.data';
import { IAddress, ISetState } from 'interfaces/common.interfaces';
import { APIRequest } from 'utils/api.utils';
import {
  generateInnerUrl,
  millisecondsToMdhm,
  openNotification,
} from 'utils/common.utils';
import { FC, useState } from 'react';
import moment from 'moment';
import { useAuth } from 'hooks/auth.hook';

interface IProps {
  orderRequest: IOrderRequest;
  offer: IOrder;
  setOffer: (offerData: IOrder) => void;
  seller: IUser;
  setOrgBranch: ISetState<{
    address: IAddress;
    orgName: string;
  }>;
}

export const InfoText: FC<IProps> = ({
  orderRequest,
  offer,
  setOffer,
  seller,
  setOrgBranch,
}) => {
  const auth = useAuth();
  const { locale } = useLocale();

  const [isRequestedToUpdateOffer, setIsRequestedToUpdateOffer] = useState(
    offer.isRequestedToUpdateOffer,
  );

  const totalSum = offer.products
    .filter(({ isSelected }) => isSelected)
    .map(product => product.count * product.unitPrice)
    .filter(Boolean)
    .reduce((a, b) => a + b, 0);

  const displayPaymentPostpone =
    !!offer?.paymentPostponedAt &&
    (!offer?.paymentPostponeMaxSum ||
      totalSum < offer?.paymentPostponeMaxSum ||
      offer?.paymentPostponeOverMaxSumApproved);
  const displayPaymentPostponeOverSum =
    !!offer?.paymentPostponedAt &&
    !!offer?.paymentPostponeMaxSum &&
    totalSum > offer?.paymentPostponeMaxSum &&
    typeof offer?.paymentPostponeOverMaxSumApproved !== 'boolean';

  const requestToUpdateOffer = async () => {
    const res = await APIRequest({
      method: 'post',
      url: API_ENDPOINTS.REQUEST_TO_OFFER_UPDATE,
      data: { orderId: offer.id },
      requireAuth: true,
    });

    if (!res.isSucceed) return;

    setIsRequestedToUpdateOffer(true);

    openNotification('Запрос на обновление предложения отправлен');
  };

  const offerTerm =
    new Date(offer?.offerExpiresAt).getTime() - new Date().getTime();

  const handlePaidSumChange = (value: number) => {
    setOffer({
      ...offer,
      paidSum: value,
      paymentPostponeAccepted: false,
    });
  };

  const handlePaymentPostponeAccepted = (value: boolean) => {
    setOffer({
      ...offer,
      paidSum: null,
      paymentPostponeAccepted: value,
    });
  };

  return (
    <div className="d-flex justify-content-between mb-20">
      <div>
        <div
          style={{
            marginBottom: 14,
            textTransform: 'uppercase',
            fontWeight: 700,
          }}
        >
          Предложение от {offer.organization.name}
        </div>
        {displayPaymentPostpone && (
          <div style={{ fontSize: 14 }}>
            <strong
              className="color-primary"
              style={{ fontSize: 18, marginTop: -1 }}
            >
              !
            </strong>{' '}
            Продавец согласен на отсрочку до{' '}
            {moment(offer?.paymentPostponedAt).format('DD.MM.yyyy')}
          </div>
        )}
        {displayPaymentPostponeOverSum && (
          <div style={{ fontSize: 14 }}>
            <strong
              className="color-primary"
              style={{ fontSize: 18, marginTop: -1 }}
            >
              !
            </strong>{' '}
            Сумма товаров превышает максимальную сумму, согласованную для
            отсрочки. Ожидание согласования от продавца
          </div>
        )}
        {!!orderRequest?.paymentPostponedAt && (
          <div style={{ fontSize: 14 }}>
            <strong
              className="color-primary"
              style={{ fontSize: 18, marginTop: -1 }}
            >
              !
            </strong>{' '}
            Продавец не согласен на отсрочку
          </div>
        )}
        {!!offer?.products?.filter(
          ({ altName, altManufacturer, altArticle }) =>
            !!altName || !!altManufacturer || !!altArticle,
        )?.length && (
          <KeyValueItem
            keyText={null}
            noColon
            value={<strong>Продавец внес изменения в запрос!</strong>}
            style={{ marginLeft: -2 }}
          />
        )}
        <KeyValueItem
          keyText={offerTerm > 0 && 'Действует еще'}
          noColon={offerTerm <= 0}
          value={
            <>
              {offerTerm > 0
                ? millisecondsToMdhm(offerTerm, locale)
                : 'Срок предложения истек'}
              {(offer.isExpiredOffer && !isRequestedToUpdateOffer && (
                <span
                  className="red text-underline clickable ml-5"
                  onClick={requestToUpdateOffer}
                >
                  обновить
                </span>
              )) ||
                (offer?.sellerUpdatedAt && offerTerm > 0 && (
                  <span className="red ml-5">Предложение обновлено!</span>
                ))}
            </>
          }
        />
        <KeyValueItem
          keyText="Продавец"
          value={
            <span className="d-flex">
              <Link
                href={generateInnerUrl(APP_PATHS.SELLER(seller.id), {
                  text: getUserName(seller),
                })}
                className="mr-10 text-underline"
              >
                {getUserName(seller)}
              </Link>
              <Link
                href={generateInnerUrl(APP_PATHS.SELLER_REVIEWS(seller.id), {
                  text: getUserName(seller),
                })}
              >
                <RateString
                  color={'#FFB800'}
                  emptyColor={'#c4c4c4'}
                  rate={(seller.ratingValue || 0).gaussRound(1)}
                  max={5}
                  size={20}
                />
              </Link>

              <KeyValueItem
                keyText="Отзывы"
                value={seller.reviews.length}
                keyClassName="text-normal"
                className="ml-10"
              />
              <KeyValueItem
                keyText="Продаж"
                value={seller.salesNumber || 0}
                keyClassName="text-normal"
                className="ml-10"
              />
            </span>
          }
        />
        <KeyValueItem
          keyText="Адрес поставщика"
          value={convertAddressToString(offer.supplierAddress)}
          onValueClick={() =>
            setOrgBranch({
              address: offer.supplierAddress,
              orgName: offer.organization.name,
            })
          }
        />
      </div>
      <div className="d-flex align-items-end">
        {auth?.currentRole?.label === 'operator' &&
          orderRequest.status === 'APPROVED' &&
          orderRequest.payerId &&
          !!offer?.idOrder && (
            <div className="user-select-none">
              <Checkbox
                checked={offer?.paidSum >= offer?.totalPrice}
                onChange={({ target }) =>
                  handlePaidSumChange(target.checked ? offer?.totalPrice : null)
                }
                className="ml-10 mb-5"
              >
                Заказ оплачен
              </Checkbox>
              <Popover
                content={
                  <>
                    <KeyValueItem
                      keyText="Оплачено, ₽"
                      value={
                        <span>
                          <InputNumber
                            value={offer.paidSum}
                            onChange={value => handlePaidSumChange(value)}
                            min={0}
                            max={offer?.totalPrice}
                            size="small"
                            precision={2}
                            className="mr-10"
                          />
                          / {offer?.totalPrice?.roundFraction().separateBy(' ')}{' '}
                          ₽
                        </span>
                      }
                      inline={false}
                      noColon
                    />
                  </>
                }
                trigger="click"
                placement="bottom"
              >
                <Checkbox
                  className="ml-10"
                  checked={
                    !!offer?.paidSum && offer?.paidSum < offer?.totalPrice
                  }
                >
                  Заказ оплачен не полностью
                </Checkbox>
              </Popover>

              {!!offer?.paymentPostponedAt && (
                <div>
                  <Checkbox
                    checked={offer?.paymentPostponeAccepted}
                    onChange={e =>
                      handlePaymentPostponeAccepted(e.target.checked)
                    }
                    className="ml-10 mt-5"
                  >
                    Отсрочка
                  </Checkbox>
                </div>
              )}
            </div>
          )}
        <Button
          type="primary"
          onClick={() =>
            startChatWithUser({
              companionId: seller.id,
              companionRole: 'seller',
              orderRequestId: orderRequest.id,
            })
          }
        >
          {'Чат с продавцом'} <MessageOutlined />
        </Button>
      </div>
    </div>
  );
};
