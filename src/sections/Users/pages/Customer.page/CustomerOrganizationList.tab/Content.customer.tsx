import { AgreeModal, AlertModal, Link, Table } from 'components/common';
import { convertAddressToString } from 'components/common/YandexMap/utils';
import { useModalsState } from 'hooks/modal.hook';
import { IRowsWithCount } from 'interfaces/common.interfaces';
import { IJuristicSubject } from 'sections/JuristicSubject/interfaces';
import { IUser } from 'sections/Users/interfaces';
import { generateUrl } from 'utils/common.utils';
import formatDate from 'date-fns/format';
import { Button } from 'antd';
import useHandlers from './handlers';
import { FC, Fragment } from 'react';

interface IProps {
  user: IUser;
  jurSubjects: IRowsWithCount<IJuristicSubject[]>;
}

const CustomerOrganizationListTabContentCustomer: FC<IProps> = ({
  user,
  jurSubjects,
}) => {
  const { Modal, openModal } = useModalsState();
  const {
    locale,
    deleteOrgAlertMessage,
    setDeleteOrgAlertMessage,
    handleDeleteAlert,
    deleteOrgAgreeState,
    setDeleteOrgAgreeState,
    handleDelete,
  } = useHandlers({
    openModal,
  });

  return (
    <Fragment>
      {jurSubjects.count > 0 ? (
        <Table
          cols={[
            { content: 'Наименование', width: '25%' },
            { content: 'ИНН', width: '20%' },
            { content: 'Регион/город', width: '30%' },
            { content: 'Дата регистрации', width: '15%' },
            { content: null, width: '10%' },
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
                  <span
                    className="color-primary text-underline"
                    style={{ cursor: 'pointer' }}
                    onClick={() => handleDeleteAlert(jurSubject.id)}
                  >
                    удалить
                  </span>
                ),
              },
            ],
          }))}
        />
      ) : (
        <h3>Еще не зарегистрированных организаций</h3>
      )}

      <Button type="primary" className="mt-20">
        <Link href={generateUrl({ organizationId: 'add' })}>
          {locale.organizations.addOrganization}
        </Link>
      </Button>

      <AlertModal
        open={!!deleteOrgAlertMessage}
        onCancel={() => setDeleteOrgAlertMessage(null)}
        message={deleteOrgAlertMessage}
        width={650}
      />
      <AgreeModal
        open={!!deleteOrgAgreeState}
        onCancel={() => setDeleteOrgAgreeState(null)}
        message={deleteOrgAgreeState?.message}
        okButtonText="Удалить"
        onAgree={() => handleDelete(deleteOrgAgreeState?.orgId)}
        width={450}
      />
    </Fragment>
  );
};

export default CustomerOrganizationListTabContentCustomer;
