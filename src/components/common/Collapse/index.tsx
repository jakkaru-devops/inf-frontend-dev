import classNames from 'classnames';
import AnimateHeight from 'react-animate-height';
import Preloader from '../Preloader';
import { FC, ReactNode } from 'react';

interface IProps {
  isExpanded: boolean;
  onChange: (expanded: boolean) => void;
  name?: ReactNode;
  head?: ReactNode;
  childrenLoading?: boolean;
  className?: string;
  isRoot?: boolean;
  children: ReactNode;
}

const Collapse: FC<IProps> = ({
  isExpanded,
  onChange,
  name,
  head,
  childrenLoading,
  className,
  isRoot,
  children,
}) => {
  return (
    <div className="collapse-item-wrapper">
      <div
        className={classNames(['collapse-item', className], {
          'collapse-item--root': isRoot,
          'collapse-item--expanded': isExpanded,
        })}
      >
        {!!head ? (
          head
        ) : (
          <div
            className="collapse-item-head d-flex"
            onClick={() => onChange(!isExpanded)}
          >
            <img
              src="/img/icons/arrow-down-red.svg"
              className={classNames('collapse-item-arrow')}
            />
            <span className="collapse-item-name">{name}</span>
          </div>
        )}
        <AnimateHeight
          height={isExpanded ? 'auto' : 0}
          className="collapse-item-body"
          duration={300}
        >
          {childrenLoading ? (
            <div style={{ margin: '10px 20px', fontSize: 30 }}>
              <Preloader />
            </div>
          ) : (
            children
          )}
        </AnimateHeight>
      </div>
    </div>
  );
};

export default Collapse;
