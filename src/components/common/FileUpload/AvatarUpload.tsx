import { apiUrl } from 'utils/api.utils';
import { API_ENDPOINTS } from 'data/paths.data';
import { Upload } from 'antd';
import { CSSProperties, FC, ReactNode, useEffect, useState } from 'react';
import { PlusOutlined } from '@ant-design/icons';
import { IMAGE_EXTENSIONS } from 'data/files.data';

interface AvatarUploadProps {
  onUploaded: (path: string) => void;
  change?: boolean;
  style?: CSSProperties;
  children?: ReactNode;
}

export const AvatarUpload: FC<AvatarUploadProps> = ({
  onUploaded,
  change,
  style,
  children,
}) => {
  const [fileStatus, setFileStatus] = useState<boolean>(false);
  const [path, setPath] = useState<string>(null);

  const onDoneHandler = (path: string) => {
    setPath(path);
    setFileStatus(true);
  };

  useEffect(() => {
    if (fileStatus) {
      console.log(fileStatus);
      onUploaded(path);
    }
    setFileStatus(false);
  }, [fileStatus]);

  if (change) {
    return (
      <Upload
        showUploadList={false}
        action={apiUrl(API_ENDPOINTS.FILE_UNKNOWN)}
        onChange={info => {
          info.fileList[info.fileList.length - 1].status === 'done' &&
            onDoneHandler(
              info.fileList[info.fileList.length - 1].response.data.result.path,
            );
        }}
        style={style}
      >
        {children}
      </Upload>
    );
  } else {
    return (
      <Upload
        showUploadList={false}
        action={apiUrl(API_ENDPOINTS.FILE_UNKNOWN)}
        onChange={info => {
          info.fileList[0].status === 'done' &&
            onDoneHandler(info.fileList[0].response.data.result.path);
        }}
        listType="picture-card"
        accept={IMAGE_EXTENSIONS.map(ext => `.${ext}`).join(',')}
        style={style}
      >
        <div style={{ color: '#E5E5E5' }}>
          <PlusOutlined />
          <div style={{ margin: 9 }}>Добавить фото</div>
        </div>
      </Upload>
    );
  }
};
