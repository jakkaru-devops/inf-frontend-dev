import { ITabGroup } from './interfaces';
import classNames from 'classnames';
import { Link } from 'components/common';
import { Badge } from 'antd';
import RefundIcon from 'sections/Refunds/components/RefundIcon';
import TabGroupUnderList from './UnderList';
import { FC } from 'react';

const TabGroup: FC<ITabGroup> = ({
  list,
  className,
  style,
  scroll,
  children,
}) => {
  list = list.filter(({ label, title }) => label || title);
  scroll = typeof scroll !== 'undefined' ? scroll : true;

  return (
    <div className={classNames(['tab-group', className])} style={style}>
      <ul className="tab-group__list">
        {list.map((tab, i) => (
          <li
            key={i}
            className={classNames('tab-group__item', {
              active: tab.isActive,
              'before-active': list[i + 1]?.isActive,
            })}
            style={{
              zIndex: tab.isActive ? list.length : list.length - i,
            }}
          >
            <Badge
              count={tab.notificationsNumber || 0}
              size="small"
              style={{ marginTop: 0, marginRight: 20 }}
            >
              <Link href={tab?.href} scroll={scroll}>
                <span>{tab.title}</span>
                {tab.rollback && <RefundIcon />}
              </Link>
            </Badge>
          </li>
        ))}
      </ul>
      <TabGroupUnderList>{children}</TabGroupUnderList>
    </div>
  );
};

export default TabGroup;
