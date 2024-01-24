import { RuleObject } from 'antd/lib/form';
import { validateEmail } from 'utils/forms.utils';
import parseDate from 'date-fns/parse';
import { ru as dateLocaleRu } from 'date-fns/locale';
import isDateValid from 'date-fns/isValid';
import { useLocale } from './locale.hook';

export const useFormValidation = () => {
  const { locale } = useLocale();

  const validateMaskedInput = (
    rule: RuleObject,
    value: string,
  ): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (!value) {
        reject(locale.validations.required);
      } else if (value.substr(-1) === '_') {
        reject(locale.validations.required);
      } else {
        resolve();
      }
    });
  };

  const validateEmailInput = (
    rule: RuleObject,
    value: string,
  ): Promise<void> => {
    return new Promise((resolve, reject) => {
      const result = validateEmail(value);
      if (!result) {
        reject(locale.validations.incorrectEmail);
      } else {
        resolve();
      }
    });
  };

  const validateCheckbox = (rule: RuleObject, value: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (!value) {
        reject(locale.validations.required);
      } else {
        resolve();
      }
    });
  };

  const validateRadio = (rule: RuleObject, value: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (typeof value === 'undefined') {
        reject(locale.validations.required);
      } else {
        resolve();
      }
    });
  };

  const validateInn = (rule: RuleObject, value: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (!value || value.length <= 0) {
        reject(locale.validations.required);
      }
      if (![10, 12].includes(value.length)) {
        reject('Допустимая длина ИНН 10 или 12 символов');
      }
      resolve();
    });
  };

  const validateFile = (file: any): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (!file.file) {
        reject(locale.validations.required);
      } else {
        resolve();
      }
    });
  };

  const validateNumber = (
    value: string | number,
    params?: { min?: number; max?: number },
  ): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (!value || !value.toString() || value.toString().length < 0) {
        reject('Обязательно для заполнения');
        return;
      }
      const num = Number(value);
      if (!num && num !== 0) {
        reject('Введенное значение не является числом');
        return;
      }
      if (params) {
        if (params.min && num < params.min) {
          reject(`Минимальное значение = ${params.min}`);
          return;
        }
        if (params.max && num > params.max) {
          reject(`Максимальное значение = ${params.max}`);
          return;
        }
      }
      resolve();
    });
  };

  const validateDateInput = (
    rule: RuleObject,
    value: string,
  ): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (!value) {
        reject(locale.validations.required);
      } else if (value.substr(-1) === '_') {
        reject(locale.validations.required);
      } else {
        const parsedDate = parseDate(value, 'P', new Date(), {
          locale: dateLocaleRu,
        });
        console.log(value, parsedDate);
        const isValid = isDateValid(parsedDate);
        if (!isValid) {
          reject('Некорректная дата');
        } else {
          resolve();
        }
      }
    });
  };

  return {
    validateMaskedInput,
    validateEmailInput,
    validateCheckbox,
    validateRadio,
    validateInn,
    validateFile,
    validateNumber,
    validateDateInput,
  };
};
