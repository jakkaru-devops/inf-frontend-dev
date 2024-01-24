import { API_ENDPOINTS } from 'data/paths.data';
import { useRouter } from 'next/router';
import { IUser, IUserReview } from 'sections/Users/interfaces';
import { FC, useEffect, useState } from 'react';
import { IRowsWithCount } from 'interfaces/common.interfaces';
import { APIRequest } from 'utils/api.utils';
import PageContainer from 'components/containers/PageContainer';
import SellerReviewListTabContent from './Content';
import socketService from 'services/socket';
import { STRINGS } from 'data/strings.data';
import { INotification } from 'hooks/notifications.hooks/interfaces';
import { useNotifications } from 'hooks/notifications.hooks';

interface IProps {
  user: IUser;
}

const SellerReviewListTab: FC<IProps> = ({ user }) => {
  const router = useRouter();
  const { handleNewNotification } = useNotifications();
  const [reviews, setReviews] = useState<IRowsWithCount<IUserReview[]>>(null);

  const fetchReviews = async () => {
    const res = await APIRequest({
      method: 'get',
      url: API_ENDPOINTS.USER_REVIEW,
      params: {
        receiverId: user.id,
        page: router.query?.page || 1,
      },
      requireAuth: true,
    });

    const data = res.isSucceed ? res.data : null;
    setReviews(data);
  };

  useEffect(() => {
    fetchReviews();
  }, [router.query]);

  // Handle notifications
  useEffect(() => {
    if (!reviews?.rows?.length) return;

    socketService.socket
      .off(STRINGS.SERVER_NEW_NOTIFICATION)
      .on(
        STRINGS.SERVER_NEW_NOTIFICATION,
        async (notification: INotification) => {
          handleNewNotification(notification);

          if (notification.type === 'newSellerReview') {
            fetchReviews();
          }
        },
      );
  }, [reviews]);

  return (
    <PageContainer contentLoaded={!!reviews}>
      <SellerReviewListTabContent reviews={reviews} user={user} />
    </PageContainer>
  );
};

export default SellerReviewListTab;
