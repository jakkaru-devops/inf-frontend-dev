import { Button, Checkbox, Select } from 'antd';
import { Container, Modal, Preloader } from 'components/common';
import { IModalPropsBasic } from 'components/common/Modal/interfaces';
import { useAuth } from 'hooks/auth.hook';
import { FC } from 'react';
import { useHandlers } from './handlers';
import { IJuristicSubject } from 'sections/JuristicSubject/interfaces';

export interface ISelectPayerModalProps {
  handleCardPayment: (organizationId?: IJuristicSubject['id']) => Promise<void>;
  handleInvoicePayment: (
    organizationId: IJuristicSubject['id'],
  ) => Promise<void>;
}

type IProps = IModalPropsBasic & ISelectPayerModalProps;

const SelectPayerModal: FC<IProps> = ({
  handleCardPayment,
  handleInvoicePayment,
  ...rest
}) => {
  const auth = useAuth();
  if (!auth?.isAuthenticated) return <></>;

  const {
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
  } = useHandlers({ handleCardPayment, handleInvoicePayment });

  return (
    <Modal {...rest} destroyOnClose={false}>
      <Container>
        <h2 className="text_24 color-black mb-20">Продолжить как</h2>

        <div className="d-flex mb-20">
          {(['individual', 'organization'] as Array<typeof payerType>).map(
            (item, i) => (
              <Button
                key={i}
                type={payerType === item ? 'primary' : 'ghost'}
                className="w-100 mr-5"
                onClick={() => selectPayerType(item)}
              >
                {item === 'individual' && 'Физическое лицо'}
                {item === 'organization' && 'Юридическое лицо'}
              </Button>
            ),
          )}
        </div>

        {payerType === 'organization' &&
          (organizationsLoaded ? (
            <div className="mb-20">
              <span className="block mb-5">Организация</span>
              <Select
                className="bg-light-gray w-100 mb-5"
                value={organizationId}
                onChange={selectOrganization}
              >
                {organizations?.length > 0 &&
                  organizations.map(organization => (
                    <Select.Option
                      key={organization.id}
                      value={organization.id}
                    >
                      {organization.name}
                    </Select.Option>
                  ))}
                <Select.Option value="add">
                  + Добавить организацию
                </Select.Option>
              </Select>
              <p className="mb-20 color-gray" style={{ fontSize: 13 }}>
                Для добавления новой организации нажмите "Продолжить"
              </p>

              <span className="block mb-5">Способ оплаты</span>
              <div className="d-flex">
                <Checkbox
                  value="cardPayment"
                  checked={paymentMethod === 'card'}
                  onChange={() => selectPaymentMethod('card')}
                >
                  по карте юр. лица
                </Checkbox>
                <Checkbox
                  value="invoicePayment"
                  checked={paymentMethod === 'invoice'}
                  onChange={() => selectPaymentMethod('invoice')}
                >
                  по счёту
                </Checkbox>
              </div>
            </div>
          ) : (
            <div className="mt-20">
              <Preloader />
            </div>
          ))}

        <Button
          type="primary"
          style={{ marginLeft: 'auto' }}
          disabled={!submitAllowed}
          onClick={handleSubmit}
          loading={submitting}
        >
          Продолжить
        </Button>
      </Container>

      <RegistrationModal
        jurSubjects={organizations}
        jurSubjectId={organizationId}
        paymentActions={{
          handleCardPayment,
          handleInvoicePayment,
        }}
        selectedAction={
          paymentMethod === 'card'
            ? 'handleCardPayment'
            : 'handleInvoicePayment'
        }
      />
    </Modal>
  );
};

export default SelectPayerModal;
