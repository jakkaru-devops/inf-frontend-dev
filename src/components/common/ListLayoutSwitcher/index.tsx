import classNames from 'classnames';
import { CSSProperties, FC } from 'react';
import ListLayoutTileIcon from './ListLayoutTileIcon';
import { HamburgerIcon } from 'components/icons';

type IListLayoutOption = 'row' | 'tile';

interface IProps {
  className?: string;
  style?: CSSProperties;
  layout: IListLayoutOption;
  onChange: (layout: IListLayoutOption) => void;
}

const ListLayoutSwitcher: FC<IProps> = ({
  className,
  style,
  layout,
  onChange,
}) => {
  if (!['row', 'tile'].includes(layout)) layout = 'row';

  const handleChange = () => {
    const value = layout === 'row' ? 'tile' : 'row';
    onChange(value);
  };

  return (
    <div
      className={classNames(['list-layout-switcher', className], {
        active: layout === 'tile',
      })}
      style={style}
      onClick={() => handleChange()}
    >
      <div className="list-layout-switcher__bubble"></div>
      <div className="list-layout-switcher__options-wrapper">
        <div
          className={classNames('list-layout-switcher__option', {
            active: layout === 'row',
          })}
        >
          <HamburgerIcon />
        </div>
        <div
          className={classNames('list-layout-switcher__option', {
            active: layout === 'tile',
          })}
        >
          <ListLayoutTileIcon />
        </div>
      </div>
    </div>
  );
};

export default ListLayoutSwitcher;
