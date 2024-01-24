import { Checkbox } from 'antd';
import classNames from 'classnames';
import { EmptyListMark, LinkOptional, Preloader } from 'components/common';
import {
  IAutoBrand,
  IAutoType,
} from 'sections/Catalog/interfaces/categories.interfaces';
import { FC, useMemo } from 'react';
import { ICategoriesSelectionProps } from './interfaces';
import { ISellerAutoBrand } from 'sections/Users/interfaces';
import _ from 'lodash';

interface IProps {
  autoBrands: IAutoBrand[];
  selectedAutoTypeId: IAutoType['id'];
  selectedAutoBrands: ISellerAutoBrand[];
  onAutoBrandClick: (item: IAutoBrand) => void;
  loading: boolean;
  generateHref?: ICategoriesSelectionProps['generateAutoBrandHref'];
  showCheckboxes?: boolean;
}

const CategoriesSelectionAutoBrands: FC<IProps> = ({
  autoBrands,
  selectedAutoTypeId,
  selectedAutoBrands,
  onAutoBrandClick,
  loading,
  generateHref,
  showCheckboxes,
}) => {
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
  }, [selectedAutoTypeId]);
  const maxHeight = (autoBrands.length + itemGroups.length) * 5;

  return (
    <div className="auto-brands-wrapper">
      {!loading ? (
        autoBrands.length > 0 ? (
          <ul className="auto-brands" style={{ maxHeight }}>
            {itemGroups.map(itemGroup => (
              <li key={itemGroup.firstLetter} className="auto-brands-group">
                <div className="auto-brands-group-letter">
                  {itemGroup.firstLetter}
                </div>
                {itemGroup.items.map(autoBrand => (
                  <div
                    key={autoBrand.id}
                    className={classNames('auto-brands-item', {
                      'user-select-none': showCheckboxes,
                    })}
                  >
                    <LinkOptional
                      className="auto-brands-item-name"
                      onClick={e => {
                        if (showCheckboxes) e.preventDefault();
                        onAutoBrandClick(autoBrand);
                      }}
                      href={
                        !!generateHref
                          ? generateHref(autoBrand.id, selectedAutoTypeId)
                          : null
                      }
                    >
                      {showCheckboxes ? (
                        <Checkbox
                          checked={
                            !!selectedAutoBrands.find(
                              item =>
                                item.autoTypeId === selectedAutoTypeId &&
                                item.autoBrandId === autoBrand.id,
                            )
                          }
                        >
                          {autoBrand.name}
                        </Checkbox>
                      ) : (
                        autoBrand.name
                      )}
                    </LinkOptional>
                  </div>
                ))}
              </li>
            ))}
          </ul>
        ) : (
          <EmptyListMark className="mt-5">
            В выбранном виде техники отствуют марки
          </EmptyListMark>
        )
      ) : (
        <Preloader showPreloaderDelay={500} />
      )}
    </div>
  );
};

export default CategoriesSelectionAutoBrands;
