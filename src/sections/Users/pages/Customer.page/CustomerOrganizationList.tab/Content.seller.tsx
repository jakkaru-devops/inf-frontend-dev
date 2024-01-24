import { Table } from 'components/common';
import { convertAddressToString } from 'components/common/YandexMap/utils';
import { IRowsWithCount } from 'interfaces/common.interfaces';
import { IJuristicSubject } from 'sections/JuristicSubject/interfaces';
import { IUser } from 'sections/Users/interfaces';
import formatDate from 'date-fns/format';
import { Button, Modal } from 'antd';
import { FC, useState } from 'react';
import { API_SERVER_URL } from 'config/env';

interface IProps {
  user: IUser;
  jurSubjects: IRowsWithCount<IJuristicSubject[]>;
}

interface IModalVisible {
  open: boolean;
  jurSubject?: IJuristicSubject;
}

const CustomerOrganizationListTabContentSeller: FC<IProps> = ({
  user,
  jurSubjects,
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
  console.log(modal.jurSubject?.path);

  return (
    <>
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
              { content: 'ИНН', width: '20%' },
              { content: 'Регион/город', width: '30%' },
              { content: 'Дата регистрации', width: '15%' },
              { content: 'Карточка предприятия', width: '10%' },
            ]}
            rows={jurSubjects.rows.map(jurSubject => ({
              cols: [
                {
                  content: (
                    <div
                      className="d-flex justify-content-start align-items-center text-underline cursor-pointer color-primary-hover"
                      style={{ width: '100%', height: '100%', paddingLeft: 15 }}
                      onClick={() => {
                        setModal({ jurSubject, open: true });
                      }}
                    >
                      {jurSubject.name}
                    </div>
                  ),
                  fontSize: 'large',
                  style: {
                    justifyContent: 'flex-start',
                    padding: 0,
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
                    <Button shape="circle" className="no-bg no-border">
                      <img
                        src="/img/icons/eye-red.svg"
                        alt=""
                        onClick={() => {
                          setModal({ jurSubject, open: true });
                        }}
                      />
                    </Button>
                  ),
                },
              ],
            }))}
          />
        </>
      ) : (
        <h3>Еще не зарегистрированных организаций</h3>
      )}
    </>
  );
};

export default CustomerOrganizationListTabContentSeller;
