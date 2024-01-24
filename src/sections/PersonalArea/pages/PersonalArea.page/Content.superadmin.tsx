import { BreadCrumbs, Page, PageContent, PageTop } from 'components/common';
import { APP_PATHS } from 'data/paths.data';
import PersonalAreaNavItem from 'sections/PersonalArea/components/PersonalAreaNavItem';
import { useLocale } from 'hooks/locale.hook';
import { IPersonalAreaNavItem } from 'sections/PersonalArea/interfaces';
import { generateInnerUrl } from 'utils/common.utils';

const PersonalAreaSuperadminContent = () => {
  const { locale } = useLocale();

  const menu: IPersonalAreaNavItem[] = [
    {
      path: generateInnerUrl(APP_PATHS.EMPLOYEE_LIST),
      text: locale.other.staff,
      img: '/img/icons/worker.svg',
    },
  ];

  return (
    <Page className="personal-area-page">
      <BreadCrumbs list={[]} />
      <PageTop title={locale.common.personalArea} />
      <PageContent>
        <ul className="personal-area-page__nav-list">
          {menu.map((item, i) => (
            <PersonalAreaNavItem key={i} {...item} />
          ))}
        </ul>
      </PageContent>
    </Page>
  );
};

export default PersonalAreaSuperadminContent;
