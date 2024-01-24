import parsePhoneNumber from 'libphonenumber-js';
import Cookies from 'cookies';
import passwordGenerator from 'generate-password';
import {
  IAddress,
  IGenerateUrlParams,
  IRandomCodeType,
} from 'interfaces/common.interfaces';
import { toast } from 'react-toastify';
import _ from 'lodash';
import { MouseEvent as ReactMouseEvent, ReactNode } from 'react';
import htmr from 'htmr';
import { ExclamationOutlined } from '@ant-design/icons';

/**
 * Shows a notification
 * @param {ReactNode | string} content
 * @param {ArgsProps} props
 */
export const openNotification = (
  content: ReactNode | string,
  params?: {
    /**
     * In milliseconds
     */
    duration?: number;
    onClick?: (e: ReactMouseEvent<Element, MouseEvent>) => void;
    sound?: 'notification' | 'message';
  },
) => {
  const duration = params?.duration || 5000;
  const sound = params?.sound;

  if (isClientSide()) {
    toast(content as any, {
      autoClose: duration,
      onClick: params?.onClick,
    });
    if (!!sound) {
      const audio = document?.querySelector('#audio-main') as HTMLAudioElement;
      if (!!audio) {
        audio.volume = 0.5;
        audio.currentTime = 0;
        audio.play();
      }
    }
  }
};

/**
 * Determines if script performs on the client side
 * @return {Boolean}
 */
export const isClientSide = () => {
  return typeof window !== 'undefined';
};

/**
 * Determines if script performs on the server side
 * @return {Boolean}
 */
export const isServerSide = () => {
  return typeof window === 'undefined';
};

/**
 * Formats phone number to national format
 */
export const formatPhoneNumber = (phone: string) => {
  let parsedNumber = parsePhoneNumber(phone).format('NATIONAL');
  let result = parsedNumber.replace('8 ', '+7');
  if (result[0] !== '+') result = `+7${result}`;

  if (!result) return 'телефон не определен';

  if (result.replace(/[^0-9]/g, '').length === 11) {
    const resultArr = result.replace(/[^0-9]/g, '').split('');
    resultArr.splice(1, 0, ' (');
    resultArr.splice(5, 0, ') ');
    resultArr.splice(9, 0, '-');
    resultArr.splice(12, 0, '-');
    result = '+' + resultArr.join('');
  }

  return result;
};

/**
 * @param searchParams Specify generated url's search params. Set value = null to delete param from url
 * @param params
 * @returns generated url string
 */
export const generateUrl = (
  searchParams: {
    [key: string]: string | string[] | number | null;
  },
  params?: IGenerateUrlParams,
): string => {
  if (!isClientSide()) return null;

  const currentUrl = new URL(location.href);
  const url = new URL(
    (params?.domain || location.origin) +
      (params?.pathname || location.pathname),
  );

  if (!params?.removeCurrentParams) {
    currentUrl.searchParams.forEach((value, key) => {
      url.searchParams.append(key, value);
    });
  }

  searchParams &&
    Object.keys(searchParams).forEach(key => {
      let value = searchParams[key];
      if (['string', 'number'].includes(typeof value)) value = value.toString();
      if (!!value && (value as string).length > 0) {
        url.searchParams.delete(key);
        for (const option of [].concat(value)) {
          if (!option) continue;
          url.searchParams.append(key.toString(), option.toString());
        }
      } else {
        url.searchParams.delete(key);
      }
    });

  let result = url.toString();
  if (!params?.domain) {
    result = result.replace(location.origin, '');
  }
  return result;
};

interface IGenerateInnerUrl {
  text?: string;
  searchParams?: {
    [key: string]: string | string[] | number | null;
  };
  removeCurrentParams?: boolean;
}

