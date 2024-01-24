import { ChangeEvent, FC, useState } from 'react';
import { Button, Input } from 'antd';
import { Container } from 'components/common';
import { APIRequest } from 'utils/api.utils';
import { API_ENDPOINTS } from 'data/paths.data';
import {
  ILaximoCarsList,
  ILaximoVehicle,
  LaximoUrlType,
} from '../../../interfaces';
import { useRouter } from 'next/router';
import CarsTableForParamsSearch from '../SearchWithParams/CarsTable';

interface IProps {
  onVehicleClick?: (car: ILaximoVehicle) => Promise<void>;
}

const SearchWithVinOrFrame: FC<IProps> = ({ onVehicleClick }) => {
  const router = useRouter();
  const [cars, setCars] = useState<ILaximoCarsList>();
  const [error, setError] = useState<string>();
  const [value, setValue] = useState<string>('');

  const handleValueChange = (value: ChangeEvent<HTMLInputElement>) => {
    setValue(value.target.value.replace(/-/g, ''));
  };

  const handleSearchSubmit = () => {
    setError(undefined);
    APIRequest({
      method: 'get',
      url: API_ENDPOINTS.LAXIMO_GET_CAR_BY_VIN_OR_FRAME(
        router?.query?.laximoType.toString() as LaximoUrlType,
      ),
      params: {
        vinOrFrame: value,
      },
    }).then(res => {
      !res.data?.vehicles && res.isSucceed
        ? setError('Автомобиль не найден')
        : setError(undefined);
      res.isSucceed ? setCars(res.data) : setError(res.message);
    });
  };

  return (
    <Container noPadding>
      <h2>Поиск по VIN/FRAME</h2>
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
      {cars?.vehicles && (
        <Container noPadding style={{ paddingTop: 15 }}>
          <h2>Найденные автомобили</h2>
          <Container noPadding style={{ paddingTop: 15 }}>
            <CarsTableForParamsSearch
              {...cars}
              onVehicleClick={onVehicleClick}
            />
          </Container>
        </Container>
      )}
      {error && <div style={{ marginTop: 15 }}>Автомобиль не найден</div>}
    </Container>
  );
};

export default SearchWithVinOrFrame;
