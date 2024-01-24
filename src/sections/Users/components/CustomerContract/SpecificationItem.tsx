import classNames from 'classnames';
import { IMAGE_EXTENSIONS } from 'data/files.data';
import { useModalsState } from 'hooks/modal.hook';
import { FC } from 'react';
import { ICustomerContractSpecification } from 'sections/JuristicSubject/interfaces';
import {
  downloadFileByPath,
  getServerFileUrl,
  handleAttachmentClick,
  openFileByPath,
} from 'utils/files.utils';

interface IProps {
  specification: ICustomerContractSpecification;
  index: number;
}

const SpecificationItem: FC<IProps> = ({ specification, index }) => {
  const { Modal, openModal } = useModalsState();
  const file = {
    ...specification?.file,
    url: getServerFileUrl(specification?.file?.path),
  };

  return (
    <div key={specification.id}>
      {!!file.url && <Modal attachment={file} />}

      <span
        style={file?.url && { cursor: 'pointer' }}
        className={classNames('one-line-text', {
          'text-underline color-primary': !!file?.url,
        })}
        onClick={e => {
          e.preventDefault();
          handleAttachmentClick(file, () => openModal('image'));
        }}
        title={file?.name}
      >
        {index + 1}. {specification.name}
      </span>
    </div>
  );
};

export default SpecificationItem;
