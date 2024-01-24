import { useAuth } from 'hooks/auth.hook';
import { useModalsState } from 'hooks/modal.hook';
import { useEffect, useState } from 'react';
import customerOrganizationsService from 'sections/JuristicSubject/customerOrganizations.service';
import { IJuristicSubject } from 'sections/JuristicSubject/interfaces';
import { openNotification } from 'utils/common.utils';
import { ISelectPayerModalProps } from '.';

export const useHandlers = ({
  handleCardPayment,
  handleInvoicePayment,
}: ISelectPayerModalProps) => {
  const auth = useAuth();
  const [payerType, setPayerType] = useState<'individual' | 'organization'>(
    'individual',
  );
  const [organizations, setOrganizations] = useState<IJuristicSubject[]>([]);
  const [organizationsLoaded, setOrganizationsLoaded] = useState(false);
  const [organizationId, setOrganizationId] = useState<IJuristicSubject['id']>(
    organizations[0]?.id || null,
  );
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'invoice'>(
    'card',
  );
  const submitAllowed =
    payerType === 'organization' ? !!paymentMethod && !!organizationId : true;
  const [submitting, setSubmitting] = useState(false);

  const { Modal: RegistrationModal, openModal } = useModalsState();

  const fetchOrganizations = async () => {
    const res =
      await customerOrganizationsService.fetchCustomerOrganizationList({
        userId: auth.user.id,
      });
    if (!res?.isSucceed) {
      openNotification('Организации не загружены');
      return;
    }

    const items = res?.data?.rows || [];
    setOrganizations(items);
    setOrganizationId(items?.[0]?.id || 'add');
    setOrganizationsLoaded(true);
  };

  useEffect(() => {
    if (!!organizations.length) return;
    fetchOrganizations();
  }, []);

  const selectPayerType = (value: typeof payerType) => setPayerType(value);

  const selectOrganization = (value: typeof organizationId) =>
    setOrganizationId(value);

  const selectPaymentMethod = (value: typeof paymentMethod) =>
    setPaymentMethod(value);

  const handleSubmit = async () => {
    if (!submitAllowed) return;

    setSubmitting(true);

    if (!auth.user.lastname || !auth.user.firstname || !auth.user.email) {
      if (payerType === 'individual') {
        openModal('registrationIndividual');
      }
      if (payerType === 'organization') {
        openModal('registrationPersonalData');
      }
      setSubmitting(false);
      return;
    }

    if (payerType === 'organization' && organizationId === 'add') {
      openModal('registrationJuristicSubject');
      setSubmitting(false);
      return;
    }

    if (payerType === 'individual') await handleCardPayment();

    if (payerType === 'organization') {
      if (paymentMethod === 'card') await handleCardPayment(organizationId);
      if (paymentMethod === 'invoice')
        await handleInvoicePayment(organizationId);
    }

    setSubmitting(false);
  };

  return {
    RegistrationModal,
    payerType,
    organizations,
    organizationsLoaded,
    organizationId,
    paymentMethod,
    submitAllowed,
    submitting,
    selectPayerType,
    selectOrganization,
    selectPaymentMethod,
    handleSubmit,
  };
};
