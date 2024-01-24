import { Link } from 'components/common';
import { convertAddressToString } from 'components/common/YandexMap/utils';
import { APP_PATHS } from 'data/paths.data';
import {
  IOrganization,
  IOrganizationBranch,
} from 'sections/Organizations/interfaces';
import { getUserName } from 'sections/Users/utils';
import { generateInnerUrl } from 'utils/common.utils';
import { useLocale } from 'hooks/locale.hook';
import { FC } from 'react';
import { useAuth } from 'hooks/auth.hook';

interface IProps {
  organization: IOrganization;
  branch: IOrganizationBranch;
}

const OrganizationBranchItem: FC<IProps> = ({ organization, branch }) => {
  const auth = useAuth();
  const { locale } = useLocale();

  const sellers = branch.sellers.filter(el => !!el.confirmationDate);

  return (
    <div className="org-branch-office-item">
      <div className="d-flex justifyc-content-between">
        <h3 className="mb-10">
          {convertAddressToString(branch.actualAddress)}
        </h3>
      </div>
      {!branch.isMain && !!branch?.kpp && <h4>КПП: {branch.kpp}</h4>}
      {sellers && sellers.length > 0 ? (
        <ul>
          {sellers.map(seller => (
            <li key={seller.id} className="d-flex align-items-center">
              <Link
                href={
                  auth?.currentRole?.label === 'seller'
                    ? generateInnerUrl(APP_PATHS.USER_SETTINGS, {
                        text: locale.navigation['user-settings'],
                      })
                    : generateInnerUrl(APP_PATHS.SELLER(seller.userId), {
                        text: getUserName(seller.user),
                      })
                }
              >
                {getUserName(seller.user)}
              </Link>
              {!!seller?.user?.sellerUpdateApplication && (
                <span className="notification-circle ml-10">1</span>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p>Еще нет зарегистрированных продавцов</p>
      )}
    </div>
  );
};

export default OrganizationBranchItem;
