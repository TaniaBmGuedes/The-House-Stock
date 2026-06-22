import { useState } from 'react';
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
} from '@heroui/react';
import { Home, ChevronDown, Plus, LogOut, Check } from 'lucide-react';
import { useSession } from '../lib/session';
import AuthForm from './AuthForm';

export default function CasaSwitcher({ tr }) {
  const { casas, active, switchCasa, logout } = useSession();
  const [addOpen, setAddOpen] = useState(false);

  function onAction(key) {
    const k = String(key);
    if (k === '__add') return setAddOpen(true);
    if (k === '__logout') return logout(active.id);
    switchCasa(k);
  }

  return (
    <>
      <Dropdown placement="bottom-end">
        <DropdownTrigger>
          <Button
            size="sm"
            variant="flat"
            className="max-w-[9rem] bg-white/15 text-white"
            startContent={<Home size={16} />}
            endContent={<ChevronDown size={16} />}
          >
            <span className="truncate">{active?.name}</span>
          </Button>
        </DropdownTrigger>
        <DropdownMenu aria-label={tr.switchCasa} onAction={onAction}>
          {[
            ...casas.map((c, i) => (
              <DropdownItem
                key={c.id}
                showDivider={i === casas.length - 1}
                startContent={
                  c.id === active?.id ? <Check size={16} /> : <span className="w-4" />
                }
              >
                {c.name}
              </DropdownItem>
            )),
            <DropdownItem key="__add" startContent={<Plus size={16} />}>
              {tr.addCasa}
            </DropdownItem>,
            <DropdownItem
              key="__logout"
              className="text-danger"
              color="danger"
              startContent={<LogOut size={16} />}
            >
              {tr.logout}
            </DropdownItem>,
          ]}
        </DropdownMenu>
      </Dropdown>

      <Modal
        isOpen={addOpen}
        onClose={() => setAddOpen(false)}
        placement="center"
        scrollBehavior="inside"
        backdrop="blur"
      >
        <ModalContent>
          <ModalHeader>{tr.addCasa}</ModalHeader>
          <ModalBody className="pb-6">
            <AuthForm tr={tr} onDone={() => setAddOpen(false)} />
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}
