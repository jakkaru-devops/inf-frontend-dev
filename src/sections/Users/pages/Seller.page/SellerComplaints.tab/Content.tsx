import { Pagination } from 'components/common';
import { IRowsWithCount } from 'interfaces/common.interfaces';
import { FC, Fragment, useContext, useEffect } from 'react';
import { ComplaintCard } from 'sections/Users/components/ComplaintCard';
import { IComplaint } from 'sections/Users/interfaces';
import { Context } from '../context';

interface IProps {
  complaints: IRowsWithCount<IComplaint[]>;
}

const SellerComplaintsTabContent: FC<IProps> = ({ complaints }) => {
  const { setSummaryContentLeft } = useContext(Context);

  useEffect(() => {
    setSummaryContentLeft(
      <>
        {complaints.count > 0 && (
          <Pagination total={complaints.count} pageSize={10} />
        )}
      </>,
    );
  }, []);

  return (
    <Fragment>
      {complaints.rows.map((complaint, i) => (
        <ComplaintCard
          key={i}
          complaint={complaint}
          appellantRoleLabel="customer"
        />
      ))}
      {!complaints?.rows?.length && <h3>На продавца нет жалоб</h3>}
    </Fragment>
  );
};

export default SellerComplaintsTabContent;
