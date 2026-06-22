import { useEffect, useRef, useState } from 'react';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  Textarea,
  Select,
  SelectItem,
  Autocomplete,
  AutocompleteItem,
  DatePicker,
  Button,
} from '@heroui/react';
import { CalendarDate } from '@internationalized/date';
import { Camera, X, Check, Sparkles, Image as ImageIcon, ScanBarcode } from 'lucide-react';
import { CATEGORY_KEYS, CATEGORY_LABELS, LOCATION_SUGGESTIONS } from '../i18n';
import { EMPTY_FORM } from '../constants';
import { fileToResizedBase64 } from '../lib/image';
import { decodeBarcodeFromFile, lookupBarcode } from '../lib/barcode';
import { useRecognize } from '../hooks/useRecognize';

// Conversão entre a string dd/mm/yyyy (guardada na BD) e o CalendarDate do DatePicker.
function dmyToDate(s) {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(s || '');
  if (!m) return null;
  try {
    return new CalendarDate(Number(m[3]), Number(m[2]), Number(m[1]));
  } catch {
    return null;
  }
}
function dateToDmy(d) {
  if (!d) return '';
  const p = (n) => String(n).padStart(2, '0');
  return `${p(d.day)}/${p(d.month)}/${d.year}`;
}

// Converte um item existente (edição) para o estado do formulário.
function itemToForm(item) {
  return {
    name: item.name || '',
    category: item.category || 'Cozinha',
    location: item.location || '',
    quantity: String(item.quantity ?? '1'),
    unit: item.unit || 'un',
    packSize: item.packSize == null ? '' : String(item.packSize),
    packUnit: item.packUnit || '',
    brand: item.brand || '',
    price: item.price == null ? '' : String(item.price),
    expiryDate: item.expiryDate || '',
    note: item.note || '',
    barcode: item.barcode || '',
    image: item.image || '',
  };
}

