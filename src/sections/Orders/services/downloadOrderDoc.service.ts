import { APIRequest } from 'utils/api.utils';
import { openNotification } from 'utils/common.utils';
import { downloadBlob } from 'utils/files.utils';

export const downloadOrderDocService = async ({
  url,
  docType,
  awaiting,
  setAwaiting,
  params,
}: {
  url: string;
  docType: 'pdf' | 'xlsx';
  awaiting: boolean;
  setAwaiting: (value: boolean) => void;
  params?: object;
}) => {
  if (awaiting) return;
  setAwaiting(true);
  const res = await APIRequest({
    method: 'get',
    url,
    params: {
      ...params,
      docType,
    },
    requireAuth: true,
  });
  setAwaiting(false);
  if (!res.isSucceed) {
    openNotification(res?.message);
    return;
  }
  console.log(res.data);
  const {
    filename,
    buffer,
  }: {
    path: string;
    filename: string;
    page: number;
    buffer: { data: Buffer };
  } = res?.data;

  const bufferData = new Uint8Array(buffer.data);
  const urlBlob = URL.createObjectURL(
    new Blob([bufferData], { type: 'application/vnd.ms-excel' }),
  );
  downloadBlob(urlBlob, filename);
};
