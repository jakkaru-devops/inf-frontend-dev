import { KeyValueItem } from 'components/common';
import { FC, RefObject, useRef, useState } from 'react';
import OrderAttachmentGroupedList from '../OrderAttachmentGroupedList';
import { IOrderAttachmentGroupedListProps } from '../OrderAttachmentGroupedList/interfaces';
import { CaretDownOutlined } from '@ant-design/icons';

const OrderAttachmentListExtendable: FC<IOrderAttachmentGroupedListProps> = ({
  ...props
}) => {
  if (!props?.attachments?.length) return <></>;

  const wrapperRef: RefObject<HTMLDivElement> = useRef();
  const [expanded, setExpanded] = useState(false);
  const maxCollapsedHeight = 74;
  const contentHeight = wrapperRef?.current?.clientHeight;
  const expandAvailable = contentHeight > maxCollapsedHeight;

  return (
    <KeyValueItem
      keyText="Вложения"
      value={
        <div>
          <div
            style={{
              maxHeight: expanded ? contentHeight : maxCollapsedHeight,
              transition: 'all 0.3s',
              overflow: 'hidden',
            }}
          >
            <div ref={wrapperRef}>
              <OrderAttachmentGroupedList {...props} maxWidth={400} />
            </div>
          </div>
          {expandAvailable && (
            <div
              className="d-table color-primary text-underline text-lowercase cursor-pointer"
              onClick={() => setExpanded(prev => !prev)}
            >
              <span className="d-flex">
                {!expanded ? 'Показать все' : 'Скрыть'}{' '}
                <span
                  style={{
                    transition: 'transform 0.3s',
                    transform: expanded ? 'rotate(180deg)' : 'none',
                    marginLeft: 3,
                    marginTop: 2,
                  }}
                >
                  <CaretDownOutlined />
                </span>
              </span>
            </div>
          )}
        </div>
      }
      valueClassName="mt-0"
      inline={false}
    />
  );
};

export default OrderAttachmentListExtendable;
