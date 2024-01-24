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
import { API_ENDPOINTS, APP_PATHS } from 'data/paths.data';
import { IUser } from 'sections/Users/interfaces';
import { getUserName } from 'sections/Users/utils';
import {
  formatPhoneNumber,
  generateInnerUrl,
  generateUrl,
  openNotification,
} from 'utils/common.utils';
import FormatDate from 'date-fns/format';
import { useLocale } from 'hooks/locale.hook';
import { ISetState, IRowsWithCount } from 'interfaces/common.interfaces';
import { Button, Input } from 'antd';
import { ChangeEvent, FC, useState } from 'react';
import { APIRequest } from 'utils/api.utils';
import { useRouter } from 'next/router';
import { SearchCatalogIcon } from 'components/icons';
import { useManagerAuth } from 'hooks/useManagerAuth';

interface IProps {
  users: IRowsWithCount<IUser[]>;
  setUsers: ISetState<IRowsWithCount<IUser[]>>;
  newItemsCount: number;
  setNewItemsCount: ISetState<number>;
}

const CustomerListPageContent: FC<IProps> = ({
  users,
  setUsers,
  newItemsCount,
  setNewItemsCount,
}) => {
  const { locale } = useLocale();
  const router = useRouter();
  const [usersName, setUsersName] = useState('');
  const [searchTimeout, setSearchTimeout] = useState(null as NodeJS.Timeout);
  const { loginAsUser } = useManagerAuth();

  const handleNameFilterChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Set value to state
    setUsersName(value);
    // Clear timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    // Request
    setSearchTimeout(
      setTimeout(async () => {
        const res = await APIRequest({
          method: 'get',
          url: API_ENDPOINTS.USER_LIST,
          params: {
            role: 'customer',
            search: value,
          },
          requireAuth: true,
        });
        console.log(res.data);
        if (!res.isSucceed) {
          openNotification(res.message);
          return;
        }
        setUsers(res.data);
      }, 500),
    );
  };

  return (
    <Page>
      <BreadCrumbs
        list={[{ link: APP_PATHS.CUSTOMER_LIST, text: locale.common.buyers }]}
      />
      <PageTop
        title={
          <div className="d-flex align-items-center">
            <h2>{locale.common.buyers}</h2>
            {newItemsCount > 0 && (
              <Button
                type="default"
                className="ml-20 mt-5"
                onClick={() => {
                  router.push(generateUrl({ page: 1 }));
                  setNewItemsCount(0);
                }}
              >
                <span>Показать новых покупателей</span>
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
              value={usersName}
              onChange={handleNameFilterChange}
              style={{
                width: 250,
              }}
              size="small"
            />
          </label>
        </Container>
      </PageTopPanel>
      <PageContent>
        {users.count > 0 ? (
          <Table
            cols={[
              { content: locale.other.fullName, width: '40%' },
              { content: locale.other.phone, width: '30%' },
              { content: locale.other.dateRegistration, width: '30%' },
              { content: 'Действия', width: '15%' },
            ]}
            rows={users.rows.map(user => ({
              cols: [
                {
                  content: getUserName(user, 'full'),
                  fontSize: 'large',
                  href: generateInnerUrl(APP_PATHS.CUSTOMER(user.id), {
                    text: getUserName(user, 'full'),
                  }),
                },
                { content: formatPhoneNumber(user.phone) },
                {
                  content: FormatDate(
                    new Date(user.roles[0].createdAt),
                    'dd.MM.yyyy',
                  ),
                },
                {
                  content: (
                    <span
                      className="text-underline color-primary-hover cursor-pointer"
                      onClick={() =>
                        loginAsUser({ id: user.id, roleLabel: 'customer' })
                      }
                    >
                      авторизоваться
                    </span>
                  ),
                },
              ],
              notificationsNumber: user.unreadNotifications?.length || 0,
            }))}
          />
        ) : (
          <h3>Покупатели не найдены</h3>
        )}
      </PageContent>
      {users.count > 0 && (
        <Summary>
          <Pagination total={users.count} />
        </Summary>
      )}
    </Page>
  );
};

export default CustomerListPageContent;
