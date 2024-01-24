import {
  IOrganization,
  IOrganizationUpdateApplication,
} from 'sections/Organizations/interfaces';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import PageContainer from 'components/containers/PageContainer';
import { APIRequest } from 'utils/api.utils';
import { API_ENDPOINTS } from 'data/paths.data';
import OrganizationUpdateApplicationPageContent from './Content';
import { useNotifications } from 'hooks/notifications.hooks';
import organizationsService from 'sections/Organizations/organizations.service';

const OrganizationUpdateApplicationPage = () => {
  const router = useRouter();
  const { fetchUnreadNotificationsCount } = useNotifications();
  const [organization, setOrganizationData] = useState<IOrganization>(null);
  const [updateApplication, setUpdateApplicationData] =
    useState<IOrganizationUpdateApplication>(null);

  useEffect(() => {
    const fetchData = async () => {
      const organization = await organizationsService.fetchOrganization(
        router.query?.organizationId as string,
      );

      setOrganizationData(organization);

      const updateApplicationRes = await APIRequest({
        method: 'get',
        url: API_ENDPOINTS.ORGANIZATION_UPDATE_APPLICATION,
        params: {
          applicationId: router.query?.applicationId,
        },
        requireAuth: true,
      });

      const updateApplication =
        updateApplicationRes?.data?.organizationUpdateApplication;

      setUpdateApplicationData(updateApplication);
    };
    fetchData();
  }, [router.query?.organizationId, router.query?.applicationId]);

  useEffect(() => {
    if (!organization) return;

    const notifications = organization?.unreadNotifications.filter(
      el => el.type === 'organizationUpdateApplicationCreated',
    );
    if (!notifications.length) return;

    const notificationIds = notifications.map(({ id }) => id);
    APIRequest({
      method: 'post',
      url: API_ENDPOINTS.NOTIFICATION_UNREAD,
      data: {
        notificationIds,
      },
      requireAuth: true,
    }).then(async res => {
      if (!res.isSucceed) return;
      await fetchUnreadNotificationsCount(notificationIds);
    });
  }, [organization?.id]);

  return (
    <PageContainer contentLoaded={!!updateApplication}>
      <OrganizationUpdateApplicationPageContent
        updateApplication={updateApplication}
      />
    </PageContainer>
  );
};

export default OrganizationUpdateApplicationPage;
