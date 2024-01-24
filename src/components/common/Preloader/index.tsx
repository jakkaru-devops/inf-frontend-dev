import { Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import { FC, useEffect, useState } from 'react';

interface IProps {
  showPreloaderDelay?: number; // milliseconds
  size?: 'default' | 'small';
}

const DEFAULT_SHOW_PRELOADER_DELAY = 200;

const Preloader: FC<IProps> = ({
  showPreloaderDelay = DEFAULT_SHOW_PRELOADER_DELAY,
  size = 'default',
}) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setVisible(true);
    }, showPreloaderDelay);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        opacity: visible ? '1' : '0',
        transition: 'opacity .5s',
      }}
    >
      <Spin
        size={size}
        indicator={<LoadingOutlined style={{ fontSize: 50 }} />}
      />
    </div>
  );
};

export default Preloader;
