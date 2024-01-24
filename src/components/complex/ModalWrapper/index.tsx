import { Button, Modal, Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import { ModalType } from './interfaces';
import {
  IUser,
  IUserRole,
  IUserRoleLabelsDefault,
} from 'sections/Users/interfaces';
import { ITransportCompany } from 'sections/Shipping/interfaces';
import {
  IOrder,
  IOrderRequest,
  IRefundExchangeRequest,
  IRequestProduct,
} from 'sections/Orders/interfaces';
import { IAttachment } from 'sections/Catalog/interfaces/products.interfaces';
import { IJuristicSubject } from 'sections/JuristicSubject/interfaces';
import { IDBEntity, ISetState } from 'interfaces/common.interfaces';

// components
import { EditPhone } from './components/EditPhone';
import { RegistrationIndividual } from './components/RegistrationIndividual';
import { RegistrationJuristicSubject } from './components/RegistrationJuristicSubject';
import { RegistrationPersonalData } from './components/RegistrationPersonalData';
import { SetRating } from './components/SetRating';
import { TransportCompanies } from './components/TransportCompanies';
import { Punish } from './components/Punish';
import { AlertMessage } from './components/AlertMessage';
import { DeleteAgree } from './components/DeleteAgree';
import { OrganizationCard } from './components/OrganizationCard';
import { RefundExchangeRequest } from './components/RefundExchangeRequest';
import { RequestRefundExchange } from './components/RequestRefundExchange';
import { Attachments } from './components/Attachments';
import { Complain } from './components/Complain';
import { AttachmentModalContent } from './components/Attachment';
import { FC, useEffect, useState } from 'react';
import { APIRequest } from 'utils/api.utils';
import { API_ENDPOINTS } from 'data/paths.data';
import { IRegisterFileExtended } from 'sections/Auth/interfaces';
import { DocumentModalContent } from './components/Document';

interface IModalWrapperProps {
  type: ModalType | null;
  closeModal: () => void;
  message?: string;
  jurSubjects?: IJuristicSubject[];
  jurSubject?: IJuristicSubject;
  jurSubjectId?: IJuristicSubject['id'];
  offer?: IOrder;
  orderRequest?: IOrderRequest;
  transportCompanies?: ITransportCompany[];
  attachment?: IAttachment;
  attachmentList?: IAttachment[];
  setAttachments?: ISetState<IAttachment[]>;
  setOrder: ISetState<IOrderRequest>;
  doc?: IRegisterFileExtended;
  withUploads?: boolean;
  defendantId?: IUser['id'];
  defendantRoleLabel?: IUserRoleLabelsDefault;
  user?: IUser;
  userRole?: IUserRole;
  roleLabel?: IUserRoleLabelsDefault;
  receiverId?: IUser['id'];
  orderId?: IOrderRequest['id'];
  order?: IOrder;
  deleteId?: IDBEntity['id'];
  requestProduct?: IRequestProduct;
  refundExchangeRequest?: IRefundExchangeRequest;
  refundExchangeHistory?: IRefundExchangeRequest[];
  updateAwaiting?: boolean;
  handleDelete?: (id: IDBEntity['id']) => void;
  handlers?: {
    handleTransportCompanyChange?: (
      orderId: any,
      transportCompanyId: any,
    ) => void;
  };
  paymentActions?: {
    handleInvoicePayment: (
      jurSubjectId: IJuristicSubject['id'],
    ) => Promise<void>;
    handleCardPayment: (jurSubjectId?: IJuristicSubject['id']) => Promise<void>;
  };
  selectedAction?: 'handleInvoicePayment' | 'handleCardPayment';
}

export const ModalWrapper: FC<IModalWrapperProps> = ({
  type,
  closeModal,
  handlers,
  ...props
}) => {
  const commonProps = {
    title: null,
    open: true,
    destroyOnClose: true,
    centered: true,
    footer: null,
    onCancel: closeModal,
  };
  switch (type) {
    case 'editPhone':
      return (
        <Modal {...commonProps} title="Изменить телефон">
          <EditPhone closeModal={closeModal} />
        </Modal>
      );

    case 'registrationIndividual':
      if (!props.paymentActions) return <></>;

      return (
        <Modal {...commonProps} width="auto">
          <RegistrationIndividual paymentActions={props.paymentActions} />
        </Modal>
      );

    case 'registrationJuristicSubject':
      if (!props.paymentActions) return <></>;

      return (
        <Modal {...commonProps} width="auto">
          <RegistrationJuristicSubject
            jurSubjects={props?.jurSubjects}
            jurSubjectId={props.jurSubjectId}
            paymentActions={props.paymentActions}
            selectedAction={props.selectedAction}
          />
        </Modal>
      );

    case 'registrationPersonalData':
      if (!props.paymentActions) return <></>;

      return (
        <Modal {...commonProps} width="auto">
          <RegistrationPersonalData
            jurSubjectId={props.jurSubjectId}
            paymentActions={props.paymentActions}
            selectedAction={props.selectedAction}
          />
        </Modal>
      );

    case 'setRating':
      return (
        <Modal {...commonProps}>
          <SetRating />
        </Modal>
      );

    case 'transportCompanies':
      const [companies, setCompanies] = useState({
        data: [],
        loading: true,
      });

      useEffect(() => {
        if (!props?.offer?.id) return;
        const fetch = async () => {
          console.log(props.offer);
          const { data } = await APIRequest<any>({
            method: 'get',
            url: API_ENDPOINTS.SELLER_OFFER_TRANSPORT,
            params: {
              orderId: props.offer.id,
            },
          });

          setCompanies({
            data: data,
            loading: false,
          });
        };
        companies.data.length === 0 && fetch();
      }, []);

      return (
        <Modal
          {...commonProps}
          title={
            <div className="d-flex justify-content-between">
              <span style={{ fontSize: 30, fontWeight: 700 }}>
                Выберите транспортную компанию
              </span>
              <Button type="primary" onClick={closeModal}>
                Сохранить
              </Button>
            </div>
          }
          className="close-icon-hidden header-border-hidden"
          width={900}
          bodyStyle={{ paddingTop: 0 }}
        >
          <p>
            Стоимость и сроки доставки ориентировочные.
            <br />
            Окончательная стоимость услуг будет уточнена по результатам
            взвешивания и обмера груза при приемке на складе.
          </p>
          {!companies.loading && companies.data.length > 0 ? (
            <TransportCompanies
              offer={props.offer}
              companies={companies.data}
              updateAwaiting={props.updateAwaiting}
              handleTransportCompanyChange={
                handlers?.handleTransportCompanyChange
              }
            />
          ) : (
            <div
              className={
                'd-flex justify-content-start align-items-center pt-50 pb-50'
              }
            >
              <span className={'mr-20'}>Подсчет стоимости доставки...</span>
              <Spin
                indicator={
                  <LoadingOutlined style={{ fontSize: 40, marginLeft: 20 }} />
                }
              />
            </div>
          )}
        </Modal>
      );

    case 'image':
      return (
        <Modal
          {...commonProps}
          width={'auto'}
          title={null}
          className="attachment-modal"
          style={{
            minWidth: 500,
            maxWidth: 800,
            height: 'auto',
          }}
        >
          <AttachmentModalContent
            attachment={props.attachment}
            closeModal={commonProps.onCancel}
          />
        </Modal>
      );

    case 'attachments':
      if (!props.attachmentList) return <></>;

      return (
        <Modal {...commonProps} title="Вложения">
          <Attachments
            attachmentList={props.attachmentList}
            setAttachments={props.setAttachments}
            order={props.orderRequest}
            setOrder={props.setOrder}
            offer={props.offer}
            withUploads={props.withUploads}
          />
        </Modal>
      );
    case 'document':
      return (
        <Modal
          {...commonProps}
          width={800}
          title={null}
          className="attachment-modal"
        >
          <DocumentModalContent
            doc={props.doc}
            closeModal={commonProps.onCancel}
          />
        </Modal>
      );

    case 'complain':
      if (!props.defendantId) return <></>;

      return (
        <Modal {...commonProps} title="Жалоба">
          <Complain
            defendantId={props.defendantId}
            defendantRoleLabel={props.defendantRoleLabel}
            closeModal={closeModal}
          />
        </Modal>
      );

    case 'punish':
      return (
        <Modal
          {...commonProps}
          title={
            props.roleLabel &&
            {
              customer: 'Меры наказания покупателя',
              seller: 'Меры наказания продавца',
              moderator: 'Меры наказания модератора',
              mananger: 'Меры наказания менеджера',
            }[props.roleLabel]
          }
        >
          <Punish
            user={props.user}
            userRole={props.userRole}
            roleLabel={props.roleLabel}
          />
        </Modal>
      );

    case 'alertMessage':
      return (
        <Modal {...commonProps} width="auto">
          <AlertMessage message={props.message} closeModal={closeModal} />
        </Modal>
      );

    case 'deleteAgree':
      return (
        <Modal {...commonProps} width="568px">
          <DeleteAgree
            id={props.deleteId}
            message={props.message}
            handleDelete={props.handleDelete}
            closeModal={closeModal}
          />
        </Modal>
      );

    case 'organizationCard':
      return (
        <Modal {...commonProps} width="595px">
          <OrganizationCard jurSubject={props.jurSubject} />
        </Modal>
      );

    case 'refundExchangeRequest':
      if (!props.refundExchangeRequest) return <></>;

      return (
        <Modal {...commonProps} width="auto">
          <RefundExchangeRequest
            requestProduct={props.requestProduct}
            order={props.order}
            refundExchangeRequest={props.refundExchangeRequest}
            refundExchangeHistory={props.refundExchangeHistory}
          />
        </Modal>
      );

    case 'requestRefundExchange':
      if (!props.requestProduct) return <></>;

      return (
        <Modal {...commonProps} width="auto">
          <RequestRefundExchange
            requestProduct={props.requestProduct}
            order={props.order}
          />
        </Modal>
      );

    default:
      return <></>;
  }
};