export const generateInnerUrl = (
  pathname: string,
  params?: IGenerateInnerUrl,
): string => {
  if (!isClientSide()) return '/';

  const searchParams = params?.searchParams;
  const text = params?.text;
  const removeCurrentParams = params?.removeCurrentParams;

  const currentUrl = new URL(location.href);
  const currentSearchParams: {
    [key: string]: string | string[];
  } = {};

  currentUrl.searchParams.forEach((value, key) => {
    if (currentSearchParams[key]) {
      currentSearchParams[key] = [].concat(currentSearchParams[key], value);
    } else {
      currentSearchParams[key] = value;
    }
  });

  if (pathname?.[0] === '/') pathname = pathname.replace('/', '');
  let result = pathname;

  const resultSearchParams: {
    [key: string]: string | string[] | number;
  } = !removeCurrentParams ? currentSearchParams : {};
  if (resultSearchParams?.tab) {
    delete resultSearchParams?.tab;
  }

  searchParams &&
    Object.keys(searchParams).forEach(key => {
      let value = searchParams[key];
      if (['string', 'number'].includes(typeof value)) value = value.toString();

      if (!!value && (value as string).length > 0) {
        delete resultSearchParams[key];
        for (const option of [].concat(value)) {
          if (!option) continue;
          resultSearchParams[key.toString()] = resultSearchParams[
            key.toString()
          ]
            ? [resultSearchParams[key.toString()]].concat(option.toString())
            : option.toString();
        }
      } else {
        delete resultSearchParams[key];
      }
    });

  const currentHistory: string[] = []
    .concat(currentSearchParams?.history)
    .filter(Boolean);

  const newItem: string = !!text ? JSON.stringify([pathname, text]) : null;
  const newItemAlt: string = !text ? pathname : null;

  if (
    (!!newItem || !!newItemAlt) &&
    (currentHistory.includes(newItem) || currentHistory.includes(newItemAlt))
  ) {
    // If new history item is included to current history, further items are excluded from history
    const index = currentHistory.findIndex(el =>
      [newItem, newItemAlt].includes(el),
    );
    resultSearchParams.history = currentHistory.filter((__, i) => i <= index);
  } else {
    resultSearchParams.history =
      searchParams?.history ||
      currentHistory
        .filter(value => !!value?.length)
        .concat(!text ? pathname : JSON.stringify([pathname, text]))
        .map(value => (value?.[0] === '/' ? value.replace('/', '') : value));
  }

  resultSearchParams.history = _.uniq(resultSearchParams.history as string[]);

  const searchParamsArr: { key: string; value: string }[] = [];
  const url = new URL(location.origin + '/' + pathname);

  Object.keys(resultSearchParams).forEach(key => {
    const value = resultSearchParams[key];
    const arr: string[] = [].concat(value);
    for (const item of arr) {
      url.searchParams.append(key, item);
      searchParamsArr.push({ key, value: item });
    }
  });

  result = url.toString();
  result = result.replace(location.origin, '');

  return result;

  if (result?.[0] !== '/') result = '/' + result;
  result +=
    '?' + searchParamsArr.map(({ key, value }) => `${key}=${value}`).join('&');

  return result;
};

export const convertNavItem = (url: string, text: string) => {
  return JSON.stringify([url, text]);
};

/**
 * Parses json from cookies. Returns object or array
 */
export const getJsonFromServerCookie = (
  key: string,
  cookies: Cookies,
  options?: { type?: 'array' | 'object' },
) => {
  const type = options.type || 'object';
  const defaultJsonStr = type === 'object' ? '{}' : '[]';
  const jsonStr = (cookies.get(key) || defaultJsonStr)
    .replace(/%22/g, '"')
    .replace(/%2C/g, ',');
  return JSON.parse(jsonStr) || JSON.parse(defaultJsonStr);
};

export const getBase64 = (file: File | Blob): Promise<string | ArrayBuffer> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
};

/**
 * Returns initial address object
 */
export const getInitialAddress = (): IAddress => ({
  country: 'Россия',
  region: null,
  area: null,
  city: null,
  settlement: null,
  street: null,
  building: null,
  apartment: null,
  postcode: null,
});

export const validateAddress = (address: IAddress) => {
  let result = true;

  const fields = ['country', 'region', 'city', 'street', 'building'];
  for (const field of fields) {
    if (
      typeof address[field] !== 'undefined' &&
      ((address[field] as string) || '').isEmpty()
    ) {
      result = false;
      break;
    }
  }
  return result;
};

export const validateAddressFiasId = (address: IAddress) => {
  let result = true;
  const fields = ['regionFiasId', 'areaFiasId'];
  for (const field of fields) {
    if (
      (address.hasOwnProperty(field) &&
        typeof address[field] === 'undefined') ||
      (typeof address[field] === 'string' &&
        (address[field] as string).isEmpty())
    ) {
      result = false;
      break;
    }
  }

  if (address['cityFiasId'] || address['settlementFiasId']) {
    return result;
  }

  result = false;
  return result;
};

/**
 * Generates random string
 * @param length Length of the string
 */
export function generateRandomCode({
  length,
  numbers = true,
  symbols = true,
  lowercase = true,
  uppercase = true,
  excludeSimilarCharacters = true,
}: IRandomCodeType) {
  return passwordGenerator.generate({
    length,
    numbers,
    symbols,
    lowercase,
    uppercase,
    excludeSimilarCharacters,
  });
}
/**
 * @description Check if use IOS device
 */
export const isIOSDevice = () =>
  typeof window !== 'undefined' &&
  (
    window.navigator.userAgent ||
    window.navigator.vendor ||
    window.opera ||
    ''
  ).match(/iPhone|iPad|iPod/i);

/**
 * Round the number
 * @param {number} num
 */
export const round = (num: number) =>
  Math.round((num + Number.EPSILON) * 100) / 100;

/**
 * Function for declension of numbers
 * @param {number} num
 * @param {any} locales
 */
export const declOfNum = (num: number, locales: any) =>
  locales[
    num % 100 > 4 && num % 100 < 20
      ? 2
      : [2, 0, 1, 1, 1, 2][num % 10 < 5 ? Math.abs(num) % 10 : 5]
  ];

/**
 * Convert milliseconds to mdhm format
 * @param {number} milliseconds
 * @param {any} locale
 * @param {boolean} commas
 */
