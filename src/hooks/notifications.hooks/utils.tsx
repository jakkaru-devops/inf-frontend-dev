import { Link } from 'components/common';
import { ENV } from 'config/env';
import { DEFAULT_NAV_PATHS } from 'data/nav.data';
import { APP_PATHS } from 'data/paths.data';
import { NextRouter } from 'next/router';
import { formatPhoneNumber, generateUrl } from 'utils/common.utils';
import { INotification, INotificationDataType } from './interfaces';
import { IAuthState } from 'store/reducers/auth.reducer';
import _ from 'lodash';

// To handle
// - offerToOrderRequest
// - orderPartialPayment
// - requestPaymentRefund
// - paymentRefundRequestPaid
// - offerExpired
// - requestToUpdateOffer - VERIFIED
// - offerUpdated - VERIFIED
// - orderShipped
// - orderPaid
// - orderCompleted
// - rewardPaid
// - refundProductRequest
// - refundProductAccept
// - refundProductDecline
// - refundProductComplete
// - exchangeProductRequest
// - exchangeProductAccept
// - exchangeProductDecline
// - exchangeProductComplete
// -------------------------
// - userRoleBanned - POSTPONED
// - userRoleUnbanned - POSTPONED
// - userOrderRequestsBanned - POSTPONED
// - userOrderRequestsUnbanned - POSTPONED
// - newSellerReview - COMMON, HANDLED
// - newUserComplaint - COMMON, HANDLED
// - registerOrganizationApplication - COMMON, HANDLED
// - registerOrganizationApplicationUpdated - COMMON, HANDLED
// - registerSellerApplication - COMMON, HANDLED
// - registerSellerApplicationUpdated - COMMON, HANDLED
// - organizationRegisterConfirmed - COMMON, HANDLED
// - organizationRegisterRejected - COMMON, HANDLED
// - organizationSellerRegisterConfirmed - COMMON, HANDLED
// - organizationSellerRegisterRejected - COMMON, HANDLED
// - productOfferCreated - COMMON, HANDLED
// - productOfferUpdated - COMMON, HANDLED
// - productOfferAccepted - COMMON, HANDLED
// - productOfferRejected - COMMON, HANDLED
// - orderInvoicePaymentApproved - COMMON, HANDLED
// - orderInvoicePaymentConfirmed - COMMON, HANDLED
// - orderAttachmentUploaded - COMMON, HANDLED
export const getNotificationPreview = (
  notificationData: INotification,
  {
    router,
    locale,
    auth,
  }: {
    router: NextRouter;
    locale: any;
    auth: IAuthState;
  },
) => {
  if (!notificationData || notificationData?.type === 'dummy') return null;

  // const notification = _.cloneDeep(notificationData);
  const notification = notificationData;

  if (notification.type === 'offerToOrderRequest') {
    const { idOrder, orderRequestId } =
      notification.data as INotificationDataType['offerToOrderRequest'];

    notification.text = `На запрос ${idOrder} получено предложение`;

    notification.onClick = () =>
      router.push(
        generateUrl(
          {
            history: DEFAULT_NAV_PATHS.ORDER_REQUEST_OFFER_LIST(
              orderRequestId,
              idOrder,
            ),
          },
          { pathname: APP_PATHS.ORDER_REQUEST_OFFER_LIST(orderRequestId) },
        ),
      );

    return notification;
  }

  if (notification.type === 'createOrderRequest') {
    const { idOrder, orderRequestId } =
      notification.data as INotificationDataType['createOrderRequest'];

    notification.text = `Поступил запрос ${idOrder}`;

    notification.onClick = () =>
      router.push(
        generateUrl(
          {
            history: DEFAULT_NAV_PATHS.ORDER_REQUEST(orderRequestId, idOrder),
          },
          { pathname: APP_PATHS.ORDER_REQUEST(orderRequestId) },
        ),
      );

    return notification;
  }

  if (notification.type === 'orderPartialPayment') {
    const { idOrder, orderRequestId, totalPrice, paidSum } =
      notification.data as INotificationDataType['orderPartialPayment'];

    notification.text = `Запрос ${idOrder} оплачен не полностью`;
    notification.textFull = (
      <>
        <div className="mb-10">
          Запрос {idOrder}
          <br />
          оплачен не полностью
        </div>
        <div className="mb-10">
          Сумма к оплате: {totalPrice} ₽<br />
          Оплачено: {paidSum} ₽<br />
        </div>
        <div className="mb-10">Решение:</div>
        <div className="mb-10">
          1. Доплатить
          <br />
          Сумма к доплате {totalPrice - paidSum} ₽
        </div>
        <div className="mb-10">
          2. Отредактировать запрос самостоятельно, либо с помощью продавца
        </div>
        <div className="mb-10">3. Запросить возврат денежных средств</div>
        <div>Весь функционал управления можно найти на странице с заказом</div>
      </>
    );

    notification.onClick = () =>
      router.push(
        generateUrl(
          {
            history: DEFAULT_NAV_PATHS.ORDER_REQUEST(orderRequestId, idOrder),
          },
          { pathname: APP_PATHS.ORDER_REQUEST(orderRequestId) },
        ),
      );

    return notification;
  }

  if (notification.type === 'applicationChangeTransportCompany') {
    const { idOrder, orderRequestId } =
      notification.data as INotificationDataType['applicationChangeTransportCompany'];
    notification.text = `По запросу ${idOrder} поступила заявка на изменение условий доставки`;

    notification.onClick = () =>
      router.push(
        generateUrl(
          {
            history: DEFAULT_NAV_PATHS.ORDER_REQUEST(orderRequestId, idOrder),
          },
          { pathname: APP_PATHS.ORDER_REQUEST(orderRequestId) },
        ),
      );

    return notification;
  }

  if (notification.type === 'approvedChangeTransportCompany') {
    const { idOrder, orderRequestId } =
      notification.data as INotificationDataType['applicationChangeTransportCompany'];
    notification.text = `По запросу ${idOrder} одобрены изменения по условиям доставки`;

    notification.onClick = () =>
      router.push(
        generateUrl(
          {
            history: DEFAULT_NAV_PATHS.ORDER_REQUEST(orderRequestId, idOrder),
          },
          { pathname: APP_PATHS.ORDER_REQUEST(orderRequestId) },
        ),
      );

    return notification;
  }

  if (notification.type === 'declinedChangeTransportCompany') {
    const { idOrder, orderRequestId } =
      notification.data as INotificationDataType['applicationChangeTransportCompany'];
    notification.text = `По запросу ${idOrder} отклонены изменения по условиям доставки`;

    notification.onClick = () =>
      router.push(
        generateUrl(
          {
            history: DEFAULT_NAV_PATHS.ORDER_REQUEST(orderRequestId, idOrder),
          },
          { pathname: APP_PATHS.ORDER_REQUEST(orderRequestId) },
        ),
      );

    return notification;
  }

  if (notification.type === 'requestPaymentRefund') {
    const { idOrder, orderRequestId, paidSum } =
      notification.data as INotificationDataType['requestPaymentRefund'];

    notification.text = `Запрос ${idOrder}. Запрос на возврат денежных средств (${paidSum} ₽)`;

    notification.onClick = () =>
      router.push(
        generateUrl(
          {
            history: DEFAULT_NAV_PATHS.ORDER_REQUEST(orderRequestId, idOrder),
          },
          { pathname: APP_PATHS.ORDER_REQUEST(orderRequestId) },
        ),
      );

    return notification;
  }

  if (notification.type === 'paymentRefundRequestPaid') {
    const { idOrder, orderRequestId, refundSum } =
      notification.data as INotificationDataType['paymentRefundRequestPaid'];

    notification.text = (
      <>
        По{' '}
        <Link
          href={generateUrl(
            {
              history: DEFAULT_NAV_PATHS.ORDER_REQUEST(orderRequestId, idOrder),
            },
            { pathname: APP_PATHS.ORDER_REQUEST(orderRequestId) },
          )}
          className="text-underline-hover"
        >
          Запрос {idOrder}
        </Link>{' '}
        произведен возврат денежных средств ({refundSum} ₽)
      </>
    );
    notification.onClick = () =>
      router.push(
        generateUrl(
          {
            history: DEFAULT_NAV_PATHS.ORDER_REQUEST(orderRequestId, idOrder),
          },
          { pathname: APP_PATHS.ORDER_REQUEST(orderRequestId) },
        ),
      );

    return notification;
  }

  if (notification.type === 'offerExpired') {
    const { idOrder, orderRequestId } =
      notification.data as INotificationDataType['offerExpired'];

    notification.text = `Истек срок предложения на запрос ${idOrder}`;

    notification.onClick = () =>
      router.push(
        generateUrl(
          {
            history: DEFAULT_NAV_PATHS.ORDER_REQUEST(orderRequestId, idOrder),
          },
          { pathname: APP_PATHS.ORDER_REQUEST(orderRequestId) },
        ),
      );

    return notification;
  }

  if (notification.type === 'requestToUpdateOffer') {
    const { idOrder, orderRequestId } =
      notification.data as INotificationDataType['requestToUpdateOffer'];

    notification.text = `Запрос на обновление предложения ${idOrder}`;

    notification.onClick = () =>
      router.push(
        generateUrl(
          {
            history: DEFAULT_NAV_PATHS.ORDER_REQUEST(orderRequestId, idOrder),
          },
          { pathname: APP_PATHS.ORDER_REQUEST(orderRequestId) },
        ),
      );

    return notification;
  }

  if (notification.type === 'offerUpdated') {
    const { orderRequestId, idOrder } =
      notification.data as INotificationDataType['offerUpdated'];

    notification.text = 'Предложение обновлено';

    notification.onClick = () =>
      router.push(
        generateUrl(
          {
            history: DEFAULT_NAV_PATHS.ORDER_REQUEST_OFFER_LIST(
              orderRequestId,
              idOrder,
            ),
          },
          { pathname: APP_PATHS.ORDER_REQUEST_OFFER_LIST(orderRequestId) },
        ),
      );

    return notification;
  }

  if (notification.type === 'orderShipped') {
    const { idOrder, orderRequestId } =
      notification.data as INotificationDataType['orderShipped'];

    notification.text = `Заказ ${idOrder} отгружен`;

    notification.onClick = () =>
      router.push(
        generateUrl(
          {
            history: DEFAULT_NAV_PATHS.ORDER(orderRequestId, idOrder),
          },
          { pathname: APP_PATHS.ORDER(orderRequestId) },
        ),
      );

    return notification;
  }

  if (notification.type === 'orderPaid') {
    const { idOrder, orderRequestId } =
      notification.data as INotificationDataType['orderPaid'];

    notification.text = `Заказ ${idOrder} оплачен`;

    notification.onClick = () =>
      router.push(
        generateUrl(
          {
            history: DEFAULT_NAV_PATHS.ORDER(orderRequestId, idOrder),
          },
          { pathname: APP_PATHS.ORDER(orderRequestId) },
        ),
      );

    return notification;
  }

  if (notification.type === 'orderPaymentPostponed') {
    if (!notification.data) return null;
    const { idOrder, orderRequestId } =
      notification.data as INotificationDataType['orderPaymentPostponed'];

    notification.text = `Оплата заказа ${idOrder} отложена`;

    notification.onClick = () =>
      router.push(
        generateUrl(
          {
            history: DEFAULT_NAV_PATHS.ORDER(orderRequestId, idOrder),
          },
          { pathname: APP_PATHS.ORDER(orderRequestId) },
        ),
      );

    return notification;
  }

  if (notification.type === 'receiptCreated') {
    notification.text = null;
    return notification;
  }

  if (notification.type === 'orderCompleted') {
    const { idOrder, orderRequestId } =
      notification.data as INotificationDataType['orderCompleted'];

    notification.text = `Заказ ${idOrder} завершён`;

    notification.onClick = () =>
      router.push(
        generateUrl(
          {
            history: DEFAULT_NAV_PATHS.ORDER_IN_HISTORY(
              orderRequestId,
              idOrder,
            ),
          },
          { pathname: APP_PATHS.ORDER(orderRequestId) },
        ),
      );

    return notification;
  }

  if (notification.type === 'orderBack') {
    const { idOrder, orderRequestId } =
      notification.data as INotificationDataType['orderBack'];

    notification.text = `Заказ ${idOrder} снова в работе`;

    notification.onClick = () =>
      router.push(
        generateUrl(
          {
            history: DEFAULT_NAV_PATHS.ORDER(orderRequestId, idOrder),
          },
          { pathname: APP_PATHS.ORDER(orderRequestId) },
        ),
      );

    return null;
    // return notification;
  }

  if (notification.type === 'rewardPaid') {
    const { idOrder, orderRequestId } =
      notification.data as INotificationDataType['rewardPaid'];

    notification.text = `Вознаграждение по заказу ${idOrder} выплачено`;

    notification.onClick = () =>
      router.push(
        generateUrl(
          {
            history: DEFAULT_NAV_PATHS.ORDER(orderRequestId, idOrder),
          },
          { pathname: APP_PATHS.ORDER(orderRequestId) },
        ),
      );

    return notification;
  }

  if (notification.type === 'refundProductRequest') {
    const {
      idOrder,
      orderRequestId,
      orderId: offerId,
    } = notification.data as INotificationDataType['refundProductRequest'];

    notification.text = `Запрос на возврат в заказе ${idOrder}`;

    notification.onClick = () =>
      router.push(
        generateUrl(
          {
            history: DEFAULT_NAV_PATHS.ORDER_OFFER(
              orderRequestId,
              offerId,
              idOrder,
            ),
          },
          { pathname: APP_PATHS.ORDER_OFFER(orderRequestId, offerId) },
        ),
      );

    return notification;
  }

  if (notification.type === 'refundProductAccept') {
    const {
      idOrder,
      orderRequestId,
      orderId: offerId,
    } = notification.data as INotificationDataType['refundProductAccept'];

    notification.text = `Возврат в заказе ${idOrder} одобрен`;

    notification.onClick = () =>
      router.push(
        generateUrl(
          {
            history: DEFAULT_NAV_PATHS.ORDER_OFFER(
              orderRequestId,
              offerId,
              idOrder,
            ),
          },
          { pathname: APP_PATHS.ORDER_OFFER(orderRequestId, offerId) },
        ),
      );

    return notification;
  }

  if (notification.type === 'refundProductDecline') {
    const {
      idOrder,
      orderRequestId,
      orderId: offerId,
    } = notification.data as INotificationDataType['refundProductDecline'];

    notification.text = `Возврат в заказе ${idOrder} отклонен`;

    notification.onClick = () =>
      router.push(
        generateUrl(
          {
            history: DEFAULT_NAV_PATHS.ORDER_OFFER(
              orderRequestId,
              offerId,
              idOrder,
            ),
          },
          { pathname: APP_PATHS.ORDER_OFFER(orderRequestId, offerId) },
        ),
      );

    return notification;
  }

  if (notification.type === 'refundProductComplete') {
    const {
      idOrder,
      orderRequestId,
      orderId: offerId,
    } = notification.data as INotificationDataType['refundProductComplete'];

    notification.text = `Возврат в заказе ${idOrder} завершен`;

    notification.onClick = () =>
      router.push(
        generateUrl(
          {
            history: DEFAULT_NAV_PATHS.ORDER_OFFER(
              orderRequestId,
              offerId,
              idOrder,
            ),
          },
          { pathname: APP_PATHS.ORDER_OFFER(orderRequestId, offerId) },
        ),
      );

    return notification;
  }

  if (notification.type === 'exchangeProductRequest') {
    const {
      idOrder,
      orderRequestId,
      orderId: offerId,
    } = notification.data as INotificationDataType['exchangeProductRequest'];

    notification.text = `Запрос на обмен в заказе ${idOrder}`;

    notification.onClick = () =>
      router.push(
        generateUrl(
          {
            history: DEFAULT_NAV_PATHS.ORDER_OFFER(
              orderRequestId,
              offerId,
              idOrder,
            ),
          },
          { pathname: APP_PATHS.ORDER_OFFER(orderRequestId, offerId) },
        ),
      );

    return notification;
  }

  if (notification.type === 'exchangeProductAccept') {
    const {
      idOrder,
      orderRequestId,
      orderId: offerId,
    } = notification.data as INotificationDataType['exchangeProductAccept'];

    notification.text = `Обмен в заказе ${idOrder} одобрен`;

    notification.onClick = () =>
      router.push(
        generateUrl(
          {
            history: DEFAULT_NAV_PATHS.ORDER_OFFER(
              orderRequestId,
              offerId,
              idOrder,
            ),
          },
          { pathname: APP_PATHS.ORDER_OFFER(orderRequestId, offerId) },
        ),
      );

    return notification;
  }

  if (notification.type === 'exchangeProductDecline') {
    const {
      idOrder,
      orderRequestId,
      orderId: offerId,
    } = notification.data as INotificationDataType['exchangeProductDecline'];

    notification.text = `Обмен в заказе ${idOrder} отклонен`;

    notification.onClick = () =>
      router.push(
        generateUrl(
          {
            history: DEFAULT_NAV_PATHS.ORDER_OFFER(
              orderRequestId,
              offerId,
              idOrder,
            ),
          },
          { pathname: APP_PATHS.ORDER_OFFER(orderRequestId, offerId) },
        ),
      );

    return notification;
  }

  if (notification.type === 'exchangeProductComplete') {
    const {
      idOrder,
      orderRequestId,
      orderId: offerId,
    } = notification.data as INotificationDataType['exchangeProductComplete'];

    notification.text = `Обмен в заказе ${idOrder} завершен`;

    notification.onClick = () =>
      router.push(
        generateUrl(
          {
            history: DEFAULT_NAV_PATHS.ORDER_OFFER(
              orderRequestId,
              offerId,
              idOrder,
            ),
          },
          { pathname: APP_PATHS.ORDER_OFFER(orderRequestId, offerId) },
        ),
      );

    return notification;
  }

  if (notification.type === 'userRoleBanned') {
    const { roles, allRoles, reasons } =
      notification.data as INotificationDataType['userRoleBanned'];

    notification.text = allRoles
      ? `Ваш аккаунт заблокирован`
      : roles?.length === 1
      ? `Ваша роль ${locale.user[roles[0].label]} заблокирована`
      : `Ваши роли ${roles
          .map(role => locale.user[role.label])
          .join(', ')} заблокированы`;
    if (reasons)
      notification.text += `. Причина: ${reasons
        .map(reason => locale.complaint.reasons[reason])
        .join(', ')}`;

    return notification;
  }

  if (notification.type === 'userRoleUnbanned') {
    const { roles, allRoles } =
      notification.data as INotificationDataType['userRoleUnbanned'];

    notification.text = allRoles
      ? `Ваш аккаунт разблокирован`
      : roles?.length === 1
      ? `Ваша роль ${locale.user[roles[0].label]} разблокирована`
      : `Ваши роли ${roles
          .map(role => locale.user[role.label])
          .join(', ')} разблокированы`;

    return notification;
  }

  if (notification.type === 'userOrderRequestsBanned') {
    const { roles, reasons } =
      notification.data as INotificationDataType['userOrderRequestsBanned'];

    notification.text = `Для Вас заблокированы запросы. Причина: ${reasons
      .map(reason => locale.complaint.reasons[reason])
      .join(', ')}`;

    return notification;
  }

  if (notification.type === 'userOrderRequestsUnbanned') {
    const { roles } =
      notification.data as INotificationDataType['userOrderRequestsUnbanned'];

    notification.text = `Запросы разблокированы`;

    return notification;
  }

  if (notification.type === 'sellerDowngraded') {
    const { roles, reasons } =
      notification.data as INotificationDataType['userOrderRequestsBanned'];

    notification.text = `Ваш рейтинг понижен. Причина: ${reasons
      .map(reason => locale.complaint.reasons[reason])
      .join(', ')}`;

    return notification;
  }

  if (notification.type === 'newSellerReview') {
    const { review } =
      notification.data as INotificationDataType['newSellerReview'];

    notification.text = `Новый отзыв. Ваш рейтинг - ${review.ratingValue.roundFraction()}`;

    return notification;
  }

  if (notification.type === 'newUserComplaint') {
    const { complaint } =
      notification.data as INotificationDataType['newUserComplaint'];

    notification.text = `Новая жалоба на `;
    if (complaint.defendantRoleLabel === 'customer') {
      notification.text += 'покупателя';

      notification.onClick = () =>
        router.push(
          generateUrl(
            {
              history: DEFAULT_NAV_PATHS.CUSTOMER_COMPLAINTS(
                complaint.defendantId,
                complaint.defendantName,
              ),
            },
            {
              pathname: APP_PATHS.CUSTOMER_COMPLAINTS(complaint.defendantId),
            },
          ),
        );
    } else if (complaint.defendantRoleLabel === 'seller') {
      notification.text += 'продавца';

      notification.onClick = () =>
        router.push(
          generateUrl(
            {
              history: DEFAULT_NAV_PATHS.SELLER_COMPLAINTS(
                complaint.defendantId,
                complaint.defendantName,
              ),
            },
            {
              pathname: APP_PATHS.SELLER_COMPLAINTS(complaint.defendantId),
            },
          ),
        );
    } else return null;

    return notification;
  }

  if (notification.type === 'sellerUpdateApplicationCreated') {
    const { seller, applicationId } =
      notification.data as INotificationDataType['sellerUpdateApplicationCreated'];

    notification.text = `Запрос на обновление личных данных продавца`;

    notification.onClick = () =>
      router.push(
        generateUrl(
          {
            history: DEFAULT_NAV_PATHS.SELLER(seller.id, seller.name),
          },
          {
            pathname: APP_PATHS.SELLER(seller.id),
          },
        ),
      );

    return notification;
  }

  if (notification.type === 'sellerUpdateApplicationConfirmed') {
    const { seller, applicationId } =
      notification.data as INotificationDataType['sellerUpdateApplicationConfirmed'];

    notification.text = `Обновление Ваших личных данных одобрено`;

    notification.onClick = () =>
      router.push(
        generateUrl(
          {
            history: DEFAULT_NAV_PATHS.USER_SETTINGS,
          },
          {
            pathname: APP_PATHS.USER_SETTINGS,
          },
        ),
      );

    return notification;
  }

  if (notification.type === 'sellerUpdateApplicationRejected') {
    const { seller, applicationId } =
      notification.data as INotificationDataType['sellerUpdateApplicationRejected'];

    notification.text = `Запрос на обновление Ваших личных данных отклонен`;

    notification.onClick = () =>
      router.push(
        generateUrl(
          {
            history: DEFAULT_NAV_PATHS.USER_SETTINGS,
          },
          {
            pathname: APP_PATHS.USER_SETTINGS,
          },
        ),
      );

    return notification;
  }

  if (notification.type === 'registerOrganizationApplication') {
    const { organization } =
      notification.data as INotificationDataType['registerOrganizationApplication'];

    notification.text = 'Заявка на регистрацию организации';

    notification.onClick = () =>
      router.push(
        generateUrl(
          {
            history: DEFAULT_NAV_PATHS.ORGANIZATION(
              organization.id,
              organization.name,
            ),
          },
          {
            pathname: APP_PATHS.ORGANIZATION(organization.id),
          },
        ),
      );

    return notification;
  }

  if (notification.type === 'registerOrganizationApplicationUpdated') {
    const { organization } =
      notification.data as INotificationDataType['registerOrganizationApplicationUpdated'];

    notification.text = 'Заявка на регистрацию организации обновлена';

    notification.onClick = () =>
      router.push(
        generateUrl(
          {
            history: DEFAULT_NAV_PATHS.ORGANIZATION(
              organization.id,
              organization.name,
            ),
          },
          {
            pathname: APP_PATHS.ORGANIZATION(organization.id),
          },
        ),
      );

    return notification;
  }

  if (notification.type === 'registerSellerApplication') {
    const { seller, organization } =
      notification.data as INotificationDataType['registerSellerApplication'];

    notification.text = 'Заявка на регистрацию продавца';

    notification.onClick = () =>
      router.push(
        generateUrl(
          {
            history: DEFAULT_NAV_PATHS.ORGANIZATION_SELLER_APPLICATION(
              organization.id,
              seller.userId,
              { org: organization.name, user: seller.name },
            ),
          },
          {
            pathname: APP_PATHS.ORGANIZATION_SELLER_APPLICATION(
              organization.id,
              seller.userId,
            ),
          },
        ),
      );

    return notification;
  }

  if (notification.type === 'registerSellerApplicationUpdated') {
    const { seller, organization } =
      notification.data as INotificationDataType['registerSellerApplicationUpdated'];

    notification.text = 'Заявка на регистрацию продавца обновлена';

    notification.onClick = () =>
      router.push(
        generateUrl(
          {
            history: DEFAULT_NAV_PATHS.ORGANIZATION_SELLER_APPLICATION(
              organization.id,
              seller.userId,
              { org: organization.name, user: seller.name },
            ),
          },
          {
            pathname: APP_PATHS.ORGANIZATION_SELLER_APPLICATION(
              organization.id,
              seller.userId,
            ),
          },
        ),
      );

    return notification;
  }

  if (notification.type === 'organizationRegisterConfirmed') {
    const { organization } =
      notification.data as INotificationDataType['organizationRegisterConfirmed'];

    notification.text = `Регистрация организации ${organization.name} подтверждена`;

    notification.onClick = () =>
      router.push(
        auth.user.sellerConfirmationDate
          ? generateUrl(
              {
                history: DEFAULT_NAV_PATHS.USER_SETTINGS_ORGANIZATION(
                  organization.id,
                  organization.name,
                ),
              },
              {
                pathname: APP_PATHS.USER_SETTINGS_ORGANIZATION(organization.id),
              },
            )
          : generateUrl(
              {
                history: DEFAULT_NAV_PATHS.REGISTER_SELLER_COMPLETE,
              },
              {
                pathname: APP_PATHS.REGISTER_SELLER_COMPLETE,
              },
            ),
      );

    return notification;
  }

  if (notification.type === 'organizationRegisterRejected') {
    const { organization } =
      notification.data as INotificationDataType['organizationRegisterRejected'];

    notification.text = `Регистрация организации ${organization.name} отклонена`;

    notification.onClick = () =>
      router.push(
        auth.user.sellerConfirmationDate
          ? generateUrl(
              {
                history: DEFAULT_NAV_PATHS.USER_SETTINGS_ORGANIZATION(
                  organization.id,
                  organization.name,
                ),
              },
              {
                pathname: APP_PATHS.USER_SETTINGS_ORGANIZATION(organization.id),
              },
            )
          : generateUrl(
              {
                history: DEFAULT_NAV_PATHS.REGISTER_SELLER_ORGANIZATION,
              },
              {
                pathname: APP_PATHS.REGISTER_SELLER_ORGANIZATION,
              },
            ),
      );

    return notification;
  }

  if (notification.type === 'organizationSellerRegisterConfirmed') {
    notification.text = `Регистрация подтверждена`;

    notification.onClick = () =>
      router.push(
        generateUrl(
          { history: DEFAULT_NAV_PATHS.PERSONAL_AREA },
          { pathname: APP_PATHS.PERSONAL_AREA },
        ),
      );

    return notification;
  }

  if (notification.type === 'organizationSellerRegisterRejected') {
    notification.text = `Регистрация отклонена`;

    notification.onClick = () =>
      router.push(
        generateUrl(
          { history: DEFAULT_NAV_PATHS.REGISTER_SELLER_COMPLETE },
          { pathname: APP_PATHS.REGISTER_SELLER_COMPLETE },
        ),
      );

    return notification;
  }

  if (notification.type === 'organizationUpdateApplicationCreated') {
    const { organization, applicationId } =
      notification.data as INotificationDataType['organizationUpdateApplicationCreated'];

    notification.text = `Запрос на обновление данных организации ${organization.name}`;

    notification.onClick = () =>
      router.push(
        generateUrl(
          {
            history: DEFAULT_NAV_PATHS.ORGANIZATION_UPDATE_APPLICATION(
              organization.id,
              applicationId,
              { org: organization.name },
            ),
          },
          {
            pathname: APP_PATHS.ORGANIZATION_UPDATE_APPLICATION(
              organization.id,
              applicationId,
            ),
          },
        ),
      );

    return notification;
  }

  if (notification.type === 'organizationUpdateApplicationConfirmed') {
    const { organization, applicationId } =
      notification.data as INotificationDataType['organizationUpdateApplicationConfirmed'];

    notification.text = `Обновление данных организации ${organization.name} одобрено`;

    notification.onClick = () =>
      router.push(
        generateUrl(
          {
            history: DEFAULT_NAV_PATHS.USER_SETTINGS_ORGANIZATION(
              organization.id,
              organization.name,
            ),
          },
          {
            pathname: APP_PATHS.USER_SETTINGS_ORGANIZATION(organization.id),
          },
        ),
      );

    return notification;
  }

  if (notification.type === 'organizationUpdateApplicationRejected') {
    const { organization, applicationId } =
      notification.data as INotificationDataType['organizationUpdateApplicationRejected'];

    notification.text = `Запрос на обновление данных организации ${organization.name} отклонен`;

    notification.onClick = () =>
      router.push(
        generateUrl(
          {
            history: DEFAULT_NAV_PATHS.USER_SETTINGS_ORGANIZATION(
              organization.id,
              organization.name,
            ),
          },
          {
            pathname: APP_PATHS.USER_SETTINGS_ORGANIZATION(organization.id),
          },
        ),
      );

    return notification;
  }

  if (notification.type === 'productOfferCreated') {
    const { productOffer } =
      notification.data as INotificationDataType['productOfferCreated'];

    notification.text = 'Новая заявка на оцифровку';

    notification.onClick = () =>
      router.push(
        generateUrl(
          {
            history: DEFAULT_NAV_PATHS.PRODUCT_OFFER(
              productOffer.id,
              productOffer.productName,
            ),
          },
          {
            pathname: APP_PATHS.PRODUCT_OFFER(productOffer.id),
          },
        ),
      );

    return notification;
  }

  if (notification.type === 'productOfferUpdated') {
    const { productOffer } =
      notification.data as INotificationDataType['productOfferUpdated'];

    notification.text = 'Заявка на оцифровку обновлена';

    notification.onClick = () =>
      router.push(
        generateUrl(
          {
            history: DEFAULT_NAV_PATHS.PRODUCT_OFFER(
              productOffer.id,
              productOffer.productName,
            ),
          },
          {
            pathname: APP_PATHS.PRODUCT_OFFER(productOffer.id),
          },
        ),
      );

    return notification;
  }

  if (notification.type === 'productOfferAccepted') {
    const { productOffer } =
      notification.data as INotificationDataType['productOfferAccepted'];

    notification.text = 'Заявка на оцифровку одобрена. Ваш рейтинг повышен';

    notification.onClick = () =>
      router.push(
        generateUrl(
          {
            history: DEFAULT_NAV_PATHS.PRODUCT_OFFER(
              productOffer.id,
              productOffer.productName,
            ),
          },
          {
            pathname: APP_PATHS.PRODUCT_OFFER(productOffer.id),
          },
        ),
      );

    return notification;
  }

  if (notification.type === 'productOfferRejected') {
    const { productOffer } =
      notification.data as INotificationDataType['productOfferRejected'];

    notification.text = 'Заявка на оцифровку отклонена';

    notification.onClick = () =>
      router.push(
        generateUrl(
          {
            history: DEFAULT_NAV_PATHS.PRODUCT_OFFER(
              productOffer.id,
              productOffer.productName,
            ),
          },
          {
            pathname: APP_PATHS.PRODUCT_OFFER(productOffer.id),
          },
        ),
      );

    return notification;
  }

  if (notification.type === 'orderInvoicePaymentApproved') {
    const { orderRequestId, idOrder } =
      notification.data as INotificationDataType['orderInvoicePaymentApproved'];

    notification.text = `Покупатель начал оплату заказа ${idOrder} по счету`;

    notification.onClick = () =>
      router.push(
        generateUrl(
          {
            history: DEFAULT_NAV_PATHS.ORDER_REQUEST(orderRequestId, idOrder),
          },
          {
            pathname: APP_PATHS.ORDER_REQUEST(orderRequestId),
          },
        ),
      );

    return notification;
  }

  if (notification.type === 'orderInvoicePaymentConfirmed') {
    const { orderRequestId, idOrder } =
      notification.data as INotificationDataType['orderInvoicePaymentConfirmed'];

    notification.text = `Оплата заказа ${idOrder} подтверждена`;

    notification.onClick = () =>
      router.push(
        generateUrl(
          {
            history: DEFAULT_NAV_PATHS.ORDER(orderRequestId, idOrder),
          },
          {
            pathname: APP_PATHS.ORDER(orderRequestId),
          },
        ),
      );

    return notification;
  }

  if (notification.type === 'offerInvoicePaymentConfirmed') {
    const { orderRequestId, idOrder, offerId, supplierName } =
      notification.data as INotificationDataType['offerInvoicePaymentConfirmed'];

    notification.text = `Оплата заказа ${idOrder} для поставщика ${supplierName} подтверждена`;

    notification.onClick = () =>
      router.push(
        generateUrl(
          {
            history: DEFAULT_NAV_PATHS.ORDER(orderRequestId, idOrder),
            tab: offerId,
          },
          { pathname: APP_PATHS.ORDER(orderRequestId) },
        ),
      );

    return notification;
  }

  if (notification.type === 'offerInvoicePaymentCanceled') {
    const { orderRequestId, idOrder, offerId, supplierName } =
      notification.data as INotificationDataType['offerInvoicePaymentCanceled'];

    notification.text = `Оплата заказа ${idOrder} для поставщика ${supplierName} отменена`;

    notification.onClick = () =>
      router.push(
        generateUrl(
          {
            history: DEFAULT_NAV_PATHS.ORDER(orderRequestId, idOrder),
            tab: offerId,
          },
          { pathname: APP_PATHS.ORDER(orderRequestId) },
        ),
      );

    return notification;
  }

  if (notification.type === 'orderInvoicePaymentCanceled') {
    const { orderRequestId, idOrder } =
      notification.data as INotificationDataType['orderInvoicePaymentCanceled'];

    notification.text = `Оплата заказа ${idOrder} отменена`;

    notification.onClick = () =>
      router.push(
        generateUrl(
          {
            history: DEFAULT_NAV_PATHS.ORDER(orderRequestId, idOrder),
          },
          { pathname: APP_PATHS.ORDER(orderRequestId) },
        ),
      );

    return notification;
  }

  if (notification.type === 'orderAttachmentUploaded') {
    const { orderRequestId, idOrder, attachmentGroup } =
      notification.data as INotificationDataType['orderAttachmentUploaded'];

    notification.text = `К заказу ${idOrder} прикреплено вложение`;

    notification.onClick = () =>
      router.push(
        generateUrl(
          {
            history: DEFAULT_NAV_PATHS.ORDER(orderRequestId, idOrder),
          },
          {
            pathname: APP_PATHS.ORDER(orderRequestId),
          },
        ),
      );

    return notification;
  }

  if (notification.type === 'customerRegistered') {
    const { user } =
      notification.data as INotificationDataType['customerRegistered'];

    notification.text = `Зарегистрировался покупатель ${formatPhoneNumber(
      user.phone,
    )}`;

    notification.onClick = () =>
      router.push(
        generateUrl(
          {
            history: DEFAULT_NAV_PATHS.CUSTOMER(
              user.id,
              formatPhoneNumber(user.phone),
            ),
          },
          {
            pathname: APP_PATHS.CUSTOMER(user.id),
          },
        ),
      );

    return notification;
  }

  if (ENV === 'development') {
    notification.text = 'Уведомление ' + notification.type;
    notification.onClick = () => console.log(notification.data);
    return notification;
  } else {
    return null;
  }
};
