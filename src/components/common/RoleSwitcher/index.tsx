import { Badge, Select } from 'antd';
import classNames from 'classnames';
import jsCookie from 'js-cookie';
import { APP_PATHS } from 'data/paths.data';
import { useLocale } from 'hooks/locale.hook';
import { STRINGS } from 'data/strings.data';
import { generateUrl } from 'utils/common.utils';
import { DEFAULT_NAV_PATHS } from 'data/nav.data';
import addDate from 'date-fns/add';
import Link from '../Link';
import { useAuth } from 'hooks/auth.hook';
import { FC } from 'react';

interface IProps {
  showBannedRoles?: boolean;
  className?: string;
  handleLogout: () => void;
}

const RoleSwitcher: FC<IProps> = ({
  showBannedRoles = false,
  className,
  handleLogout,
}) => {
  const auth = useAuth();
  const { locale } = useLocale();

  if (!auth.isAuthenticated) return <></>;

  const userRoles = showBannedRoles
    ? auth.user.roles
    : auth.user.roles.filter(role => !role.bannedUntil);

  // Show nothing if user is banned or has only 1 available role
  if (!!auth.user.bannedUntil || !userRoles || userRoles.length <= 1) {
    return <></>;
  }

  const switchRole = (roleId: string) => {
    jsCookie.set(STRINGS.CURRENT_ROLE, roleId, {
      expires: addDate(new Date(), { weeks: 1 }),
    });
    window.location.href = generateUrl(
      {
        history: DEFAULT_NAV_PATHS.PERSONAL_AREA,
      },
      {
        pathname: APP_PATHS.PERSONAL_AREA,
      },
    );
  };

  const handleChange = (event: string) => {
    if (event === 'logout') {
      handleLogout();
      // выполнить действия для изменения роли пользователя
    } else {
      switchRole(event);
    }
  };

  return (
    <Select
      onChange={handleChange}
      value={auth.currentRole.id}
      style={{
        width: 125,
      }}
      className={classNames(['role-switcher', className])}
      popupClassName="role-switcher"
      dropdownRender={menu => <div>{menu}</div>}
    >
      {userRoles.map(role => (
        <Select.Option key={role.label} value={role.id}>
          {locale.user[role.label]}
        </Select.Option>
      ))}
      <Select.Option value="logout">
        <Badge>
          <Link href={APP_PATHS.HOME}>{locale.user.logout}</Link>
        </Badge>
      </Select.Option>
    </Select>
  );
};

export default RoleSwitcher;