export const millisecondsToMdhm = (
  ms: number,
  locale: any,
  commas: boolean = true,
) => {
  if (ms < 0) return null;
  if (ms < 60000) return 'Меньше минуты';

  const months = Math.floor(ms / (31 * 24 * 60 * 60 * 1000));
  const days = Math.floor(
    (ms % (31 * 24 * 60 * 60 * 1000)) / (24 * 60 * 60 * 1000),
  );
  const hours = Math.floor((ms % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
  const minutes = Math.floor((ms % (60 * 60 * 1000)) / (60 * 1000));

  const mdhm = [];

  months > 0 &&
    mdhm.push(months + ' ' + declOfNum(months, locale.plurals.month));
  days > 0 && mdhm.push(days + ' ' + declOfNum(days, locale.plurals.day));
  hours > 0 && mdhm.push(hours + ' ' + declOfNum(hours, locale.plurals.hour));
  minutes > 0 &&
    mdhm.push(minutes + ' ' + declOfNum(minutes, locale.plurals.minute));

  if (commas) {
    return mdhm.join(', ');
  }

  return mdhm.join(' ');
};

/**
 * Convert seconds to hms format
 * @param {number} seconds
 */
export const secondsToHms = (seconds: number) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  const formattedHours = String(hours).padStart(2, '0');
  const formattedMinutes = String(minutes).padStart(2, '0');
  const formattedSeconds = String(remainingSeconds).padStart(2, '0');

  return `${
    hours > 0 ? `${formattedHours}:` : ''
  }${formattedMinutes}:${formattedSeconds}`;
};

/**
 * @description generate DOM link element, manual click and blank open inserted base64 document.
 * @param {*} dataurl
 */
export const openDataUrl = (dataurl: string): any => {
  // deprecated at the Chrome
  // const downloadLink = document.createElement('a');
  // document.body.appendChild(downloadLink);

  // downloadLink.href = dataurl;
  // downloadLink.target = 'blank';
  // downloadLink.click();

  // let pdfWindow = window.open('');
  // pdfWindow.document.write(
  //   `<iframe width='100%' height='100%' src='${dataurl}'></iframe>`,
  // );
  const file = new File([new Uint8Array(1)], 'a_name.pdf', {
    type: 'application/pdf',
  });

  let pdfWindow = window.open(
    '',
    'PDF',
    'dependent=yes,locationbar=no,scrollbars=no,menubar=no,resizable,screenX=50,screenY=50,width=850,height=800',
  );
  pdfWindow.document.write(
    '<html<head><title>' +
      'счет договор' +
      '</title><style>body{margin: 0px;}iframe{border-width: 0px;}</style></head>',
  );
  pdfWindow.document.write(
    "<body><embed width='100%' height='100%' type='application/pdf' src='" +
      URL.createObjectURL(file) +
      "'></embed></body></html>",
  );
};

export const secsToMMSS = (secs: number) =>
  String(Math.floor(secs / 60)).padStart(2, '0') +
  ':' +
  String(Math.floor(secs % 60)).padStart(2, '0');

export const separateNumberBy = (value: number, delimiter: string) =>
  value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, delimiter);

export const numberIsInteger = (value: number) =>
  Math.floor(value).toString() === value.toString();

export const stripString = (str: string) => {
  if (!str) return null;
  return str.replace(/(<([^>]+)>)/gi, '');
};

export const getMobileOS = (): 'Android' | 'iOS' | null => {
  const ua = navigator.userAgent;
  if (/android/i.test(ua)) {
    return 'Android';
  } else if (
    /iPad|iPhone|iPod/.test(ua) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  ) {
    return 'iOS';
  }
  return null;
};

/**
 * Get phone number in format +79091234567
 */
export function simplifyPhoneNumber(phoneNumber: string): string {
  if (typeof phoneNumber !== 'string') phoneNumber = String(phoneNumber);
  const parsedNumber = parsePhoneNumber(phoneNumber, 'RU');
  if (parsedNumber && parsedNumber.number.length)
    return parsedNumber.number.toString();
  else return null;
}

export const simplifyHtml = (str: string) =>
  str
    ?.trim()
    ?.replace(
      /<(?!br|p|\/p|table|\/table|tr|\/tr|th|\/th|td|\/td\s*\/?)[^>]+>/g,
      '',
    ) || null;

export const renderHtml = (str: string, errorText?: string): ReactNode => {
  try {
    return htmr(str);
  } catch (err) {
    if (!errorText) return <></>;

    return (
      <span className="d-flex align-items-center color-primary">
        <ExclamationOutlined style={{ fontSize: 18, marginRight: 10 }} />
        {errorText}
      </span>
    );
  }
};

/**
 * Get number in format 1 000 000,00
 */
export const formatPrice = (price: number): string => {
  return price.roundFraction(2).separateBy(' ').replace(/\./g, ',');
};

export const suffixDef = (
  number: number,
  titles: [string, string, string],
): string => {
  const cases = [2, 0, 1, 1, 1, 2];
  return titles[
    number % 100 > 4 && number % 100 < 20
      ? 2
      : cases[number % 10 < 5 ? number % 10 : 5]
  ];
};

export const getRandomInt = (min: number, max: number) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
};
