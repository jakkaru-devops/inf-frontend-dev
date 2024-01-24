import { LOCALES } from 'locales/data';
import { useSelector } from 'react-redux';
import { getCurrentLanguage } from 'store/reducers/locales.reducer';

export const useLocale = () => {
  const currentLanguage = useSelector(getCurrentLanguage);
  const locale = LOCALES[currentLanguage];

  return {
    locale,
  };
};
