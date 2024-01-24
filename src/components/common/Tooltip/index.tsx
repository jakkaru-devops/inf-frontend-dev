import { FC } from 'react';
import { ITooltip } from './interfaces';
/**
 * @description title with hovered tooltip block.
 * @param {*} { title, message }
 */
const Tooltip: FC<ITooltip> = ({ title, message }) => (
  <div className="tooltip">
    {title}
    <div className="tooltip-info">{message}</div>
  </div>
);

export { Tooltip };
