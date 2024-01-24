import axios from 'axios';
import { API_SERVER_URL } from 'config/env';
import { IMAGE_EXTENSIONS } from 'data/files.data';
import mime from 'mime-types';

export const getFilenameFromUrl = (url: string) => {
  const urlParts = url.split('/');
  return urlParts.pop();
};

export const getFileExtension = (filename: string) => {
  const filenameParts = filename.split('.');
  return filenameParts[filenameParts.length - 1];
};

export const checkFileIsImage = (ext: string) => {
  switch (ext) {
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
    case 'tiff':
    case 'webp':
    case 'svg':
      return true;

    default:
      return false;
  }
};

export const getServerFileUrl = (filePath: string) => {
  return `${API_SERVER_URL}/files/${filePath}`;
};

export const printFileByPath = (path: string) => {
  axios({
    method: 'get',
    url: path,
    responseType: 'blob',
  }).then(res => {
    const blobURL = URL.createObjectURL(
      new Blob([res.data], { type: mime.lookup(path) }),
    );
    const iframe = document.createElement('iframe');
    document.body.appendChild(iframe);
    iframe.style.display = 'none';
    iframe.src = blobURL;
    iframe.onload = () => {
      setTimeout(() => {
        iframe.focus();
        iframe.contentWindow.print();
      }, 1);
    };
  });
};

export const downloadFileByPath = (path: string, name: string) => {
  console.log(path, name);
  axios({
    method: 'get',
    url: path,
    responseType: 'blob',
  }).then(res => {
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', name);
    document.body.appendChild(link);
    link.click();
  });
};

export const openFileByPath = (path: string, target?: '_self' | '_blank') => {
  target = target || '_blank';
  window.open(path, target);
};

export const downloadBase64 = async (data: string, name: string) => {
  const link = document.createElement('a');
  link.href = 'data:application/pdf;base64,' + data;
  link.setAttribute('download', name);
  document.body.appendChild(link);
  link.click();
};

export const downloadBlob = async (urlBlob: string, name: string) => {
  const link = document.createElement('a');
  link.href = urlBlob;
  link.setAttribute('download', name);
  document.body.appendChild(link);
  link.click();
};

export const handleAttachmentClick = (
  attachment: { name: string; ext: string; url?: string },
  openModal: () => void,
) => {
  if (!attachment) return;

  IMAGE_EXTENSIONS.includes(attachment.ext)
    ? openModal()
    : attachment?.ext === 'pdf'
    ? openFileByPath(attachment.url, '_blank')
    : downloadFileByPath(attachment.url, attachment.name);
};
