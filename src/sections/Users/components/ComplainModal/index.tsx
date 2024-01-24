import { Button } from 'antd';
import Checkbox from 'antd/lib/checkbox/Checkbox';
import classNames from 'classnames';
import { FileUpload, KeyValueItem, TextEditor } from 'components/common';
import { API_ENDPOINTS } from 'data/paths.data';
import { IUser, IUserRoleLabelsDefault } from 'sections/Users/interfaces';
import useHandlers from './handlers';
import { IComplainReason } from 'sections/Users/interfaces';
import Modal from 'antd/lib/modal/Modal';
import { FC } from 'react';

const ComplainModal: FC<{
  open: boolean;
  onCancel: () => void;
  defendantId: IUser['id'];
  defendantRoleLabel: IUserRoleLabelsDefault;
}> = ({ open, defendantId, defendantRoleLabel, onCancel }) => {
  const {
    locale,
    comment,
    reasonList,
    handlers,
    allowComplain,
    createComplaint,
  } = useHandlers({ defendantId, defendantRoleLabel, onCancel });

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      title="Жалоба"
      footer={null}
      className="footer-hidden"
      centered
    >
      {['spam', 'behaviour', 'fraud', 'nonobservance'].map(
        (reason: IComplainReason, i) => (
          <Checkbox
            key={i}
            className="flex align-items-center ml-0 mb-10"
            checked={reasonList.includes(reason)}
            onChange={() => handlers.handleReasonListChange(reason)}
          >
            {locale.complaint.reasons[reason]}
          </Checkbox>
        ),
      )}

      <KeyValueItem
        keyText="Комментарий"
        value={
          <TextEditor
            value={comment}
            name="comment"
            height="150px"
            width="442px"
            onChange={comment => handlers.handleCommentChange(comment)}
          />
        }
        valueClassName="text-normal"
        className="mt-20"
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
          disabled: !allowComplain,
        })}
        style={{ marginLeft: 'auto' }}
        disabled={!allowComplain}
        onClick={createComplaint}
      >
        Отправить
      </Button>
    </Modal>
  );
};

export default ComplainModal;
