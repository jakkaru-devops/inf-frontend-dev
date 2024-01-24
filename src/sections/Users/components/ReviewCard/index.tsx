import { getUserName } from 'sections/Users/utils';
import { Rate } from 'antd';
import { APP_PATHS } from 'data/paths.data';
import { IUserReview } from 'sections/Users/interfaces';
import { Link } from 'components/common';
import { generateInnerUrl, renderHtml } from 'utils/common.utils';
import { FC } from 'react';
import { useAuth } from 'hooks/auth.hook';

interface IProps {
  review: IUserReview;
}

export const ReviewCard: FC<IProps> = ({ review }) => {
  const auth = useAuth();

  return (
    <li key={review.id} className="review-card">
      <div className="details">
        {auth?.currentRole?.label !== 'customer' ? (
          <Link
            href={generateInnerUrl(APP_PATHS.CUSTOMER(review.authorId), {
              text: getUserName(review.author, 'full'),
            })}
            className="color-primary"
          >
            {getUserName(review.author, 'full')}
          </Link>
        ) : (
          <span className="color-primary">
            {getUserName(review.author, 'full')}
          </span>
        )}
        {review?.text && review.text !== '<p><br></p>' && (
          <span className="mt-5">{renderHtml(review.text)}</span>
        )}
      </div>

      <Rate value={review.rating} disabled />
    </li>
  );
};
