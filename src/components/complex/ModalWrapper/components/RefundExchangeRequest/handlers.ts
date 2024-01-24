import { useRouter } from 'next/router';
import { useState } from 'react';
import { API_ENDPOINTS } from 'data/paths.data';
import { APIRequest } from 'utils/api.utils';
import { IRefundExchangeRequest } from 'sections/Orders/interfaces';
import { useLocale } from 'hooks/locale.hook';
import { useAuth } from 'hooks/auth.hook';

const useHandlers = ({
  refundExchangeRequest,
}: {
  refundExchangeRequest: IRefundExchangeRequest;
}) => {
  const auth = useAuth();
  const { locale } = useLocale();
  const router = useRouter();

  const [reply, setReply] = useState(refundExchangeRequest.reply || '');

  // handlers
  const handleReplyChange = reply => setReply(reply);

  const handleSubmit = async (reject = false) => {
    const res = await APIRequest<any>({
      method: 'put',
      url: API_ENDPOINTS.REFUND_EXCHANGE,
      params: reject
        ? { id: refundExchangeRequest.id, reject }
        : { id: refundExchangeRequest.id },
      data: reply ? { reply } : {},
      requireAuth: true,
    });

    if (!res.isSucceed) return;

    router.reload();
  };

  return {
    locale,
    auth,
    reply,
    handlers: {
      handleReplyChange,
    },
    handleSubmit,
  };
};

export default useHandlers;
