import { API_ENDPOINTS } from 'data/paths.data';
import { IComplaint } from 'sections/Users/interfaces';
import ComplaintListPageContent from './Content';
import { useEffect, useState } from 'react';
import { APIRequest } from 'utils/api.utils';
import { IRowsWithCount } from 'interfaces/common.interfaces';
import { useRouter } from 'next/router';
import PageContainer from 'components/containers/PageContainer';
import socketService from 'services/socket';
import { STRINGS } from 'data/strings.data';
import { INotification } from 'hooks/notifications.hooks/interfaces';
import { useNotifications } from 'hooks/notifications.hooks';
import { generateUrl } from 'utils/common.utils';

const ComplaintListPage = () => {
  const [complaints, setComplaints] =
    useState<IRowsWithCount<IComplaint[]>>(null);
  const [newItemsCount, setNewItemsCount] = useState(0);
  const [dataLoaded, setDataLoaded] = useState(false);
  const router = useRouter();
  const { handleNewNotification } = useNotifications();

  useEffect(() => {
    const fetchData = async () => {
      const { isSucceed, data } = await APIRequest({
        method: 'get',
        url: API_ENDPOINTS.ALL_COMPLAINTS,
        params: {
          page: router?.query?.page || 1,
          search: router?.query?.search,
        },
        requireAuth: true,
      });

      if (isSucceed) {
        setComplaints(data);
      }
      setDataLoaded(true);
    };
    fetchData();
  }, [router?.query]);

  useEffect(() => {
    if (!complaints) return;

    // Notification listener
    socketService.socket
      .off(STRINGS.SERVER_NEW_NOTIFICATION)
      .on(
        STRINGS.SERVER_NEW_NOTIFICATION,
        async (notification: INotification) => {
          handleNewNotification(notification);

          if (notification.type === 'newUserComplaint') {
            if (!router?.query?.page || router?.query?.page === '1') {
              router.push(generateUrl({ page: 1 }));
            } else {
              setNewItemsCount(prev => prev + 1);
            }
          }
        },
      );
  }, [complaints]);

  return (
    <PageContainer contentLoaded={!!complaints}>
      <ComplaintListPageContent
        complaints={complaints}
        newItemsCount={newItemsCount}
        setNewItemsCount={setNewItemsCount}
      />
    </PageContainer>
  );
};

export default ComplaintListPage;
