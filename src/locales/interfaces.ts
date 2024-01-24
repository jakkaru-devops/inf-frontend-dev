import { IDBEntity } from 'interfaces/common.interfaces';

export type ILanguageLabel = 'ru' | 'en';

export interface ILanguage extends IDBEntity {
  label: ILanguageLabel;
  name?: string;
  translates?: ILanguageTranslate[];
  isDefault?: boolean;
}

export interface ILanguageTranslate extends IDBEntity {
  languageId: ILanguage['id'];
  translateLanguageId: ILanguage['id'];
  name: string;
}
