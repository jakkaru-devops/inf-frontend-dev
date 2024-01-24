import { ISetState } from 'interfaces/common.interfaces';
import {
  IOrder,
  IOrderAttachment,
  IOrderRequest,
} from 'sections/Orders/interfaces';

export interface IOrderAttachmentGroupedListProps {
  order: IOrderRequest;
  setOrder?: ISetState<IOrderRequest>;
  offer?: IOrder;
  attachments: IOrderAttachment[];
  setAttachments?: ISetState<IOrderAttachment[]>;
  withUploads?: boolean;
  maxWidth?: number | string;
}
