import { API_ENDPOINTS } from 'data/paths.data';
import { IOrganization } from 'sections/Organizations/interfaces';
import { useEffect, useState } from 'react';
import { NextRouter, useRouter } from 'next/router';
import { APIRequest } from 'utils/api.utils';
import OrganizationListPageContent from './content';
import { IRowsWithCount } from 'interfaces/common.interfaces';
import socketService from 'services/socket';
import { STRINGS } from 'data/strings.data';
import { INotification } from 'hooks/notifications.hooks/interfaces';
import { useNotifications } from 'hooks/notifications.hooks';
import { generateUrl } from 'utils/common.utils';
import PageContainer from 'components/containers/PageContainer';
import organizationsService from 'sections/Organizations/organizations.service';

interface IRouterExtended extends NextRouter {
  query: {
    region?: string;
    city?: string;
    search?: string;
    page?: string;
    pageSize?: string;
  };
}

const OrganizationListPage = () => {
  const router = useRouter() as IRouterExtended;
  const { handleNewNotification } = useNotifications();
  const [organizations, setOrganizations] =
    useState<IRowsWithCount<IOrganization[]>>(null);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [newItemsCount, setNewItemsCount] = useState(0);
  const [stateCounter, setStateCounter] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      const { data, isSucceed } = await APIRequest({
        method: 'get',
        url: API_ENDPOINTS.ORGANIZATION_LIST,
        params: {
          region: router.query.region,
          city: router.query.city,
          search: router.query.search,
          page: router.query.page,
          pageSize: router.query.pageSize || 10,
        },
        requireAuth: true,
      });
      if (isSucceed) {
        setOrganizations(data);
      }
      setDataLoaded(true);
    };
    fetchData();
  }, [router.query]);

  // Handle notifications
  useEffect(() => {
    if (!organizations) return;

    socketService.socket
      .off(STRINGS.SERVER_NEW_NOTIFICATION)
      .on(
        STRINGS.SERVER_NEW_NOTIFICATION,
        async (notification: INotification) => {
          handleNewNotification(notification);
          if (notification.type === 'registerOrganizationApplication') {
            if (!router?.query?.page || router?.query?.page === '1') {
              router.push(generateUrl({ page: 1 }));
            } else {
              setNewItemsCount(prev => prev + 1);
            }
          }
          const index = organizations.rows.findIndex(
            org => org.id === notification?.data?.organization?.id,
          );
          if (index !== -1) {
            const org = await organizationsService.fetchOrganization(
              organizations.rows[index].id,
            );
            const rows = organizations.rows;
            rows[index] = org;
            setOrganizations({
              ...organizations,
              rows,
            });
            setStateCounter(prev => prev + 1);
          }
        },
      );
  }, [organizations]);

  return (
    <PageContainer contentLoaded={!!organizations}>
      <OrganizationListPageContent
        organizations={organizations}
        dataLoaded={dataLoaded}
        newItemsCount={newItemsCount}
        setNewItemsCount={setNewItemsCount}
      />
    </PageContainer>
  );
};

export default OrganizationListPage;
