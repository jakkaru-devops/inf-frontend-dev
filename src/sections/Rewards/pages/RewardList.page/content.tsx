import {
  BreadCrumbs,
  Table,
  Page,
  PageTop,
  PageContent,
  PageTopPanel,
  Container,
  Summary,
  Pagination,
} from 'components/common';
import { API_ENDPOINTS, APP_PATHS } from 'data/paths.data';
import { IReward, IRewardGroup } from 'sections/Orders/interfaces';
import formatDate from 'date-fns/format';
import { EyeOutlined } from '@ant-design/icons';
import { FC, useState } from 'react';
import { Select, Button } from 'antd';
import { RewardCalculator } from 'sections/Rewards/components/RewardCalculator';
import { APIRequest } from 'utils/api.utils';
import { downloadBase64 } from 'utils/files.utils';
import { useLocale } from 'hooks/locale.hook';
import { generateUrl, openNotification } from 'utils/common.utils';
import { getUserName } from 'sections/Users/utils';
import { IUser } from 'sections/Users/interfaces';
import _ from 'lodash';
import { IRowsWithCount } from 'interfaces/common.interfaces';
import { useRouter } from 'next/router';
import { useAuth } from 'hooks/auth.hook';

interface IProps {
  rewardGroups: IRowsWithCount<IRewardGroup[]>;
  filters: {
    years: number[];
    months: string[];
  };
}

const MONTHS = [
  'Январь',
  'Февраль',
  'Март',
  'Апрель',
  'Май',
  'Июнь',
  'Июль',
  'Август',
  'Сентябрь',
  'Октябрь',
  'Ноябрь',
  'Декабрь',
];

