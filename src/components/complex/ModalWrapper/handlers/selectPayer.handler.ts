import { ModalType } from 'components/complex/ModalWrapper/interfaces';
import { useState } from 'react';
import { IJuristicSubject } from 'sections/JuristicSubject/interfaces';
import { useLocale } from 'hooks/locale.hook';
import { useAuth } from 'hooks/auth.hook';

const useHandlers = ({
  jurSubjects,
  paymentActions,
  openModal,
}: {
  jurSubjects: IJuristicSubject[];
  paymentActions: {
    handleInvoicePayment: (
      jurSubjectId: IJuristicSubject['id'],
    ) => Promise<void>;
    handleCardPayment: (jurSubjectId?: IJuristicSubject['id']) => Promise<void>;
  };
  openModal: (type: ModalType) => void;
}) => {
  const auth = useAuth();
  const { locale } = useLocale();

  const [payer, setPayer] = useState<'individual' | 'jurSubject'>('individual');
  const [jurSubjectId, setJurSubjectId] = useState<IJuristicSubject['id']>(
    jurSubjects?.length > 0 ? jurSubjects[0]?.id : '0',
  );
  const [selectedAction, setSelectedAction] = useState<
    'handleInvoicePayment' | 'handleCardPayment'
  >(null);
  const [submitting, setSubmitting] = useState(false);

  const allowContinue =
    payer === 'jurSubject' ? !!selectedAction && !!jurSubjectId : true;

  // handlers
  const handlePayerToggle = (payer: 'individual' | 'jurSubject') => {
    setPayer(payer);
  };

  const handleJurSubjectSelect = (jurSubjectId: IJuristicSubject['id']) =>
    setJurSubjectId(jurSubjectId);

  const handlePaymentTypeChange = (
    selectedAction: 'handleInvoicePayment' | 'handleCardPayment',
  ) => setSelectedAction(selectedAction);

  const handleContinue = async () => {
    if (!allowContinue) return;

    setSubmitting(true);

    if (!auth.user.lastname || !auth.user.firstname || !auth.user.email) {
      if (payer === 'individual') {
        openModal('registrationIndividual');
      }
      if (payer === 'jurSubject') {
        openModal('registrationPersonalData');
      }
      setSubmitting(false);
      return;
    }

    if (payer === 'jurSubject' && jurSubjectId === '0') {
      openModal('registrationJuristicSubject');
      setSubmitting(false);
      return;
    }

    if (payer === 'individual') {
      await paymentActions.handleCardPayment();
      setSubmitting(false);
      return;
    }

    await paymentActions[selectedAction](jurSubjectId);
  };

  return {
    locale,
    payer,
    jurSubjectId,
    selectedAction,
    submitting,
    setSubmitting,
    handlers: {
      handlePayerToggle,
      handleJurSubjectSelect,
      handlePaymentTypeChange,
    },
    allowContinue,
    handleContinue,
  };
};

export default useHandlers;
