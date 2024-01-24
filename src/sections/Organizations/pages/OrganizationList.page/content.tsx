import { Button, Input } from 'antd';
import FormatDate from 'date-fns/format';
import {
  BreadCrumbs,
  Table,
  Page,
  PageTop,
  PageContent,
  Pagination,
  PageTopPanel,
  Container,
  Link,
  Summary,
} from 'components/common';
import { APP_PATHS } from 'data/paths.data';
import { IOrganization } from 'sections/Organizations/interfaces';
import { ChangeEvent, FC, useEffect, useState } from 'react';
import { NextRouter, useRouter } from 'next/router';
import PageContainer from 'components/containers/PageContainer';
import { useLocale } from 'hooks/locale.hook';
import { generateInnerUrl, generateUrl } from 'utils/common.utils';
import { ISetState, IRowsWithCount } from 'interfaces/common.interfaces';
import { SearchCatalogIcon } from 'components/icons';

interface IProps {
  organizations: IRowsWithCount<IOrganization[]>;
  dataLoaded: boolean;
  newItemsCount: number;
  setNewItemsCount: ISetState<number>;
}

interface IRouterExtended extends NextRouter {
  query: {
    region?: string;
    city?: string;
    search?: string;
  };
}

const OrganizationListPageContent: FC<IProps> = ({
  organizations,
  dataLoaded,
  newItemsCount,
  setNewItemsCount,
}) => {
  const { locale } = useLocale();
  const router = useRouter() as IRouterExtended;

  const [searchTimeout, setSearchTimeout] = useState(null as NodeJS.Timeout);
  const [filters, setFilters] = useState({
    region: '',
    city: '',
    search: '',
  });

  useEffect(() => {
    setFilters({
      region: router.query.region || '',
      city: router.query.city || '',
      search: router.query.search || '',
    });
  }, [router.query]);

  const handleFilterInput = (e: ChangeEvent<HTMLInputElement>) => {
    const newFilters = {
      ...filters,
      [e.target.name]: e.target.value,
    };
    // Set value to state
    setFilters(newFilters);
    // Clear timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    // Request
    setSearchTimeout(
      setTimeout(() => {
        const params = [];
        Object.keys(newFilters).forEach(key => {
          params.push([key, newFilters[key]]);
        });
        router.push(generateUrl(newFilters));
      }, 500),
    );
  };

  return (
    <Page>
      <BreadCrumbs
        list={[
          {
            link: APP_PATHS.ORGANIZATION_LIST,
            text: locale.organizations.organizationList,
          },
        ]}
      />
      <PageTop
        title={
          <div className="d-flex align-items-center">
            <h2>{locale.organizations.organizationList}</h2>
            {newItemsCount > 0 && (
              <Button
                type="default"
                className="ml-20 mt-5"
                onClick={() => {
                  router.push(generateUrl({ page: 1 }));
                  setNewItemsCount(0);
                }}
              >
                <span>Показать новые организации</span>
                <span className="ml-15">{newItemsCount}</span>
              </Button>
            )}
          </div>
        }
        colRight={
          <>
            <Button type="primary">
              <Link
                href={generateInnerUrl(APP_PATHS.ADD_ORGANIZATION, {
                  text: locale.organizations.addOrganization,
                })}
              >
                {locale.organizations.addOrganization}
              </Link>
            </Button>
          </>
        }
      />
      <PageTopPanel>
        <Container className="d-flex align-items-center justify-content-between">
          <div className="d-flex">
            <label className="d-flex align-items-center mr-20">
              <div className="input-name mr-15">{locale.address.region}</div>
              <Input
                prefix={<SearchCatalogIcon />}
                name="region"
                value={filters.region}
                onChange={handleFilterInput}
                size="small"
                style={{
                  width: 200,
                }}
              />
            </label>
            <label className="d-flex align-items-center mr-20">
              <div className="input-name mr-15">{locale.address.city}</div>
              <Input
                prefix={<SearchCatalogIcon />}
                name="city"
                value={filters.city}
                onChange={handleFilterInput}
                size="small"
                style={{
                  width: 150,
                }}
              />
            </label>
          </div>
          <label className="d-flex align-items-center">
            <div className="input-name mr-15">
              {locale.organizations.findName +
                `/ ` +
                locale.juristicSubjects.inn}
            </div>
            <Input
              prefix={<SearchCatalogIcon />}
              name="search"
              value={filters.search}
              onChange={handleFilterInput}
              size="small"
              style={{
                width: 200,
              }}
            />
          </label>
        </Container>
      </PageTopPanel>
      <PageContainer contentLoaded={dataLoaded}>
        <PageContent>
          {organizations.count > 0 ? (
            <Table
              cols={[
                { content: locale.juristicSubjects.name, width: '20%' },
                { content: locale.juristicSubjects.inn, width: '12%' },
                { content: locale.other.dateRegistration, width: '15%' },
                {
                  content: locale.organizations.amountSellers,
                  width: '14%',
                },
                {
                  content: locale.organizations.amountBranchials,
                  width: '14%',
                },
                { content: 'Статус', width: '25%' },
              ]}
              rowsLoading={!dataLoaded}
              rows={organizations.rows.map(org => ({
                cols: [
                  {
                    content: org.name,
                    href: generateInnerUrl(APP_PATHS.ORGANIZATION(org.id), {
                      text: org.name,
                    }),
                    fontSize: 'large',
                  },
                  { content: org.inn || '' },
                  {
                    content: org.confirmationDate ? (
                      FormatDate(new Date(org.confirmationDate), 'dd.MM.yyyy')
                    ) : (
                      <>&mdash;</>
                    ),
                  },
                  { content: org.sellers.length },
                  { content: org.branches.length },
                  { content: org.status.name },
                ],
                notificationsNumber: org?.unreadNotifications?.length || 0,
              }))}
            />
          ) : (
            <h3>{locale.organizations.notFound}</h3>
          )}
        </PageContent>
        {organizations.count > 0 && (
          <Summary>
            <Pagination total={organizations.count} />
          </Summary>
        )}
      </PageContainer>
    </Page>
  );
};

export default OrganizationListPageContent;
