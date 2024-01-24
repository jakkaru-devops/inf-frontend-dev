import OrgFormFragmentContextProvider from './context';
import OrgFormFragmentContent from './content';
import { IOrgFormGragmentProps } from './interfaces';
import { FC } from 'react';

const OrganizationFormFragment: FC<IOrgFormGragmentProps> = props => {
  return (
    <OrgFormFragmentContextProvider {...props}>
      <OrgFormFragmentContent />
    </OrgFormFragmentContextProvider>
  );
};

export default OrganizationFormFragment;
