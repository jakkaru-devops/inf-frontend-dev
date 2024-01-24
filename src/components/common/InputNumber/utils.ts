const separateNumberBy = (value: number, delimiter: string) =>
  value?.toString()?.replace(/\B(?=(\d{3})+(?!\d))/g, delimiter);

const numberIsInteger = (value: number) =>
  Math.floor(value)?.toString() === value?.toString();

export const inputNumberFormatter = (
  value: number,
  info: {
    userTyping: boolean;
    input: string;
  },
  params?: {
    decimal?: boolean;
    decimalSeparator?: string;
  },
): string => {
  if (!value) return value?.toString();
  const decimalSeparator = params?.decimalSeparator || ',';
  let result = separateNumberBy(value, ' ').replace('.', decimalSeparator);
  if (params?.decimal && !info.userTyping) {
    if (numberIsInteger(value)) {
      result += decimalSeparator + '00';
    } else {
      const floatPart = (value - Math.floor(value)).toFixed(2);
      if (floatPart.endsWith('0')) result += '0';
    }
  }
  return result;
};
