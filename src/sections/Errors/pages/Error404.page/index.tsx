import { Page } from 'components/common';
import { useLocale } from 'hooks/locale.hook';

const Error404Page = () => {
  const { locale } = useLocale();

  return (
    <Page>
      <br />
      <br />
      <div className="d-flex flex-direction-column align-items-center">
        <h2>{locale.pages.error404.title}</h2>
        <h2>{locale.pages.error404.desc}</h2>
      </div>
    </Page>
  );
};

export default Error404Page;
