import { IUser, IUserReview } from 'sections/Users/interfaces';
import { FC, Fragment, useContext, useEffect } from 'react';
import { IRowsWithCount } from 'interfaces/common.interfaces';
import { ReviewCard } from 'sections/Users/components/ReviewCard';
import { Pagination } from 'components/common';
import { Context } from '../context';

interface IProps {
  reviews: IRowsWithCount<IUserReview[]>;
  user: IUser;
}

const SellerReviewListTabContent: FC<IProps> = ({ reviews, user }) => {
  const { setSummaryContentLeft } = useContext(Context);

  useEffect(() => {
    setSummaryContentLeft(
      <>
        {reviews.count > 0 && (
          <Pagination total={reviews.count} pageSize={10} />
        )}
      </>,
    );
  }, []);

  return (
    <Fragment>
      {reviews?.rows?.length ? (
        <ul>
          {reviews.rows.map((review, i) => (
            <ReviewCard key={i} review={review} />
          ))}
        </ul>
      ) : (
        <h3>Еще нет отзывов</h3>
      )}
    </Fragment>
  );
};

export default SellerReviewListTabContent;
