import classNames from 'classnames';
import {
  BreadCrumbs,
  Page,
  PageContent,
  PageTop,
  PageTopPanel,
  Link,
} from 'components/common';
import { APP_PATHS } from 'data/paths.data';
import { IUserRoleLabelsDefault } from 'sections/Users/interfaces';
import AuthByPhoneNumberForm from '../../components/AuthByPhoneNumberForm';
import { useLocale } from 'hooks/locale.hook';
import { generateUrl } from 'utils/common.utils';
import { useRouter } from 'next/router';
import { STRINGS } from 'data/strings.data';
import { FC } from 'react';

interface IProps {
  userRole: IUserRoleLabelsDefault;
}

const LoginByPhoneNumberPage: FC<IProps> = ({ userRole }) => {
  const { locale } = useLocale();
  const router = useRouter();

  const TOP_LINKS = [
    {
      path: APP_PATHS.LOGIN_CUSTOMER,
      name: locale.user.customer,
      userRole: 'customer',
    },
    {
      path: APP_PATHS.LOGIN_SELLER,
      name: locale.user.seller,
      userRole: 'seller',
    },
  ];

  return (
    <Page className="register-by-phone-number__page">
      <BreadCrumbs
        list={[
          { link: APP_PATHS.LOGIN_CUSTOMER, text: locale.user.registerOrLogin },
        ]}
        showPersonalAreaLink={false}
      />
      <PageTop title={locale.user.registerOrLogin} />
      <PageTopPanel className="register-by-phone-number__page__top-panel">
        {TOP_LINKS.map((item, i) => (
          <Link
            key={i}
            href={generateUrl(
              {
                [STRINGS.QUERY.SEND_ORDER_REQUEST]:
                  router.query?.[STRINGS.QUERY.SEND_ORDER_REQUEST],
                history: null,
              },
              { pathname: item.path },
            )}
            className={classNames({
              active: item.userRole === userRole,
            })}
          >
            {item.name}
          </Link>
        ))}
      </PageTopPanel>
      <PageContent>
        <AuthByPhoneNumberForm mode="register" userRole={userRole} />
      </PageContent>
    </Page>
  );
};

export default LoginByPhoneNumberPage;
