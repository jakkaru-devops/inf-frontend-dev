import { Checkbox, Popover } from 'antd';
import { useLocale } from 'hooks/locale.hook';
import { useRouter } from 'next/router';
import { FC, ReactNode, useState } from 'react';
import { generateUrl } from 'utils/common.utils';

interface IProps {
  statusKey?: string;
  statusText?: ReactNode;
  statuses: string[];
}

const OrdersStatusFilter: FC<IProps> = ({
  statusKey,
  statusText,
  statuses,
}) => {
  if (!statusKey) statusKey = 'status';
  if (!statusText) statusText = 'Статус';

  const { locale } = useLocale();
  const router = useRouter();
  const selectedStatuses: string[] = []
    .concat(router?.query?.[statusKey])
    .filter(Boolean);
  const [filtersVisible, setFiltersVisible] = useState(false);

  return (
    <Popover
      content={
        <div>
          {!!selectedStatuses?.length && (
            <div className="d-flex justify-content-end">
              <div
                className="cursor-pointer mb-5"
                style={{
                  color: '#aaa',
                  borderBottom: '1px solid #aaa',
                  display: 'table',
                  lineHeight: '1',
                  textTransform: 'lowercase',
                }}
                onClick={() =>
                  router.push(
                    generateUrl({
                      page: 1,
                      [statusKey]: null,
                    }),
                  )
                }
              >
                Сбросить
              </div>
            </div>
          )}
          {statuses.map(status => (
            <div className="mb-5" key={status}>
              <Checkbox
                checked={selectedStatuses.includes(status)}
                onChange={e =>
                  router.push(
                    generateUrl({
                      page: 1,
                      [statusKey]: e.target.checked
                        ? selectedStatuses.concat(status)
                        : selectedStatuses.filter(el => el !== status),
                    }),
                  )
                }
              >
                {locale.orders.status[status]}
              </Checkbox>
            </div>
          ))}
        </div>
      }
      placement="bottom"
      trigger="click"
      onVisibleChange={visible => setFiltersVisible(visible)}
    >
      <div
        style={{
          position: 'relative',
          // display: 'table',
          margin: 'auto',
          cursor: 'pointer',
        }}
      >
        <div className="d-flex justify-content-center align-items-center user-select-none">
          <span>{statusText}</span>
          <span
            style={{
              position: 'absolute',
              right: 5,
              top: '50%',
              transform: !filtersVisible
                ? 'translateY(-45%) rotate(-180deg)'
                : 'translateY(-60%)',
              transition: '.15s',
            }}
          >
            <img src="/img/icons/arrow-up-black.svg" style={{ width: 15 }} />
          </span>
        </div>
      </div>
    </Popover>
  );
};

export default OrdersStatusFilter;
