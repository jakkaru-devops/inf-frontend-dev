import { FC } from 'react';
import { Spin } from 'antd';
import { CloseCircleFilled, LoadingOutlined } from '@ant-design/icons';
import classNames from 'classnames';
import { checkFileIsImage, getFileExtension } from 'utils/files.utils';
import { IFileItemProps } from './interfaces';
import { useLocale } from 'hooks/locale.hook';
import { useModalsState } from 'hooks/modal.hook';

const FileItem: FC<IFileItemProps> = ({
  file,
  className,
  size,
  onClick,
  onDelete,
}) => {
  const { locale } = useLocale();
  const { Modal, openModal } = useModalsState();

  const { name, path, url, localUrl, uploadPercent } = file;
  const fileUrl = localUrl || url;
  const fileExt = getFileExtension(name);
  const isImage = checkFileIsImage(fileExt) && path;

  return (
    <div
      className={classNames(['file-item', className], {
        'file-item--is-image': isImage,
        'file-item--size-small': size === 'small',
      })}
    >
      <Modal attachment={file} />
      <a
        href={!isImage ? fileUrl : null}
        target="_blank"
        rel="noopener noreferrer"
        className="file-item__inner"
        onClick={e => {
          if (isImage) {
            e.preventDefault();
            openModal('image');
          }
          onClick && onClick(e);
        }}
        title={name}
      >
        {isImage && (
          <div className="file-item__img">
            <img src={fileUrl} alt="" />
          </div>
        )}
        <div className="file-item__bg"></div>
        <div className="file-item__name">{name}</div>
        <div className="file-item__ext">{fileExt}</div>
        {typeof uploadPercent === 'number' && (
          <div className="file-item__upload-progress">
            {uploadPercent < 100 ? (
              <>
                <div className="file-item__upload-progress__text">
                  {uploadPercent.roundFraction(2)} %
                </div>
                <div className="file-item__upload-progress__line">
                  <div
                    className="file-item__upload-progress__fill"
                    style={{ width: `${uploadPercent}%` }}
                  />
                </div>
              </>
            ) : (
              <div className="file-item__upload-progress__spinner">
                <Spin indicator={<LoadingOutlined />} />
              </div>
            )}
          </div>
        )}
        {onDelete && (
          <div
            className="file-item__delete"
            onClick={e => {
              e.stopPropagation();
              e.preventDefault();
              onDelete(file);
            }}
            title={locale.common.delete}
          >
            <CloseCircleFilled />
          </div>
        )}
      </a>
    </div>
  );
};

export default FileItem;
