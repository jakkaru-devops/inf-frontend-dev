import { Button } from 'antd';
import Checkbox from 'antd/lib/checkbox/Checkbox';
import classNames from 'classnames';
import {
  Container,
  FileUpload,
  KeyValueItem,
  TextEditor,
} from 'components/common';
import { API_ENDPOINTS } from 'data/paths.data';
import { IUser, IUserRoleLabelsDefault } from 'sections/Users/interfaces';
import useHandlers from '../handlers/complain.handler';
import { IComplainReason } from 'sections/Users/interfaces';
import { FC } from 'react';

export const Complain: FC<{
  defendantId: IUser['id'];
  defendantRoleLabel: IUserRoleLabelsDefault;
  closeModal: () => void;
}> = ({ defendantId, defendantRoleLabel, closeModal }) => {
  const {
    locale,
    comment,
    reasonList,
    handlers,
    allowComplain,
    createComplaint,
  } = useHandlers({ defendantId, defendantRoleLabel, closeModal });

  return (
    <Container size="small">
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
        className="mt-20 mb-20"
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
    </Container>
  );
};
