import { FC, useContext, useEffect } from 'react';
import { IUser } from 'sections/Users/interfaces';
import PageContainer from 'components/containers/PageContainer';
import SellerAddOrganizationContent from './Content';
import { Context } from '../context';

interface IProps {
  user: IUser;
}

const SellerAddOrganization: FC<IProps> = ({ user }) => {
  const { setSummaryContentLeft } = useContext(Context);

  useEffect(() => {
    setSummaryContentLeft(null);
  }, []);

  return (
    <PageContainer contentLoaded={!!user}>
      <SellerAddOrganizationContent user={user} />
    </PageContainer>
  );
};

export default SellerAddOrganization;
