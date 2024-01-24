import classNames from 'classnames';
import { FC, memo, useMemo } from 'react';
import IconStar from './elements/Star';
import { IRateString } from './interfaces';

/**
 * @description Rate string component, with star icon.
 * @param {*} {
 *   max = 5,
 *   rate,
 *   size = 20,
 *   color = '#FFCA00',
 *   emptyColor = 'rgba(144,160,161,.25)',
 * }
 * @returns a line with star icons
 */
const RateString: FC<IRateString> = ({
  max = 5,
  rate,
  size = 20,
  color = '#FFCA00',
  emptyColor = 'rgba(144,160,161,.4)',
  className,
  onClick,
}) => {
  const stars = useMemo(() => {
    const ret = [];

    for (let i = 0; i < max; i += 1) {
      ret.push(
        <div key={i.toString()} className={'rate-string__star'}>
          <IconStar
            size={size}
            color={color}
            fill={rate - i}
            emptyColor={emptyColor}
          />
        </div>,
      );
    }
    return ret;
  }, [max, size, color, rate, emptyColor]);

  return (
    <span className={className}>
      {rate > 0 ? (
        <div
          className={classNames('rate-string', {
            'cursor-pointer': !!onClick,
          })}
          onClick={onClick}
        >
          <span className="rate-string__rate" style={{ color }}>
            {rate}
          </span>
          {stars}
        </div>
      ) : (
        <div className="rate-string">
          <span className="rate-string__rate" style={{ color: '#333333' }}>
            0
          </span>
          {stars}
        </div>
      )}
    </span>
  );
};

export default memo(RateString);
