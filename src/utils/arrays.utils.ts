/**
 * Returns an associative array by provided key
 * @param arr
 * @param byKey
 */
export const convertArrayToAssociative = (
  arr: any[],
  byKey: string | number,
) => {
  const result: { [key: string]: any } = {};

  // errors
  if (typeof arr !== 'object') {
    throw Error('Provided array param is not an array');
  }
  if (arr.length > 0) {
    if (
      typeof arr[0][byKey] !== 'string' &&
      typeof arr[0][byKey] !== 'number'
    ) {
      throw Error('Provided key was not found in array elements');
    }
  }
  // /errors

  // handle array
  for (const el of arr) {
    result[el[byKey]] = el;
  }

  // result
  return result;
};

export const convertObjectKeysToArray = (obj: object): string[] | number[] => {
  const result = [];
  Object.keys(obj).map((key, i) => {
    result[i] = key;
  });
  return result;
};

export function splitArrayByIndexes<T = any>(
  arr: Array<T>,
  indexes: Array<number>,
) {
	if(indexes.length == 0) return [arr];
  if (indexes.length == 1)
    return [arr.slice(0, indexes[0]), arr.slice(indexes[0])];
  return indexes.map((value, index) => {
    if (index == 0) return arr.slice(0, value);
    return arr.slice(value);
  });
}
