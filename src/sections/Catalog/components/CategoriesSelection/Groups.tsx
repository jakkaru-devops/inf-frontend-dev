import { Checkbox } from 'antd';
import classNames from 'classnames';
import { LinkOptional } from 'components/common';
import { IProductGroup } from 'sections/Catalog/interfaces/categories.interfaces';
import { FC } from 'react';
import { ICategoriesSelectionProps } from './interfaces';
import { renderHtml } from 'utils/common.utils';
import { useResizeDetector } from 'react-resize-detector';

interface IProps {
  groups: IProductGroup[];
  selectedGroupIds: IProductGroup['id'][];
  onGroupClick: (item: IProductGroup) => void;
  generateHref?: ICategoriesSelectionProps['generateGroupHref'];
  showCheckboxes?: boolean;
}

const CategoriesSelectionGroups: FC<IProps> = ({
  groups,
  selectedGroupIds,
  onGroupClick,
  generateHref,
  showCheckboxes,
}) => {
  const { width, ref: resizeRef } = useResizeDetector();
  const maxHeight = groups.length * 9 * (1300 / width);

  return (
    <div className="product-groups-wrapper" ref={resizeRef}>
      <div className="product-groups" style={{ maxHeight }}>
        {groups.map(group => (
          <LinkOptional
            key={group.id}
            className={classNames('product-groups-item', {
              'user-select-none': showCheckboxes,
            })}
            onClick={e => {
              if (showCheckboxes) e.preventDefault();
              onGroupClick(group);
            }}
            href={!!generateHref ? generateHref(group.id) : null}
          >
            {showCheckboxes ? (
              <Checkbox checked={selectedGroupIds.includes(group.id)}>
                {renderHtml(group.name)}
              </Checkbox>
            ) : (
              renderHtml(group.name)
            )}
          </LinkOptional>
        ))}
      </div>
    </div>
  );
};

export default CategoriesSelectionGroups;
