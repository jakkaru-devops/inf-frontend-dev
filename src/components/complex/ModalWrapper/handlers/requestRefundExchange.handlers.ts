import { useRouter } from 'next/router';
import { useState } from 'react';
import { API_ENDPOINTS } from 'data/paths.data';
import { APIRequest } from 'utils/api.utils';
import {
  IOrder,
  IRefundExchangeReason,
  IRequestProduct,
} from 'sections/Orders/interfaces';
import { useLocale } from 'hooks/locale.hook';
import { generateUrl, openNotification } from 'utils/common.utils';

const useHandlers = ({
  requestProduct,
  order,
}: {
  requestProduct: IRequestProduct;
  order: IOrder;
}) => {
  const { locale } = useLocale();
  const router = useRouter();

  const [disputeResolution, setDisputeResolution] = useState<
    'REFUND' | 'EXCHANGE'
  >(null);
  const [quantity, setQuantity] = useState(1);
  const [reasonList, setReasonList] = useState<IRefundExchangeReason[]>([]);
  const [comment, setComment] = useState('');
  const [uploadedFileIds, setUploadedFileIds] = useState<string[] | []>([]);

  const allowRequest = disputeResolution && quantity && reasonList.length > 0;

  // handlers
  const handleDisputeResolutionChange = (
    disputeResolution: 'REFUND' | 'EXCHANGE',
  ) => setDisputeResolution(disputeResolution);

  const handleQuantityChange = (quantity: number) => setQuantity(quantity);

  const handleReasonListChange = (reason: IRefundExchangeReason) =>
    setReasonList(reasonList =>
      reasonList.includes(reason)
        ? reasonList.filter(deleteReason => deleteReason !== reason)
        : [...reasonList, reason],
    );

  const handleCommentChange = comment => setComment(comment);

  const handleFilesUpload = fileIds =>
    setUploadedFileIds(uploadedFileIds => [
      ...uploadedFileIds.filter(id => !fileIds.includes(id)),
      ...fileIds,
    ]);

  const handleFileDelete = fileId =>
    setUploadedFileIds(uploadedFileIds =>
      uploadedFileIds.filter(id => fileId !== id),
    );

  const createRefundExchangeRequest = async () => {
    if (!allowRequest) return;

    const res = await APIRequest<any>({
      method: 'post',
      url: API_ENDPOINTS.REFUND_EXCHANGE,
      data: {
        requestProductId: requestProduct.id,
        orderId: order.id,
        disputeResolution,
        quantity,
        reason: reasonList,
        comment,
        fileIds: uploadedFileIds,
      },
      requireAuth: true,
    });

    if (!res.isSucceed) return;

    openNotification(
      `Заявка на ${locale.refundExchange.statuses[disputeResolution]} подана`,
    );

    setTimeout(() => {
      router.push(generateUrl({ fromRefunds: 'true' }));
      router.reload();
    }, 2000);
  };

  return {
    locale,
    disputeResolution,
    quantity,
    comment,
    reasonList,
    handlers: {
      handleDisputeResolutionChange,
      handleQuantityChange,
      handleReasonListChange,
      handleCommentChange,
      handleFilesUpload,
      handleFileDelete,
    },
    allowRequest,
    createRefundExchangeRequest,
  };
};

export default useHandlers;
