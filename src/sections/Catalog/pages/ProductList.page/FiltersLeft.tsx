import { useRouter } from 'next/router';
import { Button } from 'antd';
import FilterGroup from './FilterGroup';
import { useLocale } from 'hooks/locale.hook';
import { FC, useContext, useState } from 'react';
import { ProductListContext } from './context';
import { generateUrl } from 'utils/common.utils';
import classNames from 'classnames';

interface IProps {
  mode?: 'sale';
  className?: string;
}

const FiltersLeft: FC<IProps> = ({ mode, className }) => {
  const { locale } = useLocale();
  const router = useRouter();
  const { filters, filterGroups } = useContext(ProductListContext);

  const handleSearch = () => {
    const resultFilters = {
      ...filters,
    };
    router.push(
      generateUrl(
        {
          ...resultFilters,
          page: 1,
          layout: router.query?.layout,
          orderBy: router.query?.orderBy,
          pageSize: router.query?.pageSize,
          history: router.query?.history,
          search: router?.query?.search,
          orderRequestId: router?.query?.orderRequestId,
        },
        {
          removeCurrentParams: true,
        },
      ),
    );
  };

  return (
    <div className={classNames(['catalog__sidebar-wrapper', className])}>
      <div className="catalog__sidebar">
        <div className="catalog__acc">
          {Object.values(filterGroups).map(filterGroup => (
            <FilterGroup
              key={filterGroup.label}
              label={filterGroup.label}
              mode={mode}
            />
          ))}
          <Button type="primary" onClick={handleSearch}>
            {locale.common.search}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FiltersLeft;
