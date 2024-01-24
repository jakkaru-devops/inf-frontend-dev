import pluralRu from 'plural-ru';

type TwoForms = [string, string];
type ThreeForms = [string, string, string];

export const getPlural = ({
  language,
  num,
  forms,
}: {
  language: 'ru';
  num: number;
  forms: string[];
}) => {
  switch (language) {
    case 'ru':
      return pluralRu(num, ...(forms as TwoForms | ThreeForms));
    default:
      return 'Ошибка локализации';
  }
};
