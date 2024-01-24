import { IUser } from 'sections/Users/interfaces';
import { FC, Fragment } from 'react';
import { ITransportCompany } from 'sections/Shipping/interfaces';

interface IProps {
  user: IUser;
  transportCompanies: ITransportCompany[];
}

const SellerTransportCompaniesCustomerTabContent: FC<IProps> = ({
  transportCompanies,
}) => {
  return (
    <ul>
      {transportCompanies.map(transportCompany => (
        <li
          key={transportCompany.id}
          className="mb-15 text-bold"
          style={{ fontSize: 20 }}
        >
          {transportCompany.name}
        </li>
      ))}
    </ul>
  );
};

export default SellerTransportCompaniesCustomerTabContent;
