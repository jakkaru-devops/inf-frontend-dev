import { Badge } from 'antd';
import classNames from 'classnames';
import { Link } from 'components/common';
import { FC } from 'react';
import { IPersonalAreaNavItem } from 'sections/PersonalArea/interfaces';

const PersonalAreaNavItem: FC<IPersonalAreaNavItem> = ({
  path,
  text,
  img,
  notificationsNumber,
  widthLarge,
  isBlocked,
}) => {
  return (
    <li
      className={classNames('personal-area-page__nav-item', {
        'width-large': widthLarge,
      })}
    >
      <Link
        href={path}
        title={text}
        style={isBlocked ? { opacity: '0.6', cursor: 'not-allowed' } : {}}
        onClick={e => {
          if (isBlocked) e.preventDefault();
        }}
      >
        <Badge
          count={notificationsNumber}
          overflowCount={99}
          size="small"
          className="personal-area-page__nav-item__content position-top-left"
        >
          <div className="personal-area-page__nav-item__img-wrapper">
            <img src={img} alt={text} />
          </div>
          <span className="personal-area-page__nav-item__text">{text}</span>
        </Badge>
      </Link>
    </li>
  );
};

export default PersonalAreaNavItem;
