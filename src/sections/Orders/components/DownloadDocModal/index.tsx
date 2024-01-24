import { Button, Modal } from 'antd';
import { Preloader } from 'components/common';
import { FC, MouseEvent as ReactMouseEvent } from 'react';

interface IProps {
  open: boolean;
  onCancel: () => void;
  downloadPdf: (e: ReactMouseEvent<HTMLElement, MouseEvent>) => void;
  downloadXlsx: (e: ReactMouseEvent<HTMLElement, MouseEvent>) => void;
  loading: boolean;
  downloadAnalytics?: () => void;
}

export const DownloadDocModal: FC<IProps> = ({
  open,
  onCancel,
  downloadPdf,
  downloadXlsx,
  loading,
  downloadAnalytics,
}) => {
  return (
    <Modal
      open={open}
      onCancel={onCancel}
      centered={true}
      footer={null}
      className="close-icon-hidden header-hidden header-border-hidden footer-hidden"
      width={downloadAnalytics ? 500 : 360}
    >
      {loading && (
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,.2)',
            display: 'flex',
            justifyContent: 'center',
            alignContent: 'center',
            zIndex: 10,
          }}
        >
          <Preloader />
        </div>
      )}

      <div
        className="d-flex justify-content-between"
        style={{
          padding: '20px 20px',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <Button
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            cursor: 'pointer',
            width: 'auto',
            height: 'auto',
            boxShadow: 'none',
          }}
          onClick={downloadPdf}
          className="no-bg no-border"
        >
          <img
            src="/img/icons/download-pdf-doc.svg"
            style={{
              height: 50,
              display: 'block',
            }}
          />
          <span style={{ fontSize: 14, fontWeight: 600 }}>Скачать в .PDF</span>
        </Button>
        <Button
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            cursor: 'pointer',
            width: 'auto',
            height: 'auto',
            boxShadow: 'none',
          }}
          onClick={downloadXlsx}
          className="no-bg no-border"
        >
          <img
            src="/img/icons/download-excel-doc.svg"
            style={{
              height: 50,
              display: 'block',
            }}
          />
          <span style={{ fontSize: 14, fontWeight: 600 }}>Скачать в .XLSX</span>
        </Button>
        {!!downloadAnalytics && (
          <Button
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              cursor: 'pointer',
              width: 'auto',
              height: 'auto',
              boxShadow: 'none',
            }}
            onClick={downloadAnalytics}
            className="no-bg no-border"
          >
            <img
              src="/img/icons/analytics.svg"
              style={{
                height: 50,
                display: 'block',
              }}
            />
            <span style={{ fontSize: 14, fontWeight: 600 }}>
              Скачать аналитику
            </span>
          </Button>
        )}
      </div>
    </Modal>
  );
};

export default DownloadDocModal;
