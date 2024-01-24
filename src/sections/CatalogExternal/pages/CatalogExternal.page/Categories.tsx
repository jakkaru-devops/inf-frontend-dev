import classNames from 'classnames';
import _ from 'lodash';
import { FC, useMemo, useState } from 'react';
import {
  IAutoBrandExternal,
  IAutoTypeExternal,
} from 'sections/Catalog/interfaces/categories.interfaces';

interface IProps {
  autoTypes: IAutoTypeExternal[];
  selectedAutoType?: IAutoTypeExternal['value'];
  onAutoTypeClick?: (autoType: IAutoTypeExternal) => void;
  onLaximoAutoBrandClick: (
    autoBrand: IAutoBrandExternal,
    autoTypeId?: string,
  ) => void;
  onAcatAutoBrandClick: (
    autoBrand: IAutoBrandExternal,
    autoTypeId?: string,
  ) => void;
}

const AUTO_TYPES_ICONS = {
  CARS_NATIVE: 'legkovye',
  CARS_FOREIGN: 'legkovye',
  TRUCKS_NATIVE: 'gruzovye',
  TRUCKS_FOREIGN: 'gruzovye',
  BUS: 'avtobusy',
  SPECIAL_TECH_NATIVE: 'spectehnika',
  SPECIAL_TECH_FOREIGN: 'spectehnika',
  ENGINE: 'dvigateli',
  MOTORCYCLE: 'mototsikly',
};

const ExternalCatalogCategories: FC<IProps> = ({
  autoTypes,
  selectedAutoType: selectedAutoTypeInitial,
  onAutoTypeClick,
  onLaximoAutoBrandClick,
  onAcatAutoBrandClick,
}) => {
  const [selectedAutoType, setSelectedAutoType] = useState<string>(
    selectedAutoTypeInitial || autoTypes?.[0]?.value,
  );
  const autoBrands: any[] = selectedAutoType
    ? autoTypes.find(({ value }) => value === selectedAutoType).marks
    : [];

  const itemGroups = useMemo(() => {
    const obj = _.groupBy(
      autoBrands.map(autoBrand => ({
        ...autoBrand,
        firstLetter: autoBrand?.name?.[0]?.toUpperCase(),
      })),
      'firstLetter',
    );
    return Object.keys(obj).map(firstLetter => ({
      firstLetter,
      items: obj[firstLetter],
    }));
  }, [selectedAutoType]);
  const maxHeight = (autoBrands.length + itemGroups.length) * 5;

  const handleAutoTypeClick = (autoType: IAutoTypeExternal) => {
    setSelectedAutoType(autoType.value);
    if (!!onAutoTypeClick) onAutoTypeClick(autoType);
  };

  return (
    <div className="categories-selection categories-selection--external">
      <div className="auto-types-wrapper">
        <ul className="auto-types">
          {autoTypes.map(autoType => (
            <li
              key={autoType.value}
              className={classNames('auto-types-item', {
                active: autoType.value === selectedAutoType,
              })}
              onClick={() => handleAutoTypeClick(autoType)}
            >
              <div className="auto-types-item-inner">
                <div className="img">
                  <img
                    src={`/img/catalog/${AUTO_TYPES_ICONS[autoType.value]}.png`}
                    alt={autoType.name}
                  />
                </div>
                <span>{autoType.name.replace(/ *\([^)]*\) */g, '')}</span>
                <span className="auto-types-item-subname">
                  {autoType.name.match(/\(([^)]+)\)/)?.[0] || ' '}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </div>
      <div className="auto-brands-wrapper">
        <div className="auto-brands" style={{ maxHeight }}>
          {itemGroups.map(itemGroup => (
            <div key={itemGroup.firstLetter} className="auto-brands-group">
              <div className="auto-brands-group-letter">
                {itemGroup.firstLetter}
              </div>
              {itemGroup.items.map((autoBrand, i) => (
                <div
                  key={`${itemGroup.firstLetter}-${
                    autoBrand?.value || autoBrand?.code
                  }-${i}`}
                  className="auto-brands-item"
                  onClick={() =>
                    autoBrand.laximo
                      ? onLaximoAutoBrandClick(autoBrand, selectedAutoType)
                      : onAcatAutoBrandClick(autoBrand, selectedAutoType)
                  }
                >
                  <span className="auto-brands-item-name">
                    {autoBrand.name}
                    {autoBrand.engine && selectedAutoType !== 'ENGINE' && (
                      <span className="auto-brands-item-suffix">
                        <img
                          src={`/img/catalog/${AUTO_TYPES_ICONS.ENGINE}.png`}
                          alt=""
                        />
                      </span>
                    )}
                  </span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ExternalCatalogCategories;
