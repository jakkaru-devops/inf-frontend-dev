import classNames from 'classnames';
import { IFileListNewProps } from './interfaces';
import FileUploadInput from './Input';
import { useState, useEffect, useCallback, FC } from 'react';
import { FileItem } from '..';
import { IFileItem } from 'interfaces/files.interfaces';
import { useDropzone } from 'react-dropzone';
import { APIRequest, fileUrl } from 'utils/api.utils';
import { v4 as UUIDv4 } from 'uuid';
import { openNotification } from 'utils/common.utils';

const FileUpload: FC<IFileListNewProps> = ({
  url,
  className,
  hideUploadButton,
  size,
  style,
  disabled,
  inputContent,
  accept,
  initFiles,
  maxFilesNumber,
  maxFileSize,
  inputRef,
  fileIds,
  textInputFile,
  onStartUpload,
  onFileUploaded,
  onFinishUpload,
  onDelete,
}) => {
  const [files, setFiles] = useState<IFileItem[]>(initFiles || []);
  const [activeUploadings, setActiveUploadings] = useState<string[]>([]);
  const [stateCounter, setStateCounter] = useState(0);

  maxFileSize = maxFileSize || 20 * 1024 * 1024;

  useEffect(() => {
    if (!fileIds) return;
    setFiles(prevFiles => prevFiles.filter(({ id }) => fileIds.includes(id)));
  }, [fileIds]);

  const handleChange = useCallback(async (acceptedFiles: File[]) => {
    // Max number of files
    if (
      typeof maxFilesNumber === 'number' &&
      files.length + acceptedFiles.length > maxFilesNumber
    ) {
      openNotification(`Максимальное количество файлов - ${maxFilesNumber}`);
      return;
    }

    const selectedFiles: IFileItem[] = [];
    const uploadedFileList: IFileItem[] = [];
    const initialIdList: string[] = [];
    for (let i = 0; i < acceptedFiles.length; i++) {
      initialIdList.push(UUIDv4());
    }

    onStartUpload && onStartUpload(acceptedFiles);
    setActiveUploadings(prev => prev.concat(initialIdList));

    // Display new files
    for (let i = 0; i < acceptedFiles.length; i++) {
      const file = acceptedFiles[i];
      if (!file) continue;

      if (typeof maxFileSize === 'number' && file.size > maxFileSize) {
        openNotification(
          <>
            Размер файла <strong>{file.name}</strong> превышает максимальный -
            20 мб
          </>,
        );
        continue;
      }

      selectedFiles.push({
        id: initialIdList[i],
        initialId: initialIdList[i],
        name: file.name,
        size: file.size,
        uploadPercent: 0,
        localUrl: URL.createObjectURL(file),
      });
    }

    setFiles(prev => prev.concat(selectedFiles));
    setStateCounter(prev => prev + 1);

    // Upload each file and add update upload progress
    const promises: Promise<void>[] = [];
    for (let i = 0; i < acceptedFiles.length; i++) {
      const file = acceptedFiles[i];
      if (!file || !selectedFiles.find(el => el.name === file.name)) continue;

      const initialId = initialIdList[i];
      const formData = new FormData();
      formData.append('file', file);
      formData.append('filename', file.name);

      promises.push(
        APIRequest({
          method: 'post',
          url,
          data: formData,
          onUploadProgress: ({ total, loaded }: ProgressEvent) => {
            const progress = ((100 / total) * loaded).roundFraction(2);
            setFiles(prev => {
              const index = prev.findIndex(
                file => file.initialId === initialId,
              );
              if (index === -1) return prev;
              prev[index].uploadPercent = progress;
              return prev;
            });
            setStateCounter(prev => prev + 1);
          },
        }).then(res => {
          if (!res.isSucceed) {
            openNotification(res?.message);
            return;
          }
          const uploadedFile = res.data.result;
          setFiles(prevFiles => {
            const index = prevFiles.findIndex(({ id }) => id === initialId);
            if (index === -1) return prevFiles;

            const newFiles = prevFiles;

            newFiles[index] = {
              ...newFiles[index],
              id: uploadedFile.id,
              name: uploadedFile.name,
              ext: uploadedFile.ext,
              path: uploadedFile.path,
              url: fileUrl(uploadedFile.path),
              uploadPercent: null,
            };

            setActiveUploadings(prevUploadings => {
              const newValue = prevUploadings.filter(el => el !== initialId);
              !!onFileUploaded && onFileUploaded(newFiles[index], newValue);
              return newValue;
            });

            return newFiles;
          });

          uploadedFileList.push({
            id: uploadedFile.id,
            name: uploadedFile.name,
            ext: uploadedFile.ext,
            path: uploadedFile.path,
            url: fileUrl(uploadedFile.path),
            uploadPercent: null,
          });

          setStateCounter(prev => prev + 1);
          return uploadedFile;
        }),
      );
    }

    Promise.all(promises).then(() => {
      !!onFinishUpload && onFinishUpload(uploadedFileList);
      console.log('All done');
    });
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleChange,
  });
  const uploadAllowed = !(
    typeof maxFilesNumber === 'number' && files.length >= maxFilesNumber
  );

  return (
    <div
      {...getRootProps()}
      className={classNames(['file-input', className], {
        'file-input--size-small': size === 'small',
        'file-input--dropzone-active': isDragActive && uploadAllowed,
        hidden: hideUploadButton && files.length === 0,
      })}
      style={style}
    >
      <div className="file-input__inner">
        {files.map(file => (
          <FileItem
            key={file.id}
            file={file}
            onDelete={
              !disabled
                ? deletedFile => {
                    setFiles(prevFiles => {
                      setActiveUploadings(prevUploadings => {
                        const newValue = prevUploadings.filter(
                          el => el !== deletedFile.initialId,
                        );
                        !!onDelete && onDelete(deletedFile, newValue);
                        return newValue;
                      });
                      return prevFiles.filter(
                        ({ id }) => id !== deletedFile.id,
                      );
                    });
                    setStateCounter(prev => prev + 1);
                  }
                : null
            }
            className="file-input__file-item"
            size={size}
          />
        ))}
        <FileUploadInput
          textInputFile={textInputFile}
          hideUploadButton={hideUploadButton}
          size={size}
          disabled={disabled || !uploadAllowed}
          inputContent={inputContent}
          accept={accept}
          inputRef={inputRef}
          getInputProps={getInputProps}
        />
      </div>
    </div>
  );
};

export default FileUpload;
