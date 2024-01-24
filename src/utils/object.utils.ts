export const flattenObject = (obj: object, delimiter?: string): any => {
  delimiter = delimiter || '.';

  const result = {};
  // For each object path (property key) in the object
  for (var i in obj) {
    if (!obj.hasOwnProperty(i)) continue;

    if (typeof obj[i] == 'object' && obj[i] !== null) {
      var flatObject = flattenObject(obj[i]);
      for (var x in flatObject) {
        if (!flatObject.hasOwnProperty(x)) continue;
        result[i + '.' + x] = flatObject[x];
      }
    } else {
      result[i] = obj[i];
    }
  }
  return result;
};

export const deepenObject = (obj: object, delimiter?: string) => {
  delimiter = delimiter || '.';

  const result: any = {};
  // For each object path (property key) in the object
  for (const objectPath in obj) {
    // Split path into component parts
    const parts = objectPath.split(delimiter);

    // Create sub-objects along path as needed
    let target = result;
    while (parts.length > 1) {
      const part = parts.shift();
      target = target[part] = target[part] || {};
    }

    // Set value at end of path
    target[parts[0]] = obj[objectPath];
  }

  return result;
};

export const tranformObjectKeysToSnakeCase = (obj: Object): any => {
  if (typeof obj !== 'object') return obj;
  const result = JSON.parse(JSON.stringify(obj));

  Object.keys(result).forEach(key => {
    result[key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`)] =
      result[key];
    delete result[key];
  });

  return result;
};
