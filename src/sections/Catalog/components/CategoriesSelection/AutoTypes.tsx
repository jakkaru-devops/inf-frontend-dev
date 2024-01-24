import classNames from 'classnames';
import { LinkOptional } from 'components/common';
import { IAutoType } from 'sections/Catalog/interfaces/categories.interfaces';
import { FC } from 'react';
import { ICategoriesSelectionProps } from './interfaces';

interface IProps {
  autoTypes: IAutoType[];
  selectedAutoTypeId: IAutoType['id'];
  onAutoTypeClick: ICategoriesSelectionProps['onAutoTypeClick'];
  generateHref?: ICategoriesSelectionProps['generateAutoTypeHref'];
}

const CategoriesSelectionAutoTypes: FC<IProps> = ({
  autoTypes,
  selectedAutoTypeId,
  onAutoTypeClick,
  generateHref,
}) => {
  return (
    <div className="auto-types-wrapper">
      <div className="auto-types">
        {autoTypes.map(autoType => (
          <LinkOptional
            key={autoType.id}
            className={classNames(['auto-types-item', 'user-select-none'], {
              active: [autoType.id, autoType.label].includes(
                selectedAutoTypeId,
              ),
            })}
            onClick={e => onAutoTypeClick(autoType)}
            href={!!generateHref ? generateHref(autoType.id) : null}
            scroll={false}
          >
            <div className="auto-types-item-inner">
              <div className="img">
                <img
                  src={`/img/catalog/${autoType.label}.png`}
                  alt={autoType.name}
                />
              </div>
              <span>{autoType.name}</span>
            </div>
          </LinkOptional>
        ))}
      </div>
    </div>
  );
};

export default CategoriesSelectionAutoTypes;
