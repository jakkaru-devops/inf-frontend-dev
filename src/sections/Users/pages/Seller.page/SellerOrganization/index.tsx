import { API_ENDPOINTS, APP_PATHS } from 'data/paths.data';
import {
  IOrganization,
  IOrganizationSeller,
} from 'sections/Organizations/interfaces';
import { useContext, useEffect, useMemo, useState } from 'react';
import { APIRequest } from 'utils/api.utils';
import { useRouter } from 'next/router';
import PageContainer from 'components/containers/PageContainer';
import SellerOrganizationApplicationContent from './Content.application';
import SellerOrganizationContent from './Content.org';
import { Context } from '../context';
import { useNotifications } from 'hooks/notifications.hooks';
import socketService from 'services/socket';
import { STRINGS } from 'data/strings.data';
import { INotification } from 'hooks/notifications.hooks/interfaces';
import { generateUrl } from 'utils/common.utils';
import { DEFAULT_NAV_PATHS } from 'data/nav.data';
import { useAuth } from 'hooks/auth.hook';
import organizationsService from 'sections/Organizations/organizations.service';

const SellerOrganization = () => {
  const [data, setData] = useState<{
    organization: IOrganization;
    orgSeller: IOrganizationSeller;
  }>(null);

  const auth = useAuth();
  const router = useRouter();
  const { handleNewNotification } = useNotifications();
  const { setSummaryContentLeft } = useContext(Context);

  const showOrgApplicationPage = useMemo(
    () =>
      (!data?.organization?.confirmationDate &&
        data?.organization?.rejections?.length > 0 &&
        !!data?.organization?.rejections?.find(el => !el.isResponded)) ||
      (!data?.orgSeller?.confirmationDate &&
        data?.orgSeller?.rejections.length > 0 &&
        !!data?.orgSeller?.rejections.find(el => !el.isResponded)),
    [data],
  );

  useEffect(() => {
    setSummaryContentLeft(null);
  }, []);

  const fetchOrgSeller = async (orgId: string) => {
    const res = await APIRequest({
      method: 'get',
      url: API_ENDPOINTS.ORGANIZATION_SELLER,
      params: {
        organizationId: orgId,
        userId: auth.user.id,
      },
      requireAuth: true,
    });
    return res?.data as IOrganizationSeller;
  };

  useEffect(() => {
    if (Object.keys(router.query).length === 0) return;

    const fetchData = async () => {
      const organization = await organizationsService.fetchOrganization(
        router.query.organizationId as string,
      );

      const orgSeller = await fetchOrgSeller(organization.id);

      if (!!orgSeller?.detachedAt) {
        router.push(
          generateUrl(
            {
              history: DEFAULT_NAV_PATHS.PERSONAL_AREA,
            },
            {
              pathname: APP_PATHS.PERSONAL_AREA,
            },
          ),
        );
        return;
      }

      setData({
        orgSeller,
        organization,
      });
    };
    fetchData();
  }, [router?.query?.organizationId]);

  // Handle notifications
  useEffect(() => {
    if (auth.currentRole.label !== 'seller' || !data?.organization) return;

    socketService.socket
      .off(STRINGS.SERVER_NEW_NOTIFICATION)
      .on(
        STRINGS.SERVER_NEW_NOTIFICATION,
        async (notification: INotification) => {
          handleNewNotification(notification);

          if (data?.organization?.id === notification?.data?.organization?.id) {
            const organization = await organizationsService.fetchOrganization(
              data?.organization?.id,
            );
            const orgSeller = await fetchOrgSeller(organization.id);
            setData(prev => ({
              ...prev,
              organization,
              orgSeller,
            }));
          }
        },
      );
  }, [data?.organization]);

  return (
    <PageContainer contentLoaded={!!data}>
      {showOrgApplicationPage ? (
        <SellerOrganizationApplicationContent {...data} />
      ) : (
        <SellerOrganizationContent {...data} />
      )}
    </PageContainer>
  );
};

export default SellerOrganization;
