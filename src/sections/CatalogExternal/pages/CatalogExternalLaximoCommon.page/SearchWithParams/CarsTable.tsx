import { FC, Fragment, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Table } from 'components/common';
import { ILaximoCarsList, ILaximoVehicle } from '../../../interfaces';
import { splitArrayByIndexes } from 'utils/arrays.utils';
import _ from 'lodash';
import { generateUrl } from 'utils/common.utils';
import { DownOutlined, UpOutlined } from '@ant-design/icons';
import { ITableCol } from 'components/common/Table/interfaces';

const CarsTableForParamsSearch: FC<ILaximoCarsList> = ({
  vehicles,
  onVehicleClick,
}) => {
  const router = useRouter();
  const routeWithoutType = router.asPath.split('?')[0];

  const getAttributes = (vehicles: ILaximoVehicle[]) => {
    const attributes = Object.keys(vehicles[0].attributes);
    vehicles.map(vehicle => {
      const diff = _.difference(Object.keys(vehicle.attributes), attributes);
      diff.map(at => attributes.push(at));
    });

    const colNames = _.uniq(
      _.flatten(
        vehicles.map(vehicle => {
          return attributes.map(attribute => {
            if (vehicle.attributes[attribute])
              return vehicle.attributes[attribute].name;
          });
        }),
      ),
    ).filter(Boolean);
    colNames.splice(0, 0, 'Название');
    attributes.splice(0, 0, 'Название');
    return {
      attributes,
      colName: colNames,
      width: 100 / attributes.length,
    };
  };

  const [separateVehicles, setSeparateVehicles] =
    useState<ILaximoVehicle[][]>();

  const [isOpenAll, setIsOpenAll] =
    useState<Array<{ index: number; isOpen: boolean }>>();

  const handleToggleTable = (index: number, isOpen: boolean) => {
    const newFlags = [...isOpenAll];
    newFlags[index] = { index, isOpen };
    setIsOpenAll(newFlags);
  };

  useEffect(() => {
    let currentName = vehicles[0].name;
    const indexesArr = [];
    vehicles.map((car, index) => {
      if (car.name !== currentName) {
        currentName = car.name;
        indexesArr.push(index);
      }
    });
    setSeparateVehicles(splitArrayByIndexes(vehicles, indexesArr));
    setIsOpenAll(
      splitArrayByIndexes(vehicles, indexesArr).map((_, index) => ({
        index,
        isOpen: false,
      })),
    );
  }, []);

  const getCols = (vehicles: ILaximoVehicle[]) => {
    const attributesKeys = getAttributes(vehicles);
    return attributesKeys.colName
      .map(colName => ({
        content: colName,
        width: `${attributesKeys.width}%`,
      }))
      .filter(Boolean);
  };

  const getRows = (vehicles: ILaximoVehicle[]) => {
    const attributesKeys = getAttributes(vehicles);

    return vehicles.map(car => {
      const colsInRow: ITableCol[] = attributesKeys.attributes.map(
        (attributeName, index) =>
          index == 0
            ? {
                content: car.name,
                href: generateUrl(
                  { ssd: car.ssd, laximoType: router?.query?.laximoType },
                  { pathname: routeWithoutType + '/' + car.vehicleid },
                ),
                style: {
                  maxWidth: `${attributesKeys.width}%`,
                  alignItems: 'flex-start',
                  fontSize: '0.6vw',
                },
                onClick: e => {
                  if (!!onVehicleClick) {
                    e.preventDefault();
                    onVehicleClick(car);
                  }
                },
              }
            : {
                content: car.attributes[attributeName]?.value,
                style: {
                  maxWidth: `${attributesKeys.width}%`,
                  alignItems: 'flex-start',
                  fontSize: '0.6vw',
                },
              },
      );
      return {
        cols: colsInRow,
      };
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <h2>Найденные автомобили</h2>
      {separateVehicles?.map((vehicles, index) => (
        <Fragment key={`${vehicles[0].vehicleid}_${index}`}>
          <h3>{vehicles[0].name}</h3>
          {isOpenAll && !isOpenAll[index].isOpen ? (
            <>
              <Table
                cols={getCols([vehicles[0]])}
                rows={getRows([vehicles[0]])}
                style={{
                  paddingBottom: 15,
                  alignSelf: 'center',
                  width:
                    getAttributes(vehicles).attributes.length < 10
                      ? '100%'
                      : '90vw',
                }}
              />
              <div style={{ marginBottom: 15 }}>
                <a onClick={() => handleToggleTable(index, true)}>
                  Больше модификаций <DownOutlined />
                </a>
              </div>
            </>
          ) : (
            <>
              <Table
                cols={getCols(vehicles)}
                rows={getRows(vehicles)}
                style={{
                  paddingBottom: 15,
                  alignSelf: 'center',
                  width:
                    getAttributes(vehicles).attributes.length < 10
                      ? '100%'
                      : '90vw',
                }}
              />
              <div style={{ marginBottom: 15 }}>
                <a onClick={() => handleToggleTable(index, false)}>
                  Скрыть <UpOutlined />
                </a>
              </div>
            </>
          )}
        </Fragment>
      ))}
    </div>
  );
};

export default CarsTableForParamsSearch;
