import { IOrderAttachmentGroupedListProps } from './interfaces';
import { FC, Fragment } from 'react';
import { useAuth } from 'hooks/auth.hook';
import { IOrderAttachment } from 'sections/Orders/interfaces';
import OrderAttachmentsGroup from './Group';
import { IUserRoleLabelsDefault } from 'sections/Users/interfaces';

const OrderAttachmentGroupedList: FC<IOrderAttachmentGroupedListProps> = ({
  order,
  setOrder,
  offer,
  attachments: attachmentsInitial,
  setAttachments,
  withUploads,
  maxWidth,
}) => {
  const auth = useAuth();

  const groupedAttachments: {
    [group in IOrderAttachment['group']]?: IOrderAttachment[];
  } = attachmentsInitial.reduce((a, b) => {
    a[b.group || 'attachment'] = [...(a[b.group || 'attachment'] || []), b];
    return a;
  }, {});

  const isApprovedOrder =
    order &&
    [
      'APPROVED',
      'PAYMENT_POSTPONED',
      'PAID',
      'SHIPPED',
      'COMPLETED',
      'REWARD_PAID',
    ].includes(order?.status);
  const isPaidOrder =
    order &&
    ['PAID', 'SHIPPED', 'COMPLETED', 'REWARD_PAID'].includes(order?.status);
  const isPostponedOrder = order?.status === 'PAYMENT_POSTPONED';
  const acceptanceCertificateDisplay = isPaidOrder || isPostponedOrder;
  const waybillDisplay =
    isApprovedOrder &&
    (auth?.currentRole?.label === 'seller'
      ? order.orders
          .filter(({ sellerId }) => sellerId === auth.user.id)
          .some(({ transportCompany }) => transportCompany !== null)
      : order.orders.some(({ transportCompany }) => transportCompany !== null));

  return (
    <div className="order-attachment-grouped-list">
      {withUploads ? (
        <Fragment>
          <OrderAttachmentsGroup
            group="attachment"
            attachments={groupedAttachments['attachment']}
            setAttachments={setAttachments}
            order={order}
            setOrder={setOrder}
            offer={offer}
            maxWidth={maxWidth}
          />
          {(
            ['customer', 'manager', 'operator'] as IUserRoleLabelsDefault[]
          ).includes(auth.currentRole.label) &&
            order.paymentType === 'card' && (
              <OrderAttachmentsGroup
                group="check"
                attachments={groupedAttachments['check']}
                setAttachments={setAttachments}
                order={order}
                setOrder={setOrder}
                offer={offer}
                maxWidth={maxWidth}
              />
            )}
          {order.paymentType === 'invoice' && (
            <Fragment>
              <OrderAttachmentsGroup
                group="invoice"
                attachments={groupedAttachments['invoice']}
                setAttachments={setAttachments}
                setOrder={setOrder}
                order={order}
                offer={offer}
                maxWidth={maxWidth}
              />
              <OrderAttachmentsGroup
                group="specification"
                attachments={groupedAttachments['specification']}
                setAttachments={setAttachments}
                order={order}
                setOrder={setOrder}
                offer={offer}
                maxWidth={maxWidth}
              />
            </Fragment>
          )}
          {!!order.payerId && (isPaidOrder || isPostponedOrder) && (
            <OrderAttachmentsGroup
              group="accountingDocument"
              attachments={groupedAttachments['accountingDocument']}
              setAttachments={setAttachments}
              order={order}
              setOrder={setOrder}
              withUpload={
                ['seller', 'customer'].includes(auth?.currentRole?.label) &&
                !(auth?.currentRole?.label === 'customer' && !offer)
              }
              offer={offer}
              maxWidth={maxWidth}
            />
          )}
          {acceptanceCertificateDisplay && (
            <Fragment>
              <OrderAttachmentsGroup
                group="acceptanceCertificate"
                attachments={
                  groupedAttachments?.['acceptanceCertificate']?.length &&
                  auth?.currentRole?.label === 'seller'
                    ? groupedAttachments['acceptanceCertificate'].filter(
                        item => item?.orderId === offer?.id,
                      )
                    : groupedAttachments['acceptanceCertificate']
                }
                setAttachments={setAttachments}
                order={order}
                setOrder={setOrder}
                withUpload={auth?.currentRole?.label === 'seller'}
                offer={offer}
                maxWidth={maxWidth}
              />
            </Fragment>
          )}
          {['PAID', 'COMPLETED', 'SHIPPED', 'REWARD_PAID'].includes(
            order.status,
          ) &&
            waybillDisplay && (
              <OrderAttachmentsGroup
                group="waybill"
                attachments={
                  groupedAttachments['waybill'] &&
                  auth?.currentRole?.label === 'seller'
                    ? groupedAttachments['waybill'].filter(
                        ({ userId }) => userId === auth.user.id,
                      )
                    : groupedAttachments['waybill']
                }
                setAttachments={setAttachments}
                order={order}
                setOrder={setOrder}
                withUpload={auth?.currentRole?.label === 'seller'}
                offer={offer}
                maxWidth={maxWidth}
              />
            )}
        </Fragment>
      ) : (
        <Fragment>
          {Object.keys(groupedAttachments).map(
            (group: IOrderAttachment['group'], i) => (
              <OrderAttachmentsGroup
                key={i}
                group={group}
                order={order}
                setOrder={setOrder}
                attachments={groupedAttachments[group]}
                setAttachments={setAttachments}
                offer={offer}
                maxWidth={maxWidth}
              />
            ),
          )}
        </Fragment>
      )}
    </div>
  );
};

export default OrderAttachmentGroupedList;
