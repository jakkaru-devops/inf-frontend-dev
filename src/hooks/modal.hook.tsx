import { useCallback, useState } from 'react';
import { ModalType } from 'components/complex/ModalWrapper/interfaces';
import { ModalWrapper } from 'components/complex/ModalWrapper/index';
import _ from 'lodash';

interface IModal {
  type: ModalType | null;
  isVisible: boolean;
}

const INITIAL_MODAL: IModal = {
  type: null,
  isVisible: false,
};

export const useModalsState = (amount?: number) => {
  const initialModals = amount
    ? _.fill<IModal>(Array(amount), INITIAL_MODAL)
    : [INITIAL_MODAL];
  const [modals, setModals] = useState<Array<IModal>>(initialModals);

  const openModal = (type: ModalType, key?: number) => {
    if (key) {
      setModals(prevState =>
        prevState.map((modal, index) =>
          index === key ? { type, isVisible: true } : modal,
        ),
      );
    } else {
      setModals([{ type, isVisible: true }]);
    }
  };

  const closeModal = () => {
    setModals(initialModals);
  };

  const deps = modals.map(modal => modal.isVisible);
  const Modal = useCallback(
    props => {
      const modal = modals.find((modal, index) => index === props.index);
      if (modal) {
        return (
          <ModalWrapper type={modal.type} closeModal={closeModal} {...props} />
        );
      }
      return (
        <ModalWrapper
          type={modals[0].type}
          closeModal={closeModal}
          {...props}
        />
      );
    },
    [JSON.stringify(deps)],
  );

  return { Modal, openModal, closeModal };
};
