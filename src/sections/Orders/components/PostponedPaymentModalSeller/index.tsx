import { Modal } from 'components/common';
import { IModalPropsBasic } from 'components/common/Modal/interfaces';
import { FC } from 'react';
import { IPostponedPayment } from 'sections/Orders/interfaces';
import PostponedPaymentModalSellerContent from './Content';

interface IProps extends IModalPropsBasic {
  postponedPayment: IPostponedPayment;
  onSubmit: (postponedPayment: IPostponedPayment) => void;
}

const PostponedPaymentModalSeller: FC<IProps> = ({
  postponedPayment,
  onSubmit,
  ...modalProps
}) => {
  return (
    <Modal
      {...modalProps}
      centered
      destroyOnClose
      className="postponed-payment-modal"
    >
      {!!postponedPayment && (
        <PostponedPaymentModalSellerContent
          {...modalProps}
          postponedPayment={postponedPayment}
          onSubmit={onSubmit}
        />
      )}
    </Modal>
  );
};

export default PostponedPaymentModalSeller;
