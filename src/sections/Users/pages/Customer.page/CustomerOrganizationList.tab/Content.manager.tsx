import { Table } from 'components/common';
import { convertAddressToString } from 'components/common/YandexMap/utils';
import { ISetState, IRowsWithCount } from 'interfaces/common.interfaces';
import { IJuristicSubject } from 'sections/JuristicSubject/interfaces';
import { IUser } from 'sections/Users/interfaces';
import formatDate from 'date-fns/format';
import { Checkbox, Modal } from 'antd';
import { FC, Fragment, useState } from 'react';
import { API_SERVER_URL } from 'config/env';
import { APIRequest } from 'utils/api.utils';
import { API_ENDPOINTS } from 'data/paths.data';
import { generateUrl, openNotification } from 'utils/common.utils';

interface IProps {
  user: IUser;
  jurSubjects: IRowsWithCount<IJuristicSubject[]>;
  setJurSubjects: ISetState<IProps['jurSubjects']>;
}
interface IModalVisible {
  open: boolean;
  jurSubject?: IJuristicSubject;
}

const CustomerOrganizationListTabContentManager: FC<IProps> = ({
  user,
  jurSubjects,
  setJurSubjects,
}) => {
  const [modal, setModal] = useState<IModalVisible>({
    open: false,
    jurSubject: undefined,
  });

  const handleOpenModal = (handle: boolean) => {
    setModal(prevState => {
      return { ...prevState, open: handle };
    });
  };

  const updateSpecialClientStatus = async (
    id: IJuristicSubject['id'],
    isSpecialClient: boolean,
  ) => {
    const res = await APIRequest({
      method: 'patch',
      url: API_ENDPOINTS.USER_JURISTIC_SUBJECT_SPECIAL_STATUS,
      params: { id },
      data: { isSpecialClient },
      requireAuth: true,
    });
    if (!res?.isSucceed) {
      openNotification(
        res?.message || 'Не удалось обновить статус организации',
      );
      return;
    }

    const newValue = res.data?.isSpecialClient;
    const newJurSubjects = jurSubjects;
    newJurSubjects.rows.find(el => el.id === id).isSpecialClient = newValue;
    setJurSubjects({ ...newJurSubjects });
  };

  const updatePostponedPaymentAllowed = async (
    id: IJuristicSubject['id'],
    postponedPaymentAllowed: boolean,
  ) => {
    const res = await APIRequest({
      method: 'patch',
      url: API_ENDPOINTS.USER_JURISTIC_SUBJECT_POSTPONED_PAYMENT_ALLOWED,
      params: { id },
      data: { postponedPaymentAllowed },
      requireAuth: true,
    });
    if (!res?.isSucceed) {
      openNotification(res?.message || 'Не удалось обновить статус отсрочки');
      return;
    }

    const newValue = res.data?.postponedPaymentAllowed;
    const newJurSubjects = jurSubjects;
    newJurSubjects.rows.find(el => el.id === id).postponedPaymentAllowed =
      newValue;
    setJurSubjects({ ...newJurSubjects });
  };

  return (
    <Fragment>
      {jurSubjects.count > 0 ? (
        <>
          <Modal
            open={modal.open}
            onCancel={() => {
              handleOpenModal(false);
            }}
            centered
            width={'1000px'}
            footer={null}
            title={modal.jurSubject?.name}
            children={
              <object>
                <embed
                  src={`${API_SERVER_URL}/files/${modal.jurSubject?.path}`}
                  width="100%"
                  style={{ height: '90vh' }}
                  type="application/pdf"
                />
              </object>
            }
          />
          <Table
            cols={[
              { content: 'Наименование', width: '25%' },
              { content: 'ИНН', width: '12%' },
              { content: 'Регион/город', width: '27%' },
              { content: 'Дата регистрации', width: '10%' },
              { content: 'Особый клиент', width: '13%' },
              { content: 'Отсрочка', width: '13%' },
            ]}
            rows={jurSubjects.rows.map(jurSubject => ({
              cols: [
                {
                  content: jurSubject.name,
                  href: generateUrl({ organizationId: jurSubject.id }),
                  fontSize: 'large',
                  style: {
                    justifyContent: 'flex-start',
                    paddingLeft: 15,
                  },
                },

                { content: jurSubject.inn || <>&mdash;</> },
                {
                  content: convertAddressToString(
                    jurSubject.juristicAddress,
                    'region/city',
                  ),
                },
                {
                  content: formatDate(
                    new Date(jurSubject.createdAt),
                    'dd.MM.yyyy',
                  ),
                },
                {
                  content: (
                    <Checkbox
                      checked={jurSubject?.isSpecialClient}
                      onChange={e =>
                        updateSpecialClientStatus(
                          jurSubject.id,
                          e.target.checked,
                        )
                      }
                    />
                  ),
                },
                {
                  content: (
                    <Checkbox
                      checked={jurSubject?.postponedPaymentAllowed}
                      onChange={e =>
                        updatePostponedPaymentAllowed(
                          jurSubject.id,
                          e.target.checked,
                        )
                      }
                    />
                  ),
                },
              ],
            }))}
          />
        </>
      ) : (
        <h3>Еще не зарегистрированных организаций</h3>
      )}
    </Fragment>
  );
};

export default CustomerOrganizationListTabContentManager;
