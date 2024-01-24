import { Link, Table } from 'components/common';
import { IOrganization } from 'sections/Organizations/interfaces';
import { useLocale } from 'hooks/locale.hook';
import { FC, Fragment, useState } from 'react';
import { IRowsWithCount } from 'interfaces/common.interfaces';
import { Button, Modal } from 'antd';
import { generateUrl } from 'utils/common.utils';
import formatDate from 'date-fns/format';
import { API_SERVER_URL } from 'config/env';

interface IProps {
  organizations: IRowsWithCount<IOrganization[]>;
  checkOrganizationDetach: (organizationId: string) => void;
}

interface IModalVisible {
  open: boolean;
  org?: IOrganization;
}

const SellerOrganizationListTabContentManager: FC<IProps> = ({
  organizations,
  checkOrganizationDetach,
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
          { content: 'Наименование', width: '25%' },
          { content: locale.juristicSubjects.inn, width: '20%' },
          { content: 'Регион/Город', width: '25%' },
          { content: 'Дата регистрации', width: '20%' },
          { content: null, width: '10%' },
        ]}
        rows={organizations.rows.map(org => {
          return {
            cols: [
              {
                content: (
                  <div
                    style={{ cursor: 'pointer', textDecoration: 'underline' }}
                  >
                    {org.name}
                  </div>
                ),
                onClick: () => {
                  setModal({ org, open: true });
                },
                fontSize: 'large',
                style: {
                  textAlign: 'left',
                  justifyContent: 'flex-start',
                  paddingLeft: 15,
                },
              },
              { content: org.inn },
              {
                content: org?.juristicAddress?.settlement,
              },
              {
                content: org?.confirmationDate
                  ? formatDate(new Date(org?.confirmationDate), 'dd.MM.yyyy')
                  : '-',
              },
              {
                content: org?.confirmationDate ? (
                  <span
                    className="color-primary text-underline cursor-pointer"
                    onClick={() => checkOrganizationDetach(org.id)}
                  >
                    открепить
                  </span>
                ) : (
                  '-'
                ),
              },
            ],
          };
        })}
      />
      <Button type="primary" className="mt-10">
        <Link href={generateUrl({ organizationId: 'add' })}>
          {locale.organizations.addOrganization}
        </Link>
      </Button>
    </Fragment>
  );
};

export default SellerOrganizationListTabContentManager;