export default function ItemForm({ isOpen, onClose, onSubmit, saving, tr, lang, item }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [photoErr, setPhotoErr] = useState('');
  const [capture, setCapture] = useState(null); // { image, mediaType } para a IA
  const [choosing, setChoosing] = useState(false); // mostra a escolha após tirar foto
  const [barcodeErr, setBarcodeErr] = useState('');
  const [scanning, setScanning] = useState(false);
  const fileRef = useRef(null);
  const barcodeRef = useRef(null);
  const recognize = useRecognize();
  const isEdit = Boolean(item);

  // Repõe o formulário sempre que o modal abre (vazio, ou com o item a editar).
  useEffect(() => {
    if (isOpen) {
      setForm(item ? itemToForm(item) : EMPTY_FORM);
      setPhotoErr('');
      setCapture(null);
      setChoosing(false);
      setBarcodeErr('');
      setScanning(false);
    }
  }, [isOpen, item]);

  const setField = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  async function onPhoto(e) {
    const file = e.target.files?.[0];
    e.target.value = ''; // permite escolher a mesma foto outra vez
    if (!file) return;
    setPhotoErr('');
    try {
      const { image, mediaType } = await fileToResizedBase64(file);
      // Guarda já a imagem no item; a escolha decide se também corre a IA.
      setField('image', `data:${mediaType};base64,${image}`);
      setCapture({ image, mediaType });
      setChoosing(true);
    } catch {
      setPhotoErr(tr.photoError);
    }
  }

  // Opção 1: usar a foto para preencher os campos (Claude visão).
  async function useForFields() {
    if (!capture) return;
    try {
      const data = await recognize.mutateAsync(capture);
      setForm((f) => ({
        ...f,
        name: data.name || f.name,
        brand: data.brand || f.brand,
        category: data.category || f.category,
        location: data.location || f.location,
        unit: data.unit || f.unit,
        expiryDate: data.expiryDate || f.expiryDate,
        note: data.note || f.note,
      }));
    } catch {
      setPhotoErr(tr.photoError);
    } finally {
      setChoosing(false);
    }
  }

  // Opção 2: guardar só a imagem (não corre a IA).
  function saveOnly() {
    setChoosing(false);
  }

  function removePhoto() {
    setField('image', '');
    setCapture(null);
    setChoosing(false);
  }

  // Lê o código de barras a partir de uma foto e procura o produto no Open Food Facts.
  async function onBarcode(e) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setBarcodeErr('');
    setScanning(true);
    try {
      const code = await decodeBarcodeFromFile(file);
      // Guarda já o código no item, mesmo que o produto não exista na base.
      setField('barcode', code);
      const p = await lookupBarcode(code);
      if (!p || !p.name) {
        setBarcodeErr(tr.barcodeNotFound);
        return;
      }
      setForm((f) => ({
        ...f,
        name: p.name || f.name,
        brand: p.brand || f.brand,
        // O tamanho da embalagem (ex: "500 g") vai para as notas, se vazias.
        note: f.note || p.packageSize || '',
        image: f.image || p.image || '',
      }));
    } catch {
      // ZXing lança se não encontrar código legível na foto.
      setBarcodeErr(tr.barcodeUnreadable);
    } finally {
      setScanning(false);
    }
  }

  const suggestions = LOCATION_SUGGESTIONS[lang][form.category] || [];

  function submit(e) {
    e.preventDefault();
    if (!form.name.trim()) return;
    onSubmit({
      name: form.name.trim(),
      category: form.category,
      location: form.location.trim(),
      quantity: form.quantity === '' ? 0 : Number(form.quantity),
      unit: form.unit.trim() || 'un',
      packSize: form.packSize === '' ? null : Number(form.packSize),
      packUnit: form.packUnit.trim(),
      brand: form.brand.trim(),
      price: form.price === '' ? null : Number(form.price),
      expiryDate: form.expiryDate,
      note: form.note.trim(),
      barcode: form.barcode.trim(),
      image: form.image,
    });
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      placement="center"
      scrollBehavior="inside"
      backdrop="blur"
    >
      <ModalContent as="form" onSubmit={submit}>
        {(close) => (
          <>
            <ModalHeader>{isEdit ? tr.editItem : tr.newItem}</ModalHeader>
            <ModalBody className="gap-3">
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={onPhoto}
              />
              <input
                ref={barcodeRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={onBarcode}
              />

              {form.image ? (
                <div className="relative shrink-0">
                  <img
                    src={form.image}
                    alt=""
                    className="h-40 w-full rounded-md object-cover"
                  />
                  <Button
                    isIconOnly
                    size="sm"
                    color="danger"
                    variant="solid"
                    className="absolute right-2 top-2"
                    aria-label={tr.removePhoto}
                    onPress={removePhoto}
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
                  {tr.photoButton}
                </Button>
              )}

              <Button
                fullWidth
                variant="bordered"
                className="h-12 shrink-0"
                isLoading={scanning}
                startContent={!scanning && <ScanBarcode size={18} />}
                onPress={() => barcodeRef.current?.click()}
              >
                {scanning ? tr.scanningBarcode : tr.scanBarcode}
              </Button>
              {barcodeErr && (
                <p className="text-center text-sm text-danger">{barcodeErr}</p>
              )}

              {choosing && (
                <div className="flex shrink-0 flex-col gap-2 rounded-md bg-default-100 p-3">
                  <p className="text-center text-sm font-medium">{tr.photoChoiceTitle}</p>
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <Button
                      fullWidth
                      color="primary"
                      variant="flat"
                      isLoading={recognize.isPending}
                      startContent={!recognize.isPending && <Sparkles size={16} />}
                      onPress={useForFields}
                    >
                      {tr.photoUseAI}
                    </Button>
                    <Button
                      fullWidth
                      variant="flat"
                      startContent={<ImageIcon size={16} />}
                      onPress={saveOnly}
                    >
                      {tr.photoSaveOnly}
                    </Button>
                  </div>
                </div>
              )}

              {photoErr && <p className="text-center text-sm text-danger">{photoErr}</p>}
              {!isEdit && (
                <p className="text-center text-xs text-stone-400">{tr.photoHint}</p>
              )}

              <Input
                autoFocus
                isRequired
                variant="bordered"
                label={tr.name}
                placeholder={tr.namePlaceholder}
                value={form.name}
                onValueChange={(v) => setField('name', v)}
              />

              <Select
                variant="bordered"
                label={tr.category}
                selectedKeys={[form.category]}
                onSelectionChange={(keys) => {
                  const v = Array.from(keys)[0];
                  if (v) setForm((f) => ({ ...f, category: v, location: '' }));
                }}
              >
                {CATEGORY_KEYS.map((c) => (
                  <SelectItem key={c}>{CATEGORY_LABELS[lang][c]}</SelectItem>
                ))}
              </Select>

              <Autocomplete
                variant="bordered"
                label={tr.location}
                placeholder={tr.locationPlaceholder}
                allowsCustomValue
                inputValue={form.location}
                onInputChange={(v) => setField('location', v)}
                items={suggestions.map((s) => ({ key: s, label: s }))}
              >
                {(s) => <AutocompleteItem key={s.key}>{s.label}</AutocompleteItem>}
              </Autocomplete>

              <div className="flex gap-3">
                <Input
                  variant="bordered"
                  label={tr.quantity}
                  inputMode="numeric"
                  placeholder="0"
                  value={form.quantity}
                  onValueChange={(v) => setField('quantity', v.replace(/[^\d]/g, ''))}
                />
                <Input
                  variant="bordered"
                  label={tr.unit}
                  placeholder={tr.unitPlaceholder}
                  value={form.unit}
                  onValueChange={(v) => setField('unit', v)}
                />
              </div>

              <div className="flex gap-3">
                <Input
                  variant="bordered"
                  label={tr.packSize}
                  inputMode="decimal"
                  placeholder="0"
                  value={form.packSize}
                  onValueChange={(v) =>
                    setField('packSize', v.replace(/[^\d.,]/g, '').replace(',', '.'))
                  }
                />
                <Input
                  variant="bordered"
                  label={tr.unit}
                  placeholder={tr.packUnitPlaceholder}
                  value={form.packUnit}
                  onValueChange={(v) => setField('packUnit', v)}
                />
              </div>

              <div className="flex gap-3">
                <Input
                  variant="bordered"
                  label={tr.brand}
                  placeholder={tr.brandPlaceholder}
                  value={form.brand}
                  onValueChange={(v) => setField('brand', v)}
                />
                <Input
                  variant="bordered"
                  label={tr.price}
                  inputMode="decimal"
                  placeholder="0.00"
                  value={form.price}
                  onValueChange={(v) =>
                    setField('price', v.replace(/[^\d.,]/g, '').replace(',', '.'))
                  }
                />
              </div>

              <DatePicker
                variant="bordered"
                label={tr.expiryDate}
                value={dmyToDate(form.expiryDate)}
                onChange={(d) => setField('expiryDate', dateToDmy(d))}
              />

              <Textarea
                variant="bordered"
                label={tr.notes}
                placeholder={tr.notesPlaceholder}
                minRows={2}
                value={form.note}
                onValueChange={(v) => setField('note', v)}
              />

              <Input
                variant="bordered"
                label={tr.barcodeField}
                inputMode="numeric"
                placeholder="—"
                value={form.barcode}
                onValueChange={(v) => setField('barcode', v.replace(/[^\dXx]/g, ''))}
                startContent={<ScanBarcode size={16} className="shrink-0 text-stone-400" />}
              />
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
