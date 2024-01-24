import { IOrderRequest } from 'sections/Orders/interfaces';
import { IUser, IUserReview } from 'sections/Users/interfaces';

export interface ISellerReviewModalProps {
  open: boolean;
  onCancel: () => void;
  onSuccess: (review: IUserReview) => void;
  receiverId: IUser['id'];
  orderId: IOrderRequest['id'];
}
