import { Table } from 'components/common';
import { IOrganization } from 'sections/Organizations/interfaces';
import { useLocale } from 'hooks/locale.hook';
import { FC, Fragment, useState } from 'react';
import { IRowsWithCount } from 'interfaces/common.interfaces';
import formatDate from 'date-fns/format';
import { API_SERVER_URL } from 'config/env';
import { Modal } from 'antd';

interface IProps {
  organizations: IRowsWithCount<IOrganization[]>;
}

interface IModalVisible {
  open: boolean;
  org?: IOrganization;
}

const SellerOrganizationListTabContentCustomer: FC<IProps> = ({
  organizations,
}) => {
  const { locale } = useLocale();

  const [modal, setModal] = useState<IModalVisible>({
    open: false,
    org: undefined,
  });

  const handleOpenModal = (handle: boolean) => {
    setModal(prevState => {
      return { ...prevState, open: handle };
    });
  };

  return (
    <Fragment>
      <>
        <Modal
          open={modal.open}
          onCancel={() => {
            handleOpenModal(false);
          }}
          centered
          width={'1000px'}
          footer={null}
          title={modal.org?.name}
          children={
            <object>
              <embed
                src={`${API_SERVER_URL}/files/${modal.org?.path}`}
                width="100%"
                style={{ height: '90vh' }}
                type="application/pdf"
              />
            </object>
          }
        />
        <Table
          cols={[
            { content: 'Наименование', width: '30%' },
            { content: locale.juristicSubjects.inn, width: '25%' },
            { content: 'Регион/Город', width: '25%' },
            { content: 'Дата регистрации', width: '20%' },
          ]}
          rows={organizations.rows.map(org => ({
            cols: [
              {
                content: (
                  <div
                    style={{ cursor: 'pointer', textDecoration: 'underline' }}
                  >
                    {org.name}
                  </div>
                ),
                fontSize: 'large',
                onClick: () => {
                  setModal({ org, open: true });
                },
              },
              { content: org.inn },
              {
                content: org?.juristicAddress?.settlement,
              },
              {
                content: formatDate(
                  new Date(org?.confirmationDate),
                  'dd.MM.yyyy',
                ),
              },
            ],
          }))}
        />
      </>
    </Fragment>
  );
};

export default SellerOrganizationListTabContentCustomer;
