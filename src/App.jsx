import { useEffect, useMemo, useState } from 'react';
import { Button, Spinner, useDisclosure } from '@heroui/react';
import { Plus } from 'lucide-react';
import { T } from './i18n';
import { expiryStatus } from './lib/date';
import { useItems, useCreateItem, useUpdateItem, useDeleteItem } from './hooks/useItems';
import { useSession } from './lib/session';
import Header from './components/Header';
import LanguageToggle from './components/LanguageToggle';
import CasaSwitcher from './components/CasaSwitcher';
import AuthScreen from './components/AuthScreen';
import ItemCard from './components/ItemCard';
import ItemForm from './components/ItemForm';

export default function App() {
  const [lang, setLang] = useState(() => localStorage.getItem('lang') || 'pt');
  const tr = T[lang];
  const [filter, setFilter] = useState('Todos');
  const [search, setSearch] = useState('');
  const form = useDisclosure();
  const [editing, setEditing] = useState(null); // item a editar (ou null = novo)
  const { active } = useSession();

  useEffect(() => {
    localStorage.setItem('lang', lang);
    document.documentElement.lang = lang;
  }, [lang]);

  const { data: items = [], isLoading, isError } = useItems();
  const createItem = useCreateItem();
  const updateItem = useUpdateItem();
  const deleteItem = useDeleteItem();

  const visible = useMemo(
    () =>
      items.filter((it) => {
        const okCat = filter === 'Todos' || it.category === filter;
        const okSearch = it.name.toLowerCase().includes(search.toLowerCase());
        return okCat && okSearch;
      }),
    [items, filter, search]
  );

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
    if (confirm(tr.confirmDelete)) deleteItem.mutate(it._id);
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
    if (editing) await updateItem.mutateAsync({ id: editing._id, data: payload });
    else await createItem.mutateAsync(payload);
    form.onClose();
    setEditing(null);
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
        onFilter={setFilter}
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
      />
    </>
  );
}
