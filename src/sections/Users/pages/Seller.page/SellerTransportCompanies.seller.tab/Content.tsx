import { IUser } from 'sections/Users/interfaces';
import { FC } from 'react';
import { ITransportCompany } from 'sections/Shipping/interfaces';
import { Checkbox } from 'antd';
import { useHandlers } from './handlers';

interface IProps {
  user: IUser;
  transportCompanies: ITransportCompany[];
  sellersTransportCompanies: ITransportCompany[];
}

const SellerTransportCompaniesSellerTabContent: FC<IProps> = ({
  transportCompanies,
  sellersTransportCompanies,
}) => {
  const { selectedTransportCompanyIds, selectTransportCompany } = useHandlers({
    sellersTransportCompanies,
  });

  return (
    <ul>
      {transportCompanies.map((transportCompany, i) => (
        <li key={i} className="mb-40">
          <Checkbox
            className="flex align-items-center"
            checked={selectedTransportCompanyIds.includes(transportCompany.id)}
            onChange={e =>
              selectTransportCompany(e.target.checked, transportCompany.id)
            }
          >
            <span className="text_18_bold">{transportCompany.name}</span>
          </Checkbox>
        </li>
      ))}
    </ul>
  );
};

export default SellerTransportCompaniesSellerTabContent;
