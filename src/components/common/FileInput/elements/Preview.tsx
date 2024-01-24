import { CloseCircleFilled } from '@ant-design/icons';
import { FC, useState, MouseEvent } from 'react';
import { Modal } from 'antd';
import classnames from 'classnames';
import { APIRequest } from 'utils/api.utils';
import { getFileExtension, checkFileIsImage } from 'utils/files.utils';
import { DownloadLink } from './DownloadLink';
import { IPreview } from '../interfaces';
import { useEffect } from 'react';

/**
 * @description Custom preview component for react-dropzone-uploader. Upload and Delete file to/from server.
 * @param {*} { meta, fileWithMeta, onRemove }
 * @returns {FC<ICustomPreview>} FC<ICustomPreview>
 */
const Preview: FC<IPreview> = props => {
  const { meta, fileWithMeta, uploadedFiles, onRemove, url } = props;
  const [preview, setPreview] = useState(false);
  const { name, percent, status, previewUrl } = meta;
  const { remove, cancel, xhr, file } = fileWithMeta;
  const rootClassname: string = 'file-input__preview';
  const ext = getFileExtension(name);

  useEffect(() => {
    if (!xhr) return;
    const response = JSON.parse(xhr.response);
    const fileId = response.data.result.id;

    if (uploadedFiles && !uploadedFiles.map(({ id }) => id).includes(fileId)) {
      remove();
    }
  }, [uploadedFiles]);

  const removeFromServer = () => {
    if (status === 'done') {
      const response = JSON.parse(xhr.response);
      const id = response.data.result.id;

      return APIRequest({
        method: 'delete',
        url,
        params: {
          fileId: response.data.result.id,
        },
        requireAuth: true,
      }).then(() => onRemove(id));
    }
    return cancel;
  };

  const onFileDelete = (
    e: MouseEvent<HTMLDivElement, globalThis.MouseEvent>,
  ) => {
    e.stopPropagation();
    e.preventDefault();
    remove();
    removeFromServer();
  };

  const renderPreviewImage = () =>
    previewUrl ? (
      <div className={classnames(`${rootClassname}__img`)}>
        <img className="img" src={previewUrl} />
      </div>
    ) : null;

  const renderStatus = () =>
    status !== 'done' ? (
      <div className={classnames(`${rootClassname}__status`)}>
        <span>{Math.round(percent)}%</span>
      </div>
    ) : null;

  const renderModalPreview = () =>
    checkFileIsImage(ext) ? (
      <Modal
        open={preview}
        title={name}
        footer={null}
        onCancel={() => setPreview(false)}
        centered
      >
        <img alt={name} style={{ width: '100%' }} src={previewUrl} />
      </Modal>
    ) : (
      <DownloadLink file={file} />
    );

  return (
    <div className={classnames(rootClassname)}>
      <span className={classnames(`${rootClassname}__name`)}>{name}</span>
      <div
        className={classnames(`${rootClassname}__bg`)}
        onClick={() => {
          setPreview(true);
        }}
      />

      <div
        className={classnames(`${rootClassname}__delete`)}
        onClick={onFileDelete}
      >
        <CloseCircleFilled width="14px" />
      </div>
      <div className={classnames(`${rootClassname}__ext`)}>{ext}</div>
      {renderPreviewImage()}
      {renderStatus()}
      {renderModalPreview()}
    </div>
  );
};

export { Preview };
