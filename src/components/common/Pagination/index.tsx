import { CSSProperties, FC } from 'react';
import { NextRouter, useRouter } from 'next/router';
import AntdPagination, { PaginationProps } from 'antd/lib/pagination';
import classNames from 'classnames';
import { generateUrl } from 'utils/common.utils';

interface ExtendedNextRouter extends NextRouter {
  query: {
    page: string;
    pageSize: string;
  };
}

const DEFAULT_LIMIT = 10;

interface IProps extends PaginationProps {
  wrapClassName?: string;
  wrapStyle?: CSSProperties;
  pagePropName?: string;
  disableScroll?: boolean;
}

const getItemTitle = (
  page: number,
  type: 'page' | 'prev' | 'next' | 'jump-prev' | 'jump-next',
  step?: number,
) => {
  if (!step) step = 5;
  switch (type) {
    case 'page':
      return page.toString();
    case 'prev':
      return 'Назад';
    case 'next':
      return 'Вперед';
    case 'jump-prev':
      return `Назад на ${step}`;
    case 'jump-next':
      return `Вперед на ${step}`;
    default:
      return null;
  }
};

const Pagination: FC<IProps> = props => {
  const router = useRouter() as ExtendedNextRouter;
  let { pagePropName } = props;

  if (!pagePropName) pagePropName = 'page';
  const scroll = !props?.disableScroll;

  return (
    <div
      className={classNames([
        'd-flex justify-content-center',
        props.wrapClassName,
      ])}
      style={props?.wrapStyle}
    >
      <AntdPagination
        {...props}
        showSizeChanger={false}
        onChange={pageNumber => {
          router.push(generateUrl({ [pagePropName]: pageNumber }), null, {
            scroll,
          });
        }}
        pageSize={
          parseInt(router.query.pageSize) || props.pageSize || DEFAULT_LIMIT
        }
        current={parseInt(router.query?.[pagePropName]) || props.current || 1}
        className={classNames('pagination-component')}
        itemRender={(page, type, el) => (
          <span title={getItemTitle(page, type)}>{el}</span>
        )}
      />
    </div>
  );
};

export default Pagination;
