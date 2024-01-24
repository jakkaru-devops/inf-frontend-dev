import { APIRequest } from 'utils/api.utils';
import { API_ENDPOINTS } from 'data/paths.data';
import ParamsForSearchCars from './Params';
import {
  ILaximoCarsList,
  ILaximoVehicle,
  LaximoUrlType,
} from '../../../interfaces';
import CarsTableForParamsSearch from './CarsTable';
import { Container } from 'components/common';
import { Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import { FC, memo, useCallback, useEffect, useState } from 'react';

interface ICatalogExternalLaximoSearchWithParamsProps {
  catalogCode: string;
  laximoType: LaximoUrlType;
  onVehicleClick?: (car: ILaximoVehicle) => Promise<void>;
}

const CatalogExternalLaximoSearchWithParams: FC<ICatalogExternalLaximoSearchWithParamsProps> =
  memo(({ catalogCode, laximoType, onVehicleClick }) => {
    const [params, setParams] = useState<{ steps: Array<any> }>();
    const [carsList, setCarsList] = useState<ILaximoCarsList>();

    const [error, setError] = useState<boolean>();
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [reloadData, setReloadData] = useState<boolean>(false);

    useEffect(() => {
      setIsLoading(true);
      APIRequest({
        method: 'get',
        url: API_ENDPOINTS.LAXIMO_WIZARDS(laximoType),
        params: {
          catalogCode: catalogCode,
        },
      }).then(res => {
        setIsLoading(false);
        res.isSucceed ? setParams(res.data) : setError(true);
      });
    }, [reloadData]);

    const getVehiclesBySsd = useCallback((ssd: string) => {
      APIRequest({
        method: 'get',
        url: API_ENDPOINTS.LAXIMO_CARS_BY_SSD(laximoType),
        params: {
          catalogCode: catalogCode,
          ssd: ssd,
        },
      }).then(res => {
        res.isSucceed ? setCarsList(res.data) : setError(true);
      });
    }, []);

    const onChooseParam = useCallback((ssd: string) => {
      setIsLoading(true);
      APIRequest({
        method: 'get',
        url: API_ENDPOINTS.LAXIMO_WIZARDS_NEXT(laximoType),
        params: {
          catalogCode: catalogCode,
          ssd: ssd,
        },
      }).then(res => {
        setIsLoading(false);
        res.isSucceed ? setParams(res.data) : setError(true);
      });
    }, []);

    return (
      <Container noPadding style={{ marginTop: 40 }}>
        {!carsList ? (
          <ParamsForSearchCars
            params={params}
            onChooseParam={onChooseParam}
            setReloadData={setReloadData}
            reloadData={reloadData}
            isLoading={isLoading}
            getCars={getVehiclesBySsd}
          />
        ) : (
          <CarsTableForParamsSearch
            {...carsList}
            onVehicleClick={onVehicleClick}
          />
        )}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            opacity: '1',
            transition: 'opacity .5s',
          }}
        >
          <Spin
            spinning={isLoading}
            indicator={<LoadingOutlined style={{ fontSize: 50 }} />}
          />
        </div>
      </Container>
    );
  });

export default CatalogExternalLaximoSearchWithParams;
