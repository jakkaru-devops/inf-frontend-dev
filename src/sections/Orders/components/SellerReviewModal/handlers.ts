import { useState } from 'react';
import { API_ENDPOINTS } from 'data/paths.data';
import { APIRequest } from 'utils/api.utils';
import { ISellerReviewModalProps } from './interfaces';
import { useLocale } from 'hooks/locale.hook';
import { openNotification } from 'utils/common.utils';
import { IUserReview } from 'sections/Users/interfaces';
import { useAuth } from 'hooks/auth.hook';

const useHandlers = ({
  receiverId,
  orderId,
  onCancel,
  onSuccess,
}: ISellerReviewModalProps) => {
  const auth = useAuth();
  const { locale } = useLocale();

  const [rating, setRating] = useState<number>(0);
  const [text, setText] = useState('');

  const allowWriteReview = rating > 0;

  // handlers
  const handleRatingChange = (value: number) => setRating(value);

  const handleTextChange = text => setText(text);

  const writeReview = async () => {
    if (!allowWriteReview) {
      openNotification(`Укажите оценку работы продавца`);
      return;
    }

    const res = await APIRequest({
      method: 'post',
      url: API_ENDPOINTS.USER_REVIEW,
      params: {
        receiverId,
        orderId,
      },
      data: {
        rating,
        text: text !== '' ? text : null,
      },
      requireAuth: true,
    });

    if (!res.isSucceed) return;
    const reviewData: IUserReview = res.data;

    openNotification(`Спасибо за Ваш отзыв`);

    onCancel();
    onSuccess(reviewData);
  };

  return {
    locale,
    auth,
    rating,
    text,
    handlers: {
      handleRatingChange,
      handleTextChange,
    },
    allowWriteReview,
    writeReview,
  };
};

export default useHandlers;
