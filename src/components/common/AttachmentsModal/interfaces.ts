import { IAttachment } from 'sections/Catalog/interfaces/products.interfaces';

export interface IAttachmentsModalProps {
  open: boolean;
  onCancel: () => void;
  attachments: IAttachment[];
}
