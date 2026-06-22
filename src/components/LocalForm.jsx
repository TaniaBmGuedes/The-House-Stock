import { useEffect, useRef, useState } from 'react';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  Button,
} from '@heroui/react';
import { Camera, X, Check } from 'lucide-react';
import { fileToResizedBase64 } from '../lib/image';

const EMPTY = { name: '', capacity: '', cols: '2', rows: '2', photo: '' };

function localToForm(l) {
  return {
    name: l.name || '',
    capacity: l.capacity == null ? '' : String(l.capacity),
    cols: String(l.cols ?? 2),
    rows: String(l.rows ?? 2),
    photo: l.photo || '',
  };
}

export default function LocalForm({ isOpen, onClose, onSubmit, saving, tr, local }) {
  const [form, setForm] = useState(EMPTY);
  const fileRef = useRef(null);
  const isEdit = Boolean(local);

  useEffect(() => {
    if (isOpen) setForm(local ? localToForm(local) : EMPTY);
  }, [isOpen, local]);

  const setField = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  async function onPhoto(e) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      const { image, mediaType } = await fileToResizedBase64(file);
      setField('photo', `data:${mediaType};base64,${image}`);
    } catch {
      /* ignora */
    }
  }

  function submit(e) {
    e.preventDefault();
    if (!form.name.trim()) return;
    onSubmit({
      name: form.name.trim(),
      capacity: form.capacity === '' ? null : Number(form.capacity),
      cols: Number(form.cols) || 2,
      rows: Number(form.rows) || 2,
      photo: form.photo,
    });
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} placement="center" scrollBehavior="inside" backdrop="blur">
      <ModalContent as="form" onSubmit={submit}>
        {(close) => (
          <>
            <ModalHeader>{isEdit ? tr.editLocal : tr.newLocal}</ModalHeader>
            <ModalBody className="gap-3">
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={onPhoto}
              />
              {form.photo ? (
                <div className="relative shrink-0">
                  <img src={form.photo} alt="" className="h-40 w-full rounded-md object-cover" />
                  <Button
                    isIconOnly
                    size="sm"
                    color="danger"
                    variant="solid"
                    className="absolute right-2 top-2"
                    aria-label={tr.removePhoto}
                    onPress={() => setField('photo', '')}
                  >
                    <X size={16} />
                  </Button>
                </div>
              ) : (
                <Button
                  fullWidth
                  variant="bordered"
                  color="primary"
                  className="h-12 shrink-0"
                  startContent={<Camera size={18} />}
                  onPress={() => fileRef.current?.click()}
                >
                  {tr.localPhoto}
                </Button>
              )}

              <Input
                autoFocus
                isRequired
                variant="bordered"
                label={tr.localName}
                placeholder={tr.localNamePlaceholder}
                value={form.name}
                onValueChange={(v) => setField('name', v)}
              />
              <Input
                variant="bordered"
                label={tr.capacity}
                inputMode="decimal"
                placeholder="0"
                value={form.capacity}
                onValueChange={(v) =>
                  setField('capacity', v.replace(/[^\d.,]/g, '').replace(',', '.'))
                }
              />
              <div className="flex gap-3">
                <Input
                  variant="bordered"
                  label={tr.gridCols}
                  inputMode="numeric"
                  value={form.cols}
                  onValueChange={(v) => setField('cols', v.replace(/[^\d]/g, '').slice(0, 1))}
                />
                <Input
                  variant="bordered"
                  label={tr.gridRows}
                  inputMode="numeric"
                  value={form.rows}
                  onValueChange={(v) => setField('rows', v.replace(/[^\d]/g, '').slice(0, 1))}
                />
              </div>
            </ModalBody>
            <ModalFooter>
              <Button variant="flat" onPress={close} startContent={<X size={18} />}>
                {tr.cancel}
              </Button>
              <Button
                color="primary"
                type="submit"
                isLoading={saving}
                startContent={!saving && <Check size={18} />}
              >
                {saving ? tr.saving : isEdit ? tr.save : tr.add}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
