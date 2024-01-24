import { getUserName } from 'sections/Users/utils';
import formatDate from 'date-fns/format';
import { Button } from 'antd';
import { MessageOutlined } from '@ant-design/icons';
import { APP_PATHS } from 'data/paths.data';
import { useModalsState } from 'hooks/modal.hook';
import { IComplaint, IUserRoleLabelsDefault } from 'sections/Users/interfaces';
import { fileUrl } from 'utils/api.utils';
import { Link } from 'components/common';
import { startChatWithUser } from 'components/complex/Messenger/utils/messenger.utils';
import { useLocale } from 'hooks/locale.hook';
import { generateInnerUrl } from 'utils/common.utils';
import { FC } from 'react';

interface IProps {
  complaint: IComplaint;
  appellantRoleLabel: IUserRoleLabelsDefault;
}

export const ComplaintCard: FC<IProps> = ({
  complaint,
  appellantRoleLabel,
}) => {
  const { locale } = useLocale();

  const { Modal: AttachmentsModal, openModal } = useModalsState();

  const attachments = complaint.complaintFiles.map(({ file }) => ({
    name: file.name,
    url: fileUrl(file.path),
  }));

  return (
    <div key={complaint.id} className="complaint-card">
      <div className="details">
        <Link
          href={
            (appellantRoleLabel === 'customer' &&
              generateInnerUrl(APP_PATHS.CUSTOMER(complaint.appellantId), {
                text: getUserName(complaint.appellant, 'full'),
              })) ||
            (appellantRoleLabel === 'seller' &&
              generateInnerUrl(APP_PATHS.SELLER(complaint.appellantId), {
                text: getUserName(complaint.appellant, 'full'),
              }))
          }
          className="red"
        >
          {getUserName(complaint.appellant, 'full')}
        </Link>
        <span>
          {complaint.reason
            .map(reason => locale.complaint.reasons[reason])
            .join(', ')}
        </span>
        <span>{formatDate(new Date(complaint.createdAt), 'dd.MM.yyyy')}</span>
      </div>

      {complaint?.comment && (
        <span
          className="mt-15"
          dangerouslySetInnerHTML={{ __html: complaint.comment }}
        />
      )}

      <div className="d-flex mt-50">
        {attachments.length > 0 && (
          <>
            <AttachmentsModal attachmentList={attachments} />

            <Button
              type="primary"
              size="large"
              className="color-white mr-15"
              onClick={() => openModal('attachments')}
            >
              Вложения
            </Button>
          </>
        )}
        <Button
          size="large"
          type="primary"
          onClick={() =>
            startChatWithUser({
              companionId: complaint.appellantId,
              companionRole: appellantRoleLabel,
            })
          }
        >
          {appellantRoleLabel === 'customer'
            ? 'Чат с покупателем'
            : 'Чат с продавцом'}{' '}
          <MessageOutlined />
        </Button>
      </div>
    </div>
  );
};
