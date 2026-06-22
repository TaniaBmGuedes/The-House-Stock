import { useState } from 'react';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Progress,
  Chip,
  Input,
} from '@heroui/react';
import { Plus, Pencil, Trash2, Package, Search } from 'lucide-react';

const fmt = (n) => Number(n).toLocaleString('pt-PT', { maximumFractionDigits: 2 });

function LocalCard({ local, items, tr, onEdit, onDelete }) {
  const mine = items.filter((it) => it.localId === local._id);
  const used = mine.reduce((s, it) => s + (Number(it.volume) || 0) * (it.quantity || 0), 0);
  const cells = local.cols * local.rows;
  const ratio = local.capacity ? Math.min(1, used / local.capacity) : 0;
  const over = local.capacity && used > local.capacity;

  return (
    <div className="rounded-md border border-stone-200 p-3">
      <div className="flex items-start gap-3">
        {local.photo ? (
          <img src={local.photo} alt="" className="h-14 w-14 shrink-0 rounded-md object-cover" />
        ) : (
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-md bg-stone-100 text-stone-400">
            <Package size={22} />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold">{local.name}</p>
          {local.capacity ? (
            <>
              <Progress
                aria-label="ocupação"
                size="sm"
                color={over ? 'danger' : 'primary'}
                value={ratio * 100}
                className="mt-1"
              />
              <p className="mt-0.5 text-xs text-stone-500">
                {tr.occupancy(fmt(used), fmt(local.capacity))}
              </p>
            </>
          ) : (
            <p className="mt-1 text-xs text-stone-500">{tr.used(fmt(used))}</p>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <Button
            size="sm"
            variant="light"
            startContent={<Pencil size={15} />}
            onPress={() => onEdit(local)}
          >
            {tr.edit}
          </Button>
          <Button
            size="sm"
            variant="light"
            color="danger"
            startContent={<Trash2 size={15} />}
            onPress={() => onDelete(local)}
          >
            {tr.deleteBtn}
          </Button>
        </div>
      </div>

      {/* Grelha de posições */}
      <div
        className="mt-3 grid gap-1.5"
        style={{ gridTemplateColumns: `repeat(${local.cols}, minmax(0, 1fr))` }}
      >
        {Array.from({ length: cells }, (_, i) => {
          const here = mine.filter((it) => it.cell === i);
          return (
            <div
              key={i}
              className="min-h-[3rem] rounded-md border border-dashed border-stone-200 bg-stone-50 p-1.5 text-[0.7rem] leading-tight text-stone-600"
            >
              {here.map((it) => (
                <div key={it._id} className="flex items-center gap-1">
                  {it.image && (
                    <img
                      src={it.image}
                      alt=""
                      className="h-6 w-6 shrink-0 rounded-md object-cover"
                    />
                  )}
                  <span className="truncate">
                    {it.name}
                    {it.quantity > 1 ? ` ×${it.quantity}` : ''}
                  </span>
                </div>
              ))}
            </div>
          );
        })}
      </div>

      {/* Sem posição */}
      {mine.some((it) => it.cell == null) && (
        <div className="mt-2 flex flex-wrap gap-1">
          {mine
            .filter((it) => it.cell == null)
            .map((it) => (
              <Chip key={it._id} size="sm" variant="flat">
                {it.name}
              </Chip>
            ))}
        </div>
      )}
    </div>
  );
}

export default function LocalsView({ isOpen, onClose, locals, items, tr, onNew, onEdit, onDelete }) {
  const [q, setQ] = useState('');
  const ql = q.trim().toLowerCase();
  const shown = ql
    ? locals.filter(
        (l) =>
          l.name.toLowerCase().includes(ql) ||
          items.some((it) => it.localId === l._id && it.name.toLowerCase().includes(ql))
      )
    : locals;

  return (
    <Modal isOpen={isOpen} onClose={onClose} placement="center" scrollBehavior="inside" backdrop="blur" size="lg">
      <ModalContent>
        <ModalHeader>{tr.localsTitle}</ModalHeader>
        <ModalBody className="gap-3">
          {locals.length > 0 && (
            <Input
              aria-label={tr.searchLocalPlaceholder}
              placeholder={tr.searchLocalPlaceholder}
              value={q}
              onValueChange={setQ}
              isClearable
              onClear={() => setQ('')}
              startContent={<Search size={18} className="text-stone-400" />}
              variant="bordered"
              radius="md"
            />
          )}
          {locals.length === 0 ? (
            <p className="py-6 text-center text-stone-500">{tr.noLocals}</p>
          ) : shown.length === 0 ? (
            <p className="py-6 text-center text-stone-500">{tr.noLocalsFound}</p>
          ) : (
            shown.map((l) => (
              <LocalCard
                key={l._id}
                local={l}
                items={items}
                tr={tr}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))
          )}
        </ModalBody>
        <ModalFooter>
          <Button color="primary" onPress={onNew} startContent={<Plus size={18} />}>
            {tr.newLocal}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
