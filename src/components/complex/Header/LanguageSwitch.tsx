import { Button } from 'antd';
import { LOCALIZATION_ENABLED } from 'config/env';
import { useRouter } from 'next/router';
import { useSelector } from 'react-redux';
import jsCookie from 'js-cookie';
import { getCurrentLanguage } from 'store/reducers/locales.reducer';
import { ILanguageLabel } from 'locales/interfaces';
import { LANGUAGE_LIST } from 'locales/data';

const LanguageSwitch = () => {
  const currentLanguage = useSelector(getCurrentLanguage);
  const router = useRouter();

  const handleClick = (value: ILanguageLabel) => {
    jsCookie.set('language', value);
    router.reload();
  };

  if (!LOCALIZATION_ENABLED) {
    return <></>;
  }

  return (
    <div className="d-flex">
      {LANGUAGE_LIST.map(lang => (
        <Button
          type={currentLanguage === lang.label ? 'primary' : 'default'}
          key={lang.label}
          onClick={() => handleClick(lang.label as ILanguageLabel)}
        >
          {lang.name}
        </Button>
      ))}
    </div>
  );
};

export default LanguageSwitch;
