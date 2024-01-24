import { ChangeEvent, FC, useState } from 'react';
import { Button, Input } from 'antd';
import { Container } from 'components/common';
import { APIRequest } from 'utils/api.utils';
import { API_ENDPOINTS } from 'data/paths.data';
import { LaximoUrlType } from '../../../interfaces';
import { useRouter } from 'next/router';

interface SearchDetailWithOemProps {
  setUnits: (units: any) => void;
}

const SearchDetailWithOem: FC<SearchDetailWithOemProps> = ({ setUnits }) => {
  const router = useRouter();
  const [error, setError] = useState<string>();
  const [value, setValue] = useState<string>('');

  const handleValueChange = (value: ChangeEvent<HTMLInputElement>) => {
    setValue(value.target.value.replace(/-/g, ''));
  };

  const handleSearchSubmit = () => {
    setError(undefined);
    APIRequest({
      method: 'get',
      url: API_ENDPOINTS.LAXIMO_UNIT_BY_OEM(
        router?.query?.laximoType.toString() as LaximoUrlType,
      ),
      params: {
        oem: value,
        catalogCode: router?.query?.catalogCode,
        ssd: router?.query?.ssd,
      },
    }).then(res => {
      !res.data?.categories && res.isSucceed
        ? setError('Деталь не найдена')
        : setError(undefined);
      res.isSucceed ? setUnits(res.data.categories) : setError(res.message);
    });
  };

  return (
    <Container style={{ marginBottom: 15 }} noPadding>
      <h2>Поиск по OEM</h2>
      <Input
        onChange={handleValueChange}
        style={{ width: 330 }}
        suffix={
          <Button
            size="small"
            shape="circle"
            className="no-border"
            style={{ marginRight: -3 }}
            onClick={handleSearchSubmit}
          >
            <img src="/img/search.svg" alt="" />
          </Button>
        }
      />
      {error && <div style={{ marginTop: 15 }}> Деталь не найдена </div>}
    </Container>
  );
};

export default SearchDetailWithOem;
