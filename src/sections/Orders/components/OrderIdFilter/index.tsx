import { Input } from 'antd';
import { KeyValueItem } from 'components/common';
import { SearchCatalogIcon } from 'components/icons';
import { useRouter } from 'next/router';
import { ChangeEvent, useState } from 'react';
import { generateUrl } from 'utils/common.utils';

const OrderIdFilter = () => {
  const router = useRouter();
  const [idOrder, setIdOrder] = useState(router?.query?.idOrder);
  const [searchTimeout, setSearchTimeout] = useState(null as NodeJS.Timeout);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setIdOrder(value);

    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    setSearchTimeout(
      setTimeout(() => {
        router.push(
          generateUrl({
            page: 1,
            idOrder: value,
          }),
        );
      }, 500),
    );
    return () => clearTimeout(searchTimeout);
  };

  return (
    <KeyValueItem
      keyText="Найти по номеру"
      keyClassName="text-normal"
      value={
        <Input
          prefix={<SearchCatalogIcon />}
          size="small"
          className="ml-5"
          value={idOrder}
          onChange={handleInputChange}
        />
      }
      noColon
    />
  );
};

export default OrderIdFilter;
