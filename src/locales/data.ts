import { LOCALE_EN } from './en/locale.en';
import { ILanguageLabel } from './interfaces';
import { LOCALE_RU } from './ru/locale.ru';

export const DEFAULT_LANGUAGE_LABEL: ILanguageLabel = 'ru';

export const LOCALES = {
  ru: LOCALE_RU,
  en: LOCALE_EN,
};

export const LANGUAGE_LIST = [
  { label: 'ru', name: 'Русский' },
  { label: 'en', name: 'English' },
];
