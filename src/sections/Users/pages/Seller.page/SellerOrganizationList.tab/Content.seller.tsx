import { Link, Table } from 'components/common';
import { IOrganization } from 'sections/Organizations/interfaces';
import { useLocale } from 'hooks/locale.hook';
import { FC, Fragment } from 'react';
import { IRowsWithCount } from 'interfaces/common.interfaces';
import { Button } from 'antd';
import { generateUrl } from 'utils/common.utils';
import formatDate from 'date-fns/format';

interface IProps {
  organizations: IRowsWithCount<IOrganization[]>;
  checkOrganizationDetach: (organizationId: string) => void;
}

const SellerOrganizationListTabContentSeller: FC<IProps> = ({
  organizations,
  checkOrganizationDetach,
}) => {
  const { locale } = useLocale();

  return (
    <Fragment>
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
                content: org.name,
                href: generateUrl({ organizationId: org.id }),
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
                    открепиться
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

export default SellerOrganizationListTabContentSeller;
