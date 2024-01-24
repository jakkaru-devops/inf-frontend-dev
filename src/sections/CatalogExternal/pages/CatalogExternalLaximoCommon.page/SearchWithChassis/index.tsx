import { ChangeEvent, FC, Fragment, useState } from 'react';
import {
  ILaximoCarsList,
  ILaximoCatalogInfoOperations,
  ILaximoVehicle,
  LaximoUrlType,
} from '../../../interfaces';
import { APIRequest } from 'utils/api.utils';
import { API_ENDPOINTS } from 'data/paths.data';
import { Container } from 'components/common';
import { Button, Input } from 'antd';
import Link from 'next/link';
import { useRouter } from 'next/router';

interface SerchWithChassisProps {
  operations: ILaximoCatalogInfoOperations;
  onVehicleClick?: (car: ILaximoVehicle) => void;
}

const SearchWithChassis: FC<SerchWithChassisProps> = ({
  operations,
  onVehicleClick,
}) => {
  const [cars, setCars] = useState<ILaximoCarsList>();
  const [error, setError] = useState<string>();
  const [value, setValue] = useState<Array<string>>();

  const router = useRouter();

  const handleValueChange = (value: ChangeEvent<HTMLInputElement>) => {
    setValue(prevState => [...prevState, value.target.value]);
  };
  const handleSearchSubmit = () => {
    setError(undefined);
    APIRequest({
      method: 'get',
      url: API_ENDPOINTS.LAXIMO_CARS_BY_CHASSIS(
        router.query.laximoType as LaximoUrlType,
      ),
      params: {
        catalogCode: router.query.catalogCode,
        param1: value[0],
        param2: value[1],
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
      <h2> Поиск по шасси</h2>
      {operations.fields.map((field, index) => (
        <Fragment key={`${field.name}_${index}}`}>
          <h2>{field.name}</h2>
          <Input
            onChange={handleValueChange}
            style={{ width: 330 }}
            suffix={
              <>
                <Button
                  size="small"
                  shape="circle"
                  className="no-border"
                  style={{ marginRight: -3 }}
                  onClick={handleSearchSubmit}
                >
                  <img src="/img/search.svg" alt="" />
                </Button>
              </>
            }
          />
        </Fragment>
      ))}

      {cars?.vehicles && (
        <Container noPadding>
          <h2>Найденные автомобили</h2>
          {cars.vehicles.map(car => (
            <Link
              key={car.ssd}
              href={[
                router.asPath,
                `car?vehicleId=${car.vehicleid}&ssd=${car.ssd}`,
              ].join('/')}
              onClick={e => {
                if (!!onVehicleClick) {
                  e.preventDefault();
                  onVehicleClick(car);
                }
              }}
            >
              <a>{car.name}</a>
            </Link>
          ))}
        </Container>
      )}
      {error && <div style={{ marginTop: 15 }}> Автомобиль не найден </div>}
    </Container>
  );
};

export default SearchWithChassis;