const RewardListPageContent: FC<IProps> = ({ rewardGroups, filters }) => {
  const router = useRouter();
  const { locale } = useLocale();
  const auth = useAuth();
  const isAdmin = ['manager', 'operator'].includes(auth.currentRole.label);
  const [monthsOpened, setMonthsOpened] = useState(() => {
    let openState = {};
    rewardGroups.rows.forEach(rewardGroup => {
      const key = !!rewardGroup?.seller
        ? `${rewardGroup.month}_${rewardGroup?.seller?.id}`
        : rewardGroup.month;
      openState[key] = false;
    });
    return openState;
  });

  const years = filters.years;
  // if (yearFilter) {
  //   rewardGroups = rewardGroups.filter(({ month }) =>
  //     month.includes(yearFilter.toString()),
  //   );
  // }
  const months = filters.months;
  // if (monthFilter) {
  //   rewardGroups = rewardGroups.filter(
  //     ({ month }) => month.split('.')[1] === monthFilter,
  //   );
  // }

  const yearFilter = Number(router?.query?.year) || 'all';
  const monthFilter = (router.query?.month as string) || 'all';

  const handleYearFilterChange = (value: number) => {
    /* if (
      value !== null &&
      monthFilter &&
      !rewardGroups.find(({ month }) => month.includes(value.toString()))
    ) {
      setMonthFilter(null);
    } */
    if (!Number(value)) value = null;
    router.push(
      generateUrl({
        year: value,
      }),
    );
  };

  const handleMonthFilterChange = (value: string) => {
    if (value === 'all') value = null;
    router.push(
      generateUrl({
        month: value,
      }),
    );
  };

  const toggleMonthOpen = (month: string, sellerId?: IUser['id']) => {
    const key = !!sellerId ? `${month}_${sellerId}` : month;
    setMonthsOpened(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const downloadMonthRewardList = async (
    givenAtMonth: IReward['givenAtMonth'],
    sellerId?: IUser['id'],
  ) => {
    const res = await APIRequest({
      method: 'get',
      url: API_ENDPOINTS.ORDER_REWARD_LIST_MONTH,
      params: { givenAtMonth, sellerId },
      requireAuth: true,
    });

    if (!res.isSucceed) {
      openNotification(res?.message);
      return;
    }

    const data = {
      file: res.data.file,
      title: res.data.title as string,
    };

    downloadBase64(data.file, data.title);
  };

  const getPeriodEndDate = (periodStr: string) => {
    const dateArr = periodStr.split('.').filter((__, i) => i > 0);
    const periodEndDay = Number(periodStr.split('.')[0].split('-')[1]);
    return new Date(Number(dateArr[1]), Number(dateArr[0]) - 1, periodEndDay);
  };

  return (
    <Page>
      <BreadCrumbs
        list={[
          {
            link: APP_PATHS.REWARD_LIST,
            text: locale.common.rewards,
          },
        ]}
      />
      <PageTop title={locale.common.rewards} />
      <PageTopPanel>
        <Container className="d-flex align-items-center">
          <div className="mr-30">
            <span>Месяц: </span>
            <Select
              size="small"
              placeholder="все"
              style={{ minWidth: '123px' }}
              value={monthFilter}
              onChange={value => handleMonthFilterChange(value)}
            >
              <Select.Option value={'all'}>все</Select.Option>
              {months.map((month, i) => (
                <Select.Option
                  key={i}
                  value={(MONTHS.findIndex(el => el === month) + 1).padZero()}
                >
                  {month}
                </Select.Option>
              ))}
            </Select>
          </div>
          <div className="mr-50">
            <span>Год: </span>
            <Select
              size="small"
              placeholder="все"
              value={yearFilter}
              onChange={handleYearFilterChange}
            >
              <Select.Option value={'all'}>все</Select.Option>
              {years.map(year => (
                <Select.Option key={year} value={year}>
                  {year}
                </Select.Option>
              ))}
            </Select>
          </div>
          <RewardCalculator />
        </Container>
      </PageTopPanel>
      <PageContent>
        {rewardGroups.rows.length > 0 ? (
          <Table
            cols={[
              isAdmin && { content: 'Продавец', width: '30%' },
              { content: 'Месяц/год', width: isAdmin ? '18%' : '25%' },
              { content: 'Сумма заказов', width: isAdmin ? '24%' : '30%' },
              { content: 'Вознаграждение', width: isAdmin ? '18%' : '25%' },
              { content: 'Отчетный документ', width: isAdmin ? '10%' : '20%' },
            ].filter(Boolean)}
            rows={rewardGroups.rows.map(rewardGroup => ({
              cols: [
                isAdmin && {
                  content: (
                    <span
                      style={{ cursor: 'pointer' }}
                      onClick={() =>
                        toggleMonthOpen(
                          rewardGroup.month,
                          rewardGroup?.seller?.id,
                        )
                      }
                    >
                      {getUserName(rewardGroup?.seller, 'full')}
                    </span>
                  ),
                },
                {
                  content: (
                    <span
                      style={{ cursor: 'pointer' }}
                      onClick={() =>
                        toggleMonthOpen(
                          rewardGroup.month,
                          rewardGroup?.seller?.id,
                        )
                      }
                    >
                      {rewardGroup.month}
                    </span>
                  ),
                },
                {
                  content: rewardGroup.ordersSum.separateBy(' ') + ' ₽',
                },
                {
                  content: rewardGroup.rewardSum.separateBy(' ') + ' ₽',
                },
                {
                  content: (
                    <Button
                      shape="circle"
                      className="no-bg no-border"
                      disabled={
                        getPeriodEndDate(rewardGroup.month).getTime() >=
                        new Date().getTime()
                      }
                    >
                      <EyeOutlined
                        className="text__24Low"
                        onClick={async e => {
                          e.preventDefault();
                          e.stopPropagation();
                          await downloadMonthRewardList(
                            rewardGroup.month,
                            rewardGroup?.seller?.id,
                          );
                        }}
                      />
                    </Button>
                  ),
                },
              ].filter(Boolean),
              childContent: (
                <Table
                  cols={[
                    isAdmin && { content: null, width: '30%' },
                    {
                      content: 'Дата вознаграждения',
                      width: isAdmin ? '18%' : '25%',
                    },
                    { content: '№ заказа', width: isAdmin ? '12%' : '15%' },
                    { content: 'Сумма', width: isAdmin ? '12%' : '15%' },
                    { content: null, width: isAdmin ? '18%' : '25%' },
                    { content: null, width: isAdmin ? '10%' : '20%' },
                  ].filter(Boolean)}
                  rows={rewardGroup.rewards.map(reward => ({
                    cols: [
                      isAdmin && { content: null },
                      {
                        content: formatDate(
                          new Date(reward.givenAt),
                          'dd.MM.yyyy',
                        ),
                      },
                      { content: reward.order.orderRequest.idOrder },
                      {
                        content: reward.order.totalPrice.separateBy(' ') + ' ₽',
                      },
                      { content: reward.amount.separateBy(' ') + ' ₽' },
                      { content: null },
                    ].filter(Boolean),
                  }))}
                  style={
                    monthsOpened[
                      rewardGroup.month +
                        (!!rewardGroup?.seller
                          ? `_${rewardGroup?.seller?.id}`
                          : '')
                    ]
                      ? {
                          marginLeft: 0,
                          paddingLeft: 0,
                          borderTop: '1px solid black',
                          borderBottom: '1px solid black',
                        }
                      : {
                          display: 'none',
                          marginLeft: 0,
                          paddingLeft: 0,
                        }
                  }
                />
              ),
            }))}
            style={{ maxWidth: isAdmin ? 1000 : '720px' }}
          />
        ) : (
          <h3>У Вас пока нет вознаграждений</h3>
        )}
      </PageContent>
      <Summary>
        {rewardGroups.count > 0 && (
          <Pagination total={rewardGroups.count} pageSize={10} />
        )}
      </Summary>
    </Page>
  );
};

export default RewardListPageContent;
