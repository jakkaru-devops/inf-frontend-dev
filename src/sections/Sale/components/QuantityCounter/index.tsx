import { Button } from 'antd';
import classNames from 'classnames';
import { FC } from 'react';

interface IProps {
  count: number;
  setCount: (value: number) => void;
  className?: string;
  disabledUp: boolean;
  disabledDown: boolean;
  style?: { height: string };
}

const QuantityCounter: FC<IProps> = ({
  count = 0,
  setCount,
  className,
  disabledUp,
  disabledDown,
  style,
}) => {
  return (
    <div className={classNames('counter', className)}>
      <Button
        className="button"
        onClick={() => setCount(count - 1)}
        disabled={disabledDown}
      >
        <img src="/img/icons/minus.svg" alt="minus" style={style} />
      </Button>
      <div>{count}</div>

      <Button
        className="button"
        onClick={() => setCount(count + 1)}
        disabled={disabledUp}
      >
        <img src="/img/icons/plusCounter.svg" alt="plus" />
      </Button>
    </div>
  );
};

export default QuantityCounter;
