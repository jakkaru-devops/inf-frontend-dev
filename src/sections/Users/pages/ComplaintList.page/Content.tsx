import {
  BreadCrumbs,
  Table,
  Page,
  PageTop,
  PageContent,
  PageTopPanel,
  Pagination,
  Summary,
  Container,
} from 'components/common';
import { APP_PATHS } from 'data/paths.data';
import { IComplaint } from 'sections/Users/interfaces';
import { getUserName } from 'sections/Users/utils';
import {
  formatPhoneNumber,
  generateInnerUrl,
  generateUrl,
} from 'utils/common.utils';
import FormatDate from 'date-fns/format';
import { useLocale } from 'hooks/locale.hook';
import { Button, Input } from 'antd';
import { ChangeEvent, FC, useState } from 'react';
import { useRouter } from 'next/router';
import { ISetState, IRowsWithCount } from 'interfaces/common.interfaces';
import { SearchCatalogIcon } from 'components/icons';

interface IProps {
  complaints: IRowsWithCount<IComplaint[]>;
  newItemsCount: number;
  setNewItemsCount: ISetState<number>;
}

const ComplaintListPageContent: FC<IProps> = ({
  complaints,
  newItemsCount,
  setNewItemsCount,
}) => {
  const { locale } = useLocale();
  const router = useRouter();
  const [search, setSearch] = useState(router.query?.search || '');
  const [searchTimeout, setSearchTimeout] = useState(null as NodeJS.Timeout);

  const handleSearch = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Set value to state
    setSearch(value);
    // Clear timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    // Request
    setSearchTimeout(
      setTimeout(async () => {
        router.push(
          generateUrl({
            search: value,
            page: 1,
          }),
        );
      }, 500),
    );
  };

  return (
    <Page>
      <BreadCrumbs
        list={[{ link: APP_PATHS.COMPLAINT_LIST, text: 'Жалобы' }]}
      />
      <PageTop
        title={
          <div className="d-flex align-items-center">
            <h2>Жалобы</h2>
            {newItemsCount > 0 && (
              <Button
                type="default"
                className="ml-20 mt-5"
                onClick={() => {
                  router.push(generateUrl({ page: 1 }));
                  setNewItemsCount(0);
                }}
              >
                <span>Показать новые жалобы</span>
                <span className="ml-15">{newItemsCount}</span>
              </Button>
            )}
          </div>
        }
      />
      <PageTopPanel>
        <Container className="d-flex align-items-center">
          <label className="d-flex align-items-center mr-20">
            <div className="input-name mr-15">Найти по ФИО/Номеру телефона</div>
            <Input
              prefix={<SearchCatalogIcon />}
              value={search}
              onChange={handleSearch}
              style={{
                width: 250,
              }}
              size="small"
            />
          </label>
        </Container>
      </PageTopPanel>
      <PageContent>
        {complaints.count > 0 ? (
          <Table
            cols={[
              { content: locale.other.fullName, width: '40%' },
              { content: 'Аккаунт', width: '20%' },
              { content: locale.other.phone, width: '20%' },
              { content: locale.other.dateRegistration, width: '20%' },
            ]}
            rows={complaints.rows.map(complaint => ({
              cols: [
                {
                  content: getUserName(complaint.defendant, 'full'),
                  fontSize: 'large',
                  href:
                    (complaint.defendantRoleLabel == 'customer' &&
                      generateInnerUrl(
                        APP_PATHS.CUSTOMER(complaint.defendant.id),
                        {
                          text: getUserName(complaint.defendant, 'full'),
                          searchParams: {
                            tab: 'complaints',
                          },
                        },
                      )) ||
                    (complaint.defendantRoleLabel == 'seller' &&
                      generateInnerUrl(
                        APP_PATHS.SELLER(complaint.defendant.id),
                        {
                          text: getUserName(complaint.defendant, 'full'),
                          searchParams: {
                            tab: 'complaints',
                          },
                        },
                      )),
                  style: {
                    textAlign: 'left',
                    justifyContent: 'flex-start',
                    paddingLeft: 15,
                  },
                },
                { content: locale.user[complaint.defendantRoleLabel] },
                { content: formatPhoneNumber(complaint.defendant.phone) },
                {
                  content: FormatDate(
                    new Date(complaint.defendant.createdAt),
                    'dd.MM.yyyy',
                  ),
                },
              ],
              notificationsNumber: complaint?.unreadNotifications?.length || 0,
            }))}
          />
        ) : (
          <h3>Жалобы не найдены</h3>
        )}
      </PageContent>
      {complaints.count > 0 && (
        <Summary>
          <Pagination total={complaints.count} pageSize={10} />
        </Summary>
      )}
    </Page>
  );
};

export default ComplaintListPageContent;
