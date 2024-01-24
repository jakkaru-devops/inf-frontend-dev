export const ENV = (process.env.NODE_ENV || 'production') as
  | 'development'
  | 'production';
export const API_SERVER_URL = process.env.API_SERVER_URL;

export const YANDEX_MAPS_API_KEY = process.env.YANDEX_MAPS_API_KEY;
export const YANDEX_MAPS_API_KEYS = !!process.env
  .NEXT_PUBLIC_YANDEX_MAPS_API_KEYS
  ? (JSON.parse(process.env.NEXT_PUBLIC_YANDEX_MAPS_API_KEYS) as string[])
  : null;

export const GOOGLE_RECAPTCHA_SITE_KEY = process.env.GOOGLE_RECAPTCHA_SITE_KEY;

export const MIN_ORG_COMISSION_PERCENT = 6;

export const LOCALIZATION_ENABLED = true;

export const PAYKEEPER_SERVER =
  process.env.PAYKEEPER_SERVER || 'https://inf.server.paykeeper.ru';
export const PAYMENTS_ENABLED =
  ['true', '1', 't'].includes(
    (process.env.PAYMENTS_ENABLED || '').toLocaleLowerCase(),
  ) || false;

export const ACAT_CATALOG_TOKEN = '';

export const GOOGLE_MEASUREMENT_ID = process.env.NEXT_PUBLIC_MEASUREMENT_ID;
