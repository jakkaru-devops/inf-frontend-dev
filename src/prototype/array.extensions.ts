import { getRandomInt } from 'utils/common.utils';

Array.prototype.unique = function (): Array<string | number> {
  return Array.from(new Set(this));
};

Array.prototype.getRandomItem = function (): any {
  return this[getRandomInt(0, this.length - 1)];
};

export default Array;
