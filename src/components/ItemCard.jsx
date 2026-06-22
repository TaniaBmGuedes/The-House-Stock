import { Card, CardBody, Button, Chip } from '@heroui/react';
import { Trash2, Plus, Minus, MapPin, Pencil } from 'lucide-react';
import { CATEGORY_ICON } from '../constants';
import { expiryStatus } from '../lib/date';

export default function ItemCard({ item, tr, onInc, onDec, onDelete, onEdit }) {
  const Icon = CATEGORY_ICON[item.category];
  const ex = expiryStatus(item.expiryDate, tr);
  const out = item.quantity === 0;
  const hasPack = item.packSize != null && item.packSize !== '';
  const fmt = (n) => Number(n).toLocaleString('pt-PT', { maximumFractionDigits: 2 });
  const total = hasPack ? `${fmt(item.quantity * item.packSize)} ${item.packUnit}`.trim() : '';
  const perUnit = hasPack ? `${fmt(item.packSize)} ${item.packUnit}`.trim() : '';

  return (
    <Card shadow="sm" className={out ? 'border-2 border-danger-200 bg-danger-50' : ''}>
      <CardBody className="gap-2">
        {item.image && (
          <img
            src={item.image}
            alt={item.name}
            className="h-32 w-full rounded-md object-cover"
          />
        )}
        <div className="flex items-start justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <span className="text-primary">{Icon && <Icon size={22} />}</span>
            <div className="min-w-0">
              <p className="truncate font-semibold">{item.name}</p>
              {item.brand && (
                <p className="truncate text-xs text-stone-500">{item.brand}</p>
              )}
            </div>
          </div>
          <div className="flex shrink-0 items-center">
            <Button
              isIconOnly
              size="sm"
              variant="light"
              aria-label={tr.edit}
              onPress={() => onEdit(item)}
            >
              <Pencil size={17} />
            </Button>
            <Button
              isIconOnly
              size="sm"
              variant="light"
              color="danger"
              aria-label={tr.confirmDelete}
              onPress={() => onDelete(item)}
            >
              <Trash2 size={18} />
            </Button>
          </div>
        </div>

        {item.location && (
          <p className="flex items-center gap-1 text-xs text-stone-500">
            <MapPin size={13} /> {item.location}
          </p>
        )}

        {item.note && <p className="truncate text-xs text-stone-500">{item.note}</p>}

        <div className="flex items-center justify-between gap-2">
          <div className="flex flex-wrap gap-1.5">
            {item.price != null && (
              <Chip size="sm" variant="flat" color="primary">
                {Number(item.price).toFixed(2)} €
              </Chip>
            )}
            {hasPack && (
              <Chip size="sm" variant="flat" color="secondary">
                {item.quantity} × {perUnit} = {total}
              </Chip>
            )}
            {ex && (
              <Chip size="sm" variant="flat" color={ex.color}>
                {ex.label}
              </Chip>
            )}
            {out && (
              <Chip size="sm" variant="flat" color="danger">
                {tr.outOfStock}
              </Chip>
            )}
          </div>

          <div className="flex shrink-0 items-center gap-1.5">
            <Button
              isIconOnly
              size="sm"
              variant="bordered"
              aria-label="−"
              onPress={() => onDec(item)}
            >
              <Minus size={16} />
            </Button>
            <span className="flex min-w-[3rem] flex-col items-center leading-tight">
              <span className="font-bold">{item.quantity}</span>
              <span className="text-[0.65rem] text-stone-400">{item.unit}</span>
            </span>
            <Button
              isIconOnly
              size="sm"
              variant="bordered"
              aria-label="+"
              onPress={() => onInc(item)}
            >
              <Plus size={16} />
            </Button>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
