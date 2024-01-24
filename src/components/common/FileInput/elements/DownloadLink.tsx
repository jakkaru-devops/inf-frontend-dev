import { FC } from 'react';
import { IDownloadLink } from '../interfaces';
import { isIOSDevice } from 'utils/common.utils';

/**
 * @description Download file Immediately if no IOS platform uses, open at the new tab instead.
 * @param {*} { file }
 * @returns {FC<IDownloadLink>} FC<IDownloadLink>, <a> HTMLelement element.
 */
const DownloadLink: FC<IDownloadLink> = ({ file }) => {
  const blobFromFile: Blob = new Blob([file], { type: file.type });
  const blobUrl: string = URL.createObjectURL(blobFromFile);
  return (
    <a
      className="download-link"
      href={blobUrl}
      target="_self"
      download={!isIOSDevice() && file.name}
    />
  );
};

export { DownloadLink };
