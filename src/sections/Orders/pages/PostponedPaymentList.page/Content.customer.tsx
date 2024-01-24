import { Table } from 'components/common';
import { useLocale } from 'hooks/locale.hook';
import { IRowsWithCount } from 'interfaces/common.interfaces';
import { FC, Fragment, useState } from 'react';
import { IPostponedPayment } from 'sections/Orders/interfaces';
import { formatPrice } from 'utils/common.utils';
import { POSTPONED_PAYMENT_STATUSES } from './data';
import { getPlural } from 'utils/languages.utils';
import PostponedPaymentModalCustomer from 'sections/Orders/components/PostponedPaymentModalCustomer';
import { useRouter } from 'next/router';

interface IProps {
  postponedPayments: IRowsWithCount<IPostponedPayment[]>;
}

const PostponedPaymentListPageContentCustomer: FC<IProps> = ({
  postponedPayments,
}) => {
  const router = useRouter();
  const { locale } = useLocale();
  const [openPostponedPayment, setOpenPostponedPayment] =
    useState<IPostponedPayment>(null);

  return (
    <Fragment>
      <Table
        cols={[
          { content: 'Продавец', width: '25%' },
          { content: 'Максимальная сумма', width: '20%' },
          { content: 'Отсрочка', width: '15%' },
          { content: 'Статус', width: '15%' },
          { content: 'Действия', width: '25%' },
        ]}
        rows={postponedPayments.rows.map(item => {
          const days =
            item.status === 'PENDING'
              ? item.daysRequested
              : item?.daysApproved || item.daysRequested;

          return {
            cols: [
              {
                content: (
                  <span className="text-bold text-underline text-left">
                    {item.organization.name}
                    <br />
                    ИНН {item.organization.inn}
                  </span>
                ),
              },
              {
                content: !!item?.maxSum
                  ? `${formatPrice(item?.maxSum)} руб.`
                  : 'Не ограничена',
              },
              {
                content: `${days} ${getPlural({
                  language: 'ru',
                  num: days,
                  forms: locale.plurals.day,
                })}`,
              },
              {
                content: (
                  <span
                    style={{
                      color: POSTPONED_PAYMENT_STATUSES[item.status].color,
                    }}
                  >
                    {POSTPONED_PAYMENT_STATUSES[item.status].name}
                  </span>
                ),
              },
              {
                content: (
                  <span
                    className="color-primary text-underline cursor-pointer"
                    onClick={() => setOpenPostponedPayment(item)}
                  >
                    Изменить
                  </span>
                ),
                noWrapper: true,
                className: 'd-flex align-items-center p-10',
              },
            ],
          };
        })}
      />
      <PostponedPaymentModalCustomer
        open={!!openPostponedPayment}
        onClose={() => setOpenPostponedPayment(null)}
        postponedPayment={openPostponedPayment}
        onSubmit={() => {
          setOpenPostponedPayment(null);
          router.push(router.asPath, null, { scroll: false });
        }}
      />
    </Fragment>
  );
};

export default PostponedPaymentListPageContentCustomer;
