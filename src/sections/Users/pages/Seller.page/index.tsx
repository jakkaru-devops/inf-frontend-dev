import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import PageContainer from 'components/containers/PageContainer';
import { IUser } from 'sections/Users/interfaces';
import SellerPageContent from './Content';
import ContextProvider from './context';
import socketService from 'services/socket';
import { STRINGS } from 'data/strings.data';
import { useNotifications } from 'hooks/notifications.hooks';
import { fetchSellerService } from 'sections/Users/services/fetchSeller.service';
import { useAuth } from 'hooks/auth.hook';

const SellerPage = () => {
  const auth = useAuth();
  const router = useRouter();
  const { handleNewNotification } = useNotifications();

  const [data, setData] = useState<{
    user: IUser;
    refundsNumber: number;
  }>(null);

  useEffect(() => {
    const fetchData = async () => {
      const { user, refundsNumber } = await fetchSellerService(
        auth?.currentRole?.label === 'seller'
          ? auth.user.id
          : (router.query.userId as string),
      );

      setData({ user, refundsNumber });
    };
    fetchData();
  }, []);

  useEffect(() => {
    // Notification listener
    socketService.socket
      .off(STRINGS.SERVER_NEW_NOTIFICATION)
      .on(STRINGS.SERVER_NEW_NOTIFICATION, handleNewNotification);
  }, [router?.query?.tab]);

  return (
    <PageContainer contentLoaded={!!data}>
      <ContextProvider>
        <SellerPageContent
          {...data}
          setUser={user => setData({ ...data, user })}
        />
      </ContextProvider>
    </PageContainer>
  );
};

export default SellerPage;
