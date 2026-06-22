import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from '@heroui/react';
import { X, Trash2 } from 'lucide-react';

// Diálogo de confirmação genérico (substitui o confirm() do browser).
export default function ConfirmDialog({ open, message, tr, onCancel, onConfirm }) {
  return (
    <Modal isOpen={open} onClose={onCancel} placement="center" size="sm" backdrop="blur">
      <ModalContent>
        <ModalHeader>{tr.confirmTitle}</ModalHeader>
        <ModalBody>
          <p className="text-sm text-stone-600">{message}</p>
        </ModalBody>
        <ModalFooter>
          <Button variant="flat" onPress={onCancel} startContent={<X size={18} />}>
            {tr.cancel}
          </Button>
          <Button color="danger" onPress={onConfirm} startContent={<Trash2 size={18} />}>
            {tr.deleteBtn}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
