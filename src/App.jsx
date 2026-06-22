import { useEffect, useMemo, useState } from 'react';
import { Button, Spinner, useDisclosure, addToast } from '@heroui/react';
import { Plus } from 'lucide-react';
import { T } from './i18n';
import { expiryStatus } from './lib/date';
import { useItems, useCreateItem, useUpdateItem, useDeleteItem } from './hooks/useItems';
import {
  useLocals,
  useCreateLocal,
  useUpdateLocal,
  useDeleteLocal,
} from './hooks/useLocals';
import { useSession } from './lib/session';
import Header from './components/Header';
import LanguageToggle from './components/LanguageToggle';
import CasaSwitcher from './components/CasaSwitcher';
import AuthScreen from './components/AuthScreen';
import ItemCard from './components/ItemCard';
import ItemForm from './components/ItemForm';
import LocalsView from './components/LocalsView';
import LocalForm from './components/LocalForm';
import ConfirmDialog from './components/ConfirmDialog';

export default function App() {
  const [lang, setLang] = useState(() => localStorage.getItem('lang') || 'pt');
  const tr = T[lang];
  const [filter, setFilter] = useState('Todos');
  const [locationFilter, setLocationFilter] = useState('Todos');
  const [search, setSearch] = useState('');
  const form = useDisclosure();
  const [editing, setEditing] = useState(null); // item a editar (ou null = novo)
  const localsView = useDisclosure();
  const localForm = useDisclosure();
  const [editingLocal, setEditingLocal] = useState(null);
  const [localFromItem, setLocalFromItem] = useState(false); // local criado a partir do modal de item
  const [newLocalForItem, setNewLocalForItem] = useState(null); // id do local a auto-selecionar no item
  const [confirmState, setConfirmState] = useState(null); // { message, action } para o ConfirmDialog
  const { active } = useSession();

  const askConfirm = (message, action) => setConfirmState({ message, action });

  useEffect(() => {
    localStorage.setItem('lang', lang);
    document.documentElement.lang = lang;
  }, [lang]);

  const { data: items = [], isLoading, isError } = useItems();
  const createItem = useCreateItem();
  const updateItem = useUpdateItem();
  const deleteItem = useDeleteItem();

  const { data: locals = [] } = useLocals();
  const createLocal = useCreateLocal();
  const updateLocal = useUpdateLocal();
  const deleteLocal = useDeleteLocal();

  // Compartimentos (Locais) presentes nos itens da categoria selecionada.
  const locationChips = useMemo(() => {
    const usedIds = new Set();
    items.forEach((it) => {
      if ((filter === 'Todos' || it.category === filter) && it.localId) usedIds.add(it.localId);
    });
    return locals.filter((l) => usedIds.has(l._id)).map((l) => ({ id: l._id, name: l.name }));
  }, [items, locals, filter]);

  const visible = useMemo(
    () =>
      items.filter((it) => {
        const okCat = filter === 'Todos' || it.category === filter;
        const okLoc = locationFilter === 'Todos' || it.localId === locationFilter;
        const okSearch = it.name.toLowerCase().includes(search.toLowerCase());
        return okCat && okLoc && okSearch;
      }),
    [items, filter, locationFilter, search]
  );

  // Ao mudar de categoria, repõe o filtro de compartimento.
  function changeFilter(f) {
    setFilter(f);
    setLocationFilter('Todos');
  }

  const attention = useMemo(
    () =>
      items.filter((it) => {
        const ex = expiryStatus(it.expiryDate, tr);
        return it.quantity === 0 || (ex && ex.urgent);
      }).length,
    [items, tr]
  );

  const inc = (it) => updateItem.mutate({ id: it._id, data: { quantity: it.quantity + 1 } });
  const dec = (it) =>
    updateItem.mutate({ id: it._id, data: { quantity: Math.max(0, it.quantity - 1) } });
  const remove = (it) => {
    askConfirm(tr.confirmDelete, () =>
      deleteItem.mutate(it._id, {
        onSuccess: () => addToast({ title: tr.itemDeleted, color: 'success' }),
        onError: () => addToast({ title: tr.saveError, color: 'danger' }),
      })
    );
  };

  function openNew() {
    setEditing(null);
    form.onOpen();
  }
  function openEdit(it) {
    setEditing(it);
    form.onOpen();
  }
  async function handleSubmit(payload) {
    try {
      if (editing) await updateItem.mutateAsync({ id: editing._id, data: payload });
      else await createItem.mutateAsync(payload);
      form.onClose();
      setEditing(null);
      addToast({ title: tr.itemSaved, color: 'success' });
    } catch {
      addToast({ title: tr.saveError, color: 'danger' });
    }
  }

  function openNewLocal() {
    setEditingLocal(null);
    setLocalFromItem(false);
    localForm.onOpen();
  }
  function openEditLocal(l) {
    setEditingLocal(l);
    localForm.onOpen();
  }
  // Criar local a partir do modal de item (auto-seleciona-o no item depois).
  function openNewLocalFromItem() {
    setEditingLocal(null);
    setLocalFromItem(true);
    localForm.onOpen();
  }
  // Criar rapidamente um Local a partir de uma sugestão default e auto-selecioná-lo.
  async function quickLocalFromItem(name) {
    try {
      const created = await createLocal.mutateAsync({ name, cols: 2, rows: 2, capacity: null });
      if (created?._id) setNewLocalForItem(created._id);
      addToast({ title: tr.localSaved, color: 'success' });
    } catch {
      addToast({ title: tr.saveError, color: 'danger' });
    }
  }
  async function handleLocalSubmit(payload) {
    try {
      if (editingLocal) {
        await updateLocal.mutateAsync({ id: editingLocal._id, data: payload });
      } else {
        const created = await createLocal.mutateAsync(payload);
        if (localFromItem && created?._id) setNewLocalForItem(created._id);
      }
      localForm.onClose();
      setEditingLocal(null);
      setLocalFromItem(false);
      addToast({ title: tr.localSaved, color: 'success' });
    } catch {
      addToast({ title: tr.saveError, color: 'danger' });
    }
  }
  function removeLocal(l) {
    askConfirm(tr.deleteLocalConfirm, () =>
      deleteLocal.mutate(l._id, {
        onSuccess: () => addToast({ title: tr.localDeleted, color: 'success' }),
        onError: () => addToast({ title: tr.saveError, color: 'danger' }),
      })
    );
  }

  // Sem Casa ativa -> ecrã de login/criação.
  if (!active) {
    return <AuthScreen tr={tr} lang={lang} onLang={setLang} />;
  }

  return (
    <>
    <div className="min-h-screen w-full overflow-x-hidden bg-stone-100 text-stone-900">
      <Header
        tr={tr}
        lang={lang}
        attention={attention}
        search={search}
        onSearch={setSearch}
        filter={filter}
        onFilter={changeFilter}
        locations={locationChips}
        locationFilter={locationFilter}
        onLocationFilter={setLocationFilter}
        onOpenLocals={localsView.onOpen}
        rightSlot={
          <div className="flex items-center gap-2">
            <CasaSwitcher tr={tr} />
            <LanguageToggle lang={lang} onChange={setLang} />
          </div>
        }
      />

      <main className="w-full px-4 pb-28 pt-4">
        {isError && (
          <p className="mb-3 rounded-md bg-danger-50 px-4 py-2.5 text-sm text-danger">
            {tr.loadError}
          </p>
        )}

        {isLoading ? (
          <div className="mt-10 flex justify-center">
            <Spinner label={tr.loading} color="primary" />
          </div>
        ) : visible.length === 0 ? (
          <p className="mt-10 text-center text-stone-500">{tr.empty}</p>
        ) : (
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {visible.map((it) => (
              <li key={it._id}>
                <ItemCard
                  item={it}
                  tr={tr}
                  locals={locals}
                  onInc={inc}
                  onDec={dec}
                  onDelete={remove}
                  onEdit={openEdit}
                />
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>

      {/* Fixo ao viewport (fora do contentor com overflow), sempre no canto
          inferior direito em qualquer ecrã e ao fazer scroll. */}
      <Button
        color="primary"
        radius="md"
        size="lg"
        aria-label={tr.addItem}
        onPress={openNew}
        startContent={<Plus size={22} />}
        className="fixed bottom-[max(env(safe-area-inset-bottom),1.25rem)] right-5 z-50 h-14 px-6 font-semibold shadow-lg shadow-primary/40"
      >
        {tr.addItem}
      </Button>

      <ItemForm
        isOpen={form.isOpen}
        onClose={() => {
          form.onClose();
          setEditing(null);
        }}
        onSubmit={handleSubmit}
        saving={createItem.isPending || updateItem.isPending}
        tr={tr}
        lang={lang}
        item={editing}
        locals={locals}
        onAddLocal={openNewLocalFromItem}
        onQuickLocal={quickLocalFromItem}
        selectLocalId={newLocalForItem}
        onSelectConsumed={() => setNewLocalForItem(null)}
      />

      <LocalsView
        isOpen={localsView.isOpen}
        onClose={localsView.onClose}
        locals={locals}
        items={items}
        tr={tr}
        onNew={openNewLocal}
        onEdit={openEditLocal}
        onDelete={removeLocal}
      />

      <LocalForm
        isOpen={localForm.isOpen}
        onClose={() => {
          localForm.onClose();
          setEditingLocal(null);
        }}
        onSubmit={handleLocalSubmit}
        saving={createLocal.isPending || updateLocal.isPending}
        tr={tr}
        local={editingLocal}
      />

      <ConfirmDialog
        open={!!confirmState}
        message={confirmState?.message}
        tr={tr}
        onCancel={() => setConfirmState(null)}
        onConfirm={() => {
          confirmState?.action?.();
          setConfirmState(null);
        }}
      />
    </>
  );
}
