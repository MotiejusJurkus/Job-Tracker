'use client';

import { createContext, use, useCallback, useState, type PropsWithChildren, type ReactNode } from 'react';

import { Modal } from '@/core/components/ui/Modal';

type ModalOptions = {
  children: ReactNode;
  closeLabel: string;
  description?: string;
  title: string;
};

type ModalState = { status: 'closed' } | ({ status: 'open' } & ModalOptions);

type ModalContextValue = {
  closeModal: () => void;
  openModal: (options: ModalOptions) => void;
};

const ModalContext = createContext<ModalContextValue | undefined>(undefined);

export const ModalProvider = ({ children }: PropsWithChildren) => {
  const [modal, setModal] = useState<ModalState>({ status: 'closed' });

  const closeModal = useCallback(() => {
    setModal({ status: 'closed' });
  }, []);

  const openModal = useCallback((options: ModalOptions) => {
    setModal({ status: 'open', ...options });
  }, []);

  return (
    <ModalContext value={{ closeModal, openModal }}>
      {children}
      {modal.status === 'open' && (
        <Modal
          isOpen
          closeLabel={modal.closeLabel}
          description={modal.description}
          onClose={closeModal}
          title={modal.title}
        >
          {modal.children}
        </Modal>
      )}
    </ModalContext>
  );
};

export const useModal = () => {
  const context = use(ModalContext);

  if (context === undefined) {
    throw new Error('useModal must be used within ModalProvider');
  }

  return context;
};
