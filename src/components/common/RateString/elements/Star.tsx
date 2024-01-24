import { FC, memo, useMemo } from 'react';
import classNames from 'classnames';
import { useUID } from 'react-uid';

import { IStar } from '../interfaces';
/**
 * @description Svg star component. Use for rate only.
 * @param {*} {
 *   size = 11,
 *   color = '#000',
 *   emptyColor = color,
 *   className = '',
 *   fill = 0,
 * }
 * @returns ReactNode (svg)
 */
const IconStar: FC<IStar> = ({
  size = 11,
  color = '#000',
  emptyColor = color,
  className = '',
  fill = 0,
}) => {
  const uniquiId = useUID();

  const width = useMemo(() => {
    if (fill <= 0) return 0;
    if (fill >= 1) return 12.5;
    return fill * 12.5;
  }, [fill]);

  const id = useMemo(() => `cut-star-${uniquiId}`, [uniquiId]);
  return (
    <svg
      className={classNames(['icon', 'icon-star', className])}
      viewBox="0 0 17 16"
      width={size}
      height={size}
      fill={color}
      strokeWidth="0"
    >
      <defs>
        <clipPath id={id}>
          <rect
            className="icon-star__clip"
            x="0"
            y="0"
            width={width}
            height="16"
          />
        </clipPath>
      </defs>
      <path
        fill={emptyColor}
        d="M6.25 0L7.70934 4.49139H12.4319L8.61126 7.26722L10.0706 11.7586L6.25 8.98278L2.4294 11.7586L3.88874 7.26722L0.0681329 4.49139H4.79066L6.25 0Z"
      />
      <path
        clipPath={`url(#${id})`}
        d="M6.25 0L7.70934 4.49139H12.4319L8.61126 7.26722L10.0706 11.7586L6.25 8.98278L2.4294 11.7586L3.88874 7.26722L0.0681329 4.49139H4.79066L6.25 0Z"
      />
    </svg>
  );
};

export default memo(IconStar);
