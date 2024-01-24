import classNames from 'classnames';
import { FC } from 'react';
import { IFileInputLayoutProps } from '../interfaces';

/**
 * @description Custom Layout component for react-dropzone-uploader.
 * @param {*} {
 *   input,
 *   previews,
 *   dropzoneProps,
 *   files,
 *   extra: { maxFiles },
 * }
 * @returns {FC<IFileInputLayoutProps>} FC<ILayoutProps>
 */
const Layout: FC<IFileInputLayoutProps> = ({
  size,
  className,
  input,
  previews,
  dropzoneProps,
  files,
  hideUploadButton,
  style,
}) => {
  return (
    <div
      className={classNames(['file-input', className], {
        'file-input--size-small': size === 'small',
        hidden: hideUploadButton && files.length === 0,
      })}
      style={style}
    >
      {previews}

      <div {...dropzoneProps} className="input-wrapper">
        {input}
      </div>
    </div>
  );
};

export { Layout };
