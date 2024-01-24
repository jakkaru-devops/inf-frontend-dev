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
import { IUser } from 'sections/Users/interfaces';
import { getUserName } from 'sections/Users/utils';
import {
  formatPhoneNumber,
  generateInnerUrl,
  generateUrl,
} from 'utils/common.utils';
import FormatDate from 'date-fns/format';
import { useLocale } from 'hooks/locale.hook';
import { IRowsWithCount, ISetState } from 'interfaces/common.interfaces';
import { Button, Input, Select } from 'antd';
import { FC } from 'react';
import classNames from 'classnames';
import {
  IAutoBrand,
  IAutoType,
  IProductGroup,
} from 'sections/Catalog/interfaces/categories.interfaces';
import SellerCategoriesModal from 'sections/Users/components/SellerCategoriesModal';
import { useHandlers } from './handlers';
import { SearchCatalogIcon } from 'components/icons';
import { useManagerAuth } from 'hooks/useManagerAuth';

interface IProps {
  users: IRowsWithCount<IUser[]>;
  newItemsCount: number;
  setNewItemsCount: ISetState<number>;
  autoTypes: IRowsWithCount<IAutoType[]>;
  productGroups: IRowsWithCount<IProductGroup[]>;
  autoBrands: IRowsWithCount<IAutoBrand[]>;
}

const SellerListPageContent: FC<IProps> = ({
  users,
  newItemsCount,
  setNewItemsCount,
  autoTypes,
  autoBrands: autoBrandsInit,
  productGroups,
}) => {
  const { locale } = useLocale();
  const {
    router,
    usersName,
    handleNameFilterChange,
    handleMainCategoryChange,
    selectedAutoType,
    groupSearch,
    handleGroupFilterSearch,
    filteredGroups,
    handleAutoBrandChange,
    autoBrandSearch,
    handleAutoBrandFilterSearch,
    filteredAutoBrands,
    setSelectedUser,
    selectedUser,
  } = useHandlers({ autoTypes, autoBrands: autoBrandsInit, productGroups });
  const { loginAsUser } = useManagerAuth();

  return (
    <Page>
      <BreadCrumbs
        list={[{ link: APP_PATHS.SELLER_LIST, text: locale.other.sellers }]}
      />
      <PageTop
        title={
          <div className="d-flex align-items-center">
            <h2>{locale.other.sellers}</h2>
            {newItemsCount > 0 && (
              <Button
                type="default"
                className="ml-20 mt-5"
                onClick={() => {
                  router.push(generateUrl({ page: 1 }));
                  setNewItemsCount(0);
                }}
              >
                <span>Показать новых продавцов</span>
                <span className="ml-15">{newItemsCount}</span>
              </Button>
            )}
          </div>
        }
      />
      <PageTopPanel>
        <Container className="d-flex align-items-center">
          <label className="d-flex align-items-center mr-20">
            <div className="input-name mr-10 fz-14">
              Найти по ФИО/Номеру телефона
            </div>
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
          <label className="d-flex align-items-center mr-20">
            <div className="input-name mr-10 fz-14">Категории</div>
            <Select
              style={{ width: 200 }}
              size="small"
              value={selectedAutoType || router.query?.group}
              onChange={value => handleMainCategoryChange(value as string)}
              showSearch={true}
              searchValue={groupSearch}
              filterOption={false}
              onSearch={value => handleGroupFilterSearch(value)}
              options={[
                (!!selectedAutoType || !!router.query?.group) && {
                  label: 'Сбросить',
                  value: null,
                },
                !groupSearch && {
                  label: 'Виды',
                  options: autoTypes.rows.map(autoType => ({
                    label: autoType.name,
                    value: autoType.id,
                  })),
                },
                {
                  label: 'Сопутствующие товары',
                  options: filteredGroups.map(group => ({
                    label: group.name,
                    value: group.id,
                  })),
                },
              ].filter(Boolean)}
            />
          </label>
          {!!selectedAutoType && (
            <label className="d-flex align-items-center">
              <div className="input-name mr-10">Марка</div>
              <Select
                style={{ width: 170 }}
                size="small"
                value={router.query?.autoBrand}
                onChange={value => handleAutoBrandChange(value as string)}
                showSearch={true}
                searchValue={autoBrandSearch}
                filterOption={false}
                onSearch={value => handleAutoBrandFilterSearch(value)}
                options={filteredAutoBrands.map(autoBrand => ({
                  label: autoBrand.name,
                  value: autoBrand.id,
                }))}
              />
            </label>
          )}
        </Container>
      </PageTopPanel>
      <PageContent>
        {users.count > 0 ? (
          <Table
            cols={[
              { content: locale.other.fullName, width: '30%' },
              { content: 'Организация', width: '20%' },
              { content: locale.other.phone, width: '20%' },
              { content: locale.other.dateRegistration, width: '15%' },
              { content: 'Категории', width: '15%' },
              { content: 'Действия', width: '15%' },
            ]}
            rows={users.rows.map(user => ({
              cols: [
                {
                  content: getUserName(user, 'full'),
                  fontSize: 'large',
                  href: generateInnerUrl(APP_PATHS.SELLER(user.id), {
                    text: getUserName(user, 'full'),
                  }),
                  style: {
                    textAlign: 'left',
                    justifyContent: 'flex-start',
                    paddingLeft: 15,
                  },
                },
                {
                  content:
                    user?.organizations?.length === 1
                      ? user.organizations[0].name
                      : user?.organizations?.length,
                  fontSize: 'large',
                  href: generateInnerUrl(APP_PATHS.SELLER(user.id), {
                    text: getUserName(user, 'full'),
                    searchParams: {
                      tab: 'organizations',
                    },
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
                      onClick={() => setSelectedUser(user)}
                    >
                      категории
                    </span>
                  ),
                },
                {
                  content: (
                    <span
                      className="text-underline color-primary-hover cursor-pointer"
                      onClick={() =>
                        loginAsUser({ id: user.id, roleLabel: 'seller' })
                      }
                    >
                      авторизоваться
                    </span>
                  ),
                },
              ],
              notificationsNumber: user.unreadNotifications?.length || 0,
              className: classNames({
                highlighted:
                  !!user?.roles?.[0]?.bannedUntil || !!user?.bannedUntil,
              }),
            }))}
          />
        ) : (
          <h3>Продавцы не найдены</h3>
        )}
      </PageContent>
      {users.count > 0 && (
        <Summary>
          <Pagination total={users.count} />
        </Summary>
      )}

      <SellerCategoriesModal
        open={!!selectedUser}
        onClose={() => setSelectedUser(null)}
        user={selectedUser}
      />
    </Page>
  );
};

export default SellerListPageContent;
