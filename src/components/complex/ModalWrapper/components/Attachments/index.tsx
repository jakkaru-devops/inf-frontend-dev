import { IAttachment } from 'sections/Catalog/interfaces/products.interfaces';
import { IOrder, IOrderRequest } from 'sections/Orders/interfaces';
import { AttachmentList } from './components/AttachmentList';
import { IUserRoleLabelsDefault } from 'sections/Users/interfaces';
import { ISetState } from 'interfaces/common.interfaces';
import { FC, Fragment } from 'react';
import { useAuth } from 'hooks/auth.hook';

export const Attachments: FC<{
  attachmentList: IAttachment[];
  setAttachments: ISetState<IAttachment[]>;
  order?: IOrderRequest;
  setOrder: ISetState<IOrderRequest>;
  offer?: IOrder;
  withUploads?: boolean;
}> = ({
  attachmentList,
  setAttachments,
  order,
  setOrder,
  offer,
  withUploads,
}) => {
  const auth = useAuth();

  const attachments: { [group in IAttachment['group']]?: IAttachment[] } =
    attachmentList.reduce((a, b) => {
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
    ].includes(order.status);
  const isPaidOrder =
    order &&
    ['PAID', 'SHIPPED', 'COMPLETED', 'REWARD_PAID'].includes(order.status);
  const isPostponedOrder = order?.status === 'PAYMENT_POSTPONED';
  const acceptanceCertificateDisplay = isPaidOrder || isPostponedOrder;
  const waybillDisplay =
    isApprovedOrder &&
    (auth?.currentRole?.label === 'seller'
      ? order.orders
          .filter(({ sellerId }) => sellerId === auth.user.id)
          .some(({ transportCompany }) => transportCompany !== null)
      : order.orders.some(({ transportCompany }) => transportCompany !== null));

  return withUploads ? (
    <>
      <AttachmentList
        group="attachment"
        attachmentList={attachments['attachment']}
        setAttachments={setAttachments}
        setOrder={setOrder}
        offer={offer}
      />
      {(
        ['customer', 'manager', 'operator'] as IUserRoleLabelsDefault[]
      ).includes(auth.currentRole.label) &&
        order.paymentType === 'card' && (
          <AttachmentList
            group="check"
            attachmentList={attachments['check']}
            setAttachments={setAttachments}
            setOrder={setOrder}
            offer={offer}
          />
        )}
      {order.paymentType === 'invoice' && (
        <Fragment>
          <AttachmentList
            group="invoice"
            attachmentList={attachments['invoice']}
            setAttachments={setAttachments}
            setOrder={setOrder}
            offer={offer}
          />
          <AttachmentList
            group="specification"
            attachmentList={attachments['specification']}
            setAttachments={setAttachments}
            setOrder={setOrder}
            offer={offer}
          />
        </Fragment>
      )}
      {!!order.payerId && (isPaidOrder || isPostponedOrder) && (
        <AttachmentList
          group="accountingDocument"
          attachmentList={attachments['accountingDocument']}
          setAttachments={setAttachments}
          orderId={order.id}
          setOrder={setOrder}
          withUpload={
            ['seller', 'customer'].includes(auth?.currentRole?.label) &&
            !(auth?.currentRole?.label === 'customer' && !offer)
          }
          offer={offer}
        />
      )}
      {acceptanceCertificateDisplay && (
        <Fragment>
          <AttachmentList
            group="acceptanceCertificate"
            attachmentList={
              attachments?.['acceptanceCertificate']?.length &&
              auth?.currentRole?.label === 'seller'
                ? attachments['acceptanceCertificate'].filter(
                    item => item?.orderId === offer?.id,
                  )
                : attachments['acceptanceCertificate']
            }
            setAttachments={setAttachments}
            orderId={order.id}
            setOrder={setOrder}
            withUpload={auth?.currentRole?.label === 'seller'}
            offer={offer}
          />
        </Fragment>
      )}
      {['PAID', 'COMPLETED', 'SHIPPED', 'REWARD_PAID'].includes(order.status) &&
        waybillDisplay && (
          <AttachmentList
            group="waybill"
            attachmentList={
              attachments['waybill'] && auth?.currentRole?.label === 'seller'
                ? attachments['waybill'].filter(
                    ({ userId }) => userId === auth.user.id,
                  )
                : attachments['waybill']
            }
            setAttachments={setAttachments}
            orderId={order.id}
            setOrder={setOrder}
            withUpload={auth?.currentRole?.label === 'seller'}
            offer={offer}
          />
        )}
    </>
  ) : (
    <>
      {Object.keys(attachments).map((group: IAttachment['group'], i) => (
        <AttachmentList
          key={i}
          group={group}
          setOrder={setOrder}
          attachmentList={attachments[group]}
          setAttachments={setAttachments}
          offer={offer}
        />
      ))}
    </>
  );
};
