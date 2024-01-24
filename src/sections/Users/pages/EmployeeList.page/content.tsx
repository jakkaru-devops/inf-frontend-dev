import { Button, Input, Select } from 'antd';
import {
  BreadCrumbs,
  Table,
  Page,
  PageTop,
  PageContent,
  PageTopPanel,
  Pagination,
  Link,
  Container,
  Summary,
} from 'components/common';
import { API_ENDPOINTS, APP_PATHS } from 'data/paths.data';
import { IUser } from 'sections/Users/interfaces';
import {
  getUserName,
  getWorkerAvailableRoles,
  isUserBanned,
} from 'sections/Users/utils';
import {
  formatPhoneNumber,
  generateInnerUrl,
  openNotification,
} from 'utils/common.utils';
import { EMPLOYEE_ROLES } from 'sections/Users/data';
import { useState, useEffect, FC, ChangeEvent } from 'react';
import { APIRequest } from 'utils/api.utils';
import socketService from 'services/socket';
import classNames from 'classnames';
import { useLocale } from 'hooks/locale.hook';
import { ISetState, IRowsWithCount } from 'interfaces/common.interfaces';

interface IProps {
  users: IRowsWithCount<IUser[]>;
  setUsers: ISetState<IRowsWithCount<IUser[]>>;
}

const EmployeeListPageContent: FC<IProps> = ({ users, setUsers }) => {
  const { locale } = useLocale();
  const [usersOnline, setUsersOnline] = useState<string[]>(
    users.rows.filter(({ isOnline }) => isOnline).map(({ id }) => id),
  );
  const [usersRole, setUsersRole] = useState('all');
  const [usersName, setUsersName] = useState('');
  const [searchTimeout, setSearchTimeout] = useState(null as NodeJS.Timeout);

  const getUsersRoleArray = (roleLabel: string) => {
    return roleLabel === 'all' ? EMPLOYEE_ROLES : [roleLabel];
  };

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
            requiredRole: getUsersRoleArray(usersRole),
            role: EMPLOYEE_ROLES,
            search: value,
            searchBy: ['name'],
            include: ['address'],
          },
          requireAuth: true,
        });
        if (!res.isSucceed) {
          openNotification(res.message);
          return;
        }
        setUsers(res.data);
      }, 500),
    );
  };

  const handleRoleSelectChange = async (value: string) => {
    setUsersRole(value);
    const res = await APIRequest({
      method: 'get',
      url: API_ENDPOINTS.USER_LIST,
      params: {
        requiredRole: getUsersRoleArray(value),
        role: EMPLOYEE_ROLES,
        search: value,
        searchBy: ['name'],
        include: ['address'],
      },
      requireAuth: true,
    });
    if (!res.isSucceed) {
      openNotification(res.message);
      return;
    }
    setUsers(res.data);
  };

  useEffect(() => {
    const actionType = 'SERVER:ONLINE_STATUS';
    socketService.socket
      .off(actionType)
      .on(actionType, (userList: string[]) => {
        setUsersOnline(userList);
      });
  }, []);

  return (
    <Page className="worker-list-page">
      <BreadCrumbs
        list={[{ link: APP_PATHS.EMPLOYEE_LIST, text: locale.other.staff }]}
      />
      <PageTop title={locale.other.staff} />
      <PageTopPanel>
        <Container className="d-flex align-items-center">
          <label className="d-flex align-items-center mr-20">
            <div className="input-name mr-15">
              {locale.other.searchFullName}
            </div>
            <Input
              value={usersName}
              onChange={handleNameFilterChange}
              style={{
                width: 250,
              }}
              size="small"
            />
          </label>
          <label className="d-flex align-items-center">
            <div className="input-name mr-15">{locale.common.show}</div>
            <Select
              value={usersRole}
              onChange={value => handleRoleSelectChange(value)}
              style={{
                width: 140,
              }}
              size="small"
            >
              <Select.Option value="all">{locale.common.all}</Select.Option>
              <Select.Option value="operator">
                {locale.common.operators}
              </Select.Option>
              <Select.Option value="manager">
                {locale.common.managers}
              </Select.Option>
              <Select.Option value="moderator">
                {locale.common.moderators}
              </Select.Option>
            </Select>
          </label>
        </Container>
      </PageTopPanel>
      <PageContent>
        {users.count > 0 ? (
          <Table
            cols={[
              { content: 'ФИО', width: '25%' },
              { content: 'Online', width: '12%' },
              { content: 'Должность', width: '15%' },
              { content: 'Город', width: '15%' },
              { content: 'Номер телефона', width: '15%' },
              { content: 'Почта', width: '18%' },
            ]}
            rows={users.rows.map(user => {
              const isOnline = usersOnline.includes(user.id);
              const statusText = isOnline ? 'Online' : 'Offline';
              return {
                cols: [
                  {
                    content: getUserName(user, 'full'),
                    fontSize: 'large',
                    href: generateInnerUrl(APP_PATHS.EMPLOYEE(user.id), {
                      text: getUserName(user, 'full'),
                    }),
                  },
                  {
                    content: (
                      <>
                        {user.roles.every(({ id }) =>
                          isUserBanned(user, id),
                        ) ? (
                          <span className="ban-status">
                            {locale.common.blocked}
                          </span>
                        ) : (
                          <span
                            className={classNames('online-marker', {
                              active: isOnline,
                            })}
                          >
                            {statusText}
                          </span>
                        )}
                      </>
                    ),
                    className: 'table-col--online-status',
                  },
                  {
                    content: getWorkerAvailableRoles(user)
                      .map(roleLabel => locale.user[roleLabel])
                      .join(', '),
                  },
                  {
                    content:
                      user.address.city || user.address.settlement || '-',
                  },
                  { content: formatPhoneNumber(user.phone) },
                  { content: user.email },
                ],
              };
            })}
          />
        ) : (
          <h3>{locale.other.employeesNotFound}</h3>
        )}
      </PageContent>

      <Summary containerClassName="justify-content-between">
        <div>{users.count > 0 && <Pagination total={users.count} />}</div>
        <Link
          href={generateInnerUrl(APP_PATHS.ADD_EMPLOYEE, {
            text: locale.navigation['add-employee'],
          })}
        >
          <Button type="primary">{locale.catalog.add}</Button>
        </Link>
      </Summary>
    </Page>
  );
};

export default EmployeeListPageContent;
