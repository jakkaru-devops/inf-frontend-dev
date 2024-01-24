import { IOrganization } from 'sections/Organizations/interfaces';
import OrganizationPageContentApplication from './Content.application';
import OrganizationPageContentConfirmed from './Content.confirmed';
import { FC } from 'react';

interface IProps {
  organization: IOrganization;
}

const OrganizationPageContent: FC<IProps> = ({ organization }) =>
  !organization.confirmationDate ? (
    <OrganizationPageContentApplication organization={organization} />
  ) : (
    <OrganizationPageContentConfirmed organization={organization} />
  );

export default OrganizationPageContent;
