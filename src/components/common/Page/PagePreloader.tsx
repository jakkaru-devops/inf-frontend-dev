import { FC } from 'react';
import Preloader from '../Preloader';

interface IProps {
  showPreloaderDelay?: number; // milliseconds
}

const PagePreloader: FC<IProps> = ({ showPreloaderDelay }) => {
  return (
    <div
      style={{
        width: '100%',
        display: 'flex',
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Preloader showPreloaderDelay={showPreloaderDelay || 500} />
    </div>
  );
};

export default PagePreloader;
