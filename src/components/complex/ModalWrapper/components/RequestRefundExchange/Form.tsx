import { Checkbox, Button } from 'antd';
import classNames from 'classnames';
import {
  InputNumber,
  FileUpload,
  KeyValueItem,
  TextEditor,
} from 'components/common';
import { API_ENDPOINTS } from 'data/paths.data';
import { FC, Fragment } from 'react';
import {
  IOrder,
  IRefundExchangeReason,
  IRequestProduct,
} from 'sections/Orders/interfaces';
import useHandlers from '../../handlers/requestRefundExchange.handlers';

export const RequestRefundExchangeForm: FC<{
  requestProduct: IRequestProduct;
  order: IOrder;
  title?: string;
}> = ({ requestProduct, order, title }) => {
  const {
    locale,
    disputeResolution,
    quantity,
    comment,
    reasonList,
    handlers,
    allowRequest,
    createRefundExchangeRequest,
  } = useHandlers({ requestProduct, order });

  return (
    <Fragment>
      <h2 className="text_24 color-black mb-15">{title || 'Возврат/обмен'}</h2>

      <span className="block text_18_bold text-left">
        {requestProduct?.product.name}
      </span>
      <span className="block mb-20">{requestProduct?.product.article}</span>

      <div className="d-flex mb-20">
        {['EXCHANGE', 'REFUND'].map((dr: 'EXCHANGE' | 'REFUND', i) => (
          <Checkbox
            key={i}
            className="flex align-items-center ml-0 mr-5"
            checked={dr === disputeResolution}
            onChange={() => handlers.handleDisputeResolutionChange(dr)}
          >
            {locale.refundExchange.disputeResolutions[dr]}
          </Checkbox>
        ))}
      </div>

      <div className="d-flex mb-20">
        <div className="pr-10">
          <span className="block">
            количество в заказе: {requestProduct?.count} шт.
          </span>
          <span className="block">
            количество к возврату:{' '}
            <InputNumber
              value={quantity}
              onChange={(value: number) => handlers.handleQuantityChange(value)}
              min={1}
              max={requestProduct?.count}
              width="52px"
              size="small"
              showControls
              colorPrimary
              widthSmall
              textCenter
            />{' '}
            шт.
          </span>
        </div>
        <div className="pl-10" style={{ borderLeft: '1px solid black' }}>
          <span className="block">
            Сумма:{' '}
            {(requestProduct?.count * requestProduct?.unitPrice)
              .gaussRound()
              .separateBy(' ')}{' '}
            ₽
          </span>
          <span className="block">
            Сумма:{' '}
            {(quantity * requestProduct?.unitPrice)
              .gaussRound()
              .separateBy(' ')}{' '}
            ₽
          </span>
        </div>
      </div>

      {[
        'poorQuality',
        'deliveryTimesViolated',
        'inadequateSet',
        'notCorrespond',
        'notFit',
        'orderingMistake',
        'other',
      ].map((reason: IRefundExchangeReason, i) => (
        <Checkbox
          key={i}
          className="flex align-items-center ml-0 mb-10"
          checked={reasonList.includes(reason)}
          onChange={() => handlers.handleReasonListChange(reason)}
        >
          {locale.refundExchange.reasons[reason]}
        </Checkbox>
      ))}

      <KeyValueItem
        keyText="Комментарий"
        value={
          <TextEditor
            value={comment}
            name="comment"
            height="150px"
            width="364px"
            onChange={comment => handlers.handleCommentChange(comment)}
          />
        }
        inline={false}
        className="mt-10 mb-10"
      />

      <FileUpload
        url={API_ENDPOINTS.FILE_UNKNOWN}
        onFinishUpload={uploadedFiles =>
          handlers.handleFilesUpload(uploadedFiles.map(({ id }) => id))
        }
        onDelete={deletedFile => {
          handlers.handleFileDelete(deletedFile.id);
        }}
      />

      <Button
        type="primary"
        className={classNames('color-white mt-15 gray', {
          disabled: !allowRequest,
        })}
        style={{ marginLeft: 'auto' }}
        disabled={!allowRequest}
        onClick={createRefundExchangeRequest}
      >
        Отправить
      </Button>
    </Fragment>
  );
};
