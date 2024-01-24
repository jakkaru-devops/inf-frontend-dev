import { useModalsState } from 'hooks/modal.hook';
import { DetailedHTMLProps, FC, ImgHTMLAttributes } from 'react';

const ModalImage: FC<
  DetailedHTMLProps<ImgHTMLAttributes<HTMLImageElement>, HTMLImageElement>
> = props => {
  const { Modal, openModal } = useModalsState();

  return (
    <>
      <Modal attachment={{ url: props.src, name: props.alt }} />
      <img
        {...props}
        style={{ ...props.style, cursor: 'pointer' }}
        onClick={() => openModal('image')}
      />
    </>
  );
};

export default ModalImage;
