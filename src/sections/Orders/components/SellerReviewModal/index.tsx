import { Button, Modal, Rate } from 'antd';
import { Container, TextEditor } from 'components/common';
import { DEFAULT_NAV_PATHS } from 'data/nav.data';
import { APP_PATHS } from 'data/paths.data';
import { useRouter } from 'next/router';
import { generateUrl } from 'utils/common.utils';
import useHandlers from './handlers';
import { ISellerReviewModalProps } from './interfaces';
import { FC } from 'react';

const SellerReviewModal: FC<ISellerReviewModalProps> = ({
  open,
  onCancel,
  onSuccess,
  receiverId,
  orderId,
}) => {
  const { rating, text, handlers, writeReview } = useHandlers({
    open,
    onCancel,
    onSuccess,
    receiverId,
    orderId,
  });
  const router = useRouter();

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      centered
      title={null}
      footer={null}
      width={'auto'}
      className="close-icon-hidden"
    >
      <Container size="extraSmall" noPadding>
        <h2 style={{ fontSize: 26, marginTop: -10 }}>Спасибо, что Вы с нами</h2>
        <span className="block text_14_normal">Оцените работу продавца</span>
        <Rate
          value={rating}
          className="mb-10"
          onChange={value => handlers.handleRatingChange(value)}
        />

        <span className="block text_14_normal mb-10">Напишите отзыв</span>
        <TextEditor
          value={text}
          name="text"
          height="100px"
          width="300px"
          onChange={text => handlers.handleTextChange(text)}
        />

        <div className="d-flex mt-15">
          <Button
            type="primary"
            className="color-white mr-15 w-100 gray"
            onClick={() => {
              router.push(
                generateUrl(
                  {
                    history: DEFAULT_NAV_PATHS.PERSONAL_AREA,
                  },
                  {
                    pathname: APP_PATHS.PERSONAL_AREA,
                  },
                ),
              );
              onCancel();
            }}
          >
            Позже
          </Button>
          <Button
            type="primary"
            className="color-white w-100 gray"
            onClick={writeReview}
          >
            Отправить
          </Button>
        </div>
      </Container>
    </Modal>
  );
};

export default SellerReviewModal;
