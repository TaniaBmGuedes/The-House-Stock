import { Input, Tabs, Tab, Chip, Button } from '@heroui/react';
import { Search, Grid2x2, Boxes } from 'lucide-react';
import { CATEGORY_KEYS, CATEGORY_LABELS } from '../i18n';
import { CATEGORY_ICON } from '../constants';

export default function Header({
  tr,
  lang,
  attention,
  search,
  onSearch,
  filter,
  onFilter,
  locations = [],
  locationFilter,
  onLocationFilter,
  onOpenLocals,
  rightSlot,
}) {
  return (
    <header className="sticky top-0 z-20 w-full shadow-md">
      {/* Barra principal */}
      <div className="flex flex-col gap-2.5 bg-primary px-4 pb-3 pt-[max(env(safe-area-inset-top),0.875rem)] text-white sm:flex-row sm:items-center sm:justify-between sm:gap-3">
        {/* Título. No telemóvel fica na 1.ª linha; no desktop, à esquerda. */}
        <h1 className="flex items-center gap-2 text-xl font-bold">
          <img src="/icon.png" alt="" className="h-8 w-8 rounded-md object-cover" />
          {tr.appName}
        </h1>
        {/* Casa ativa + idioma. No telemóvel 2.ª linha; no desktop, à direita. */}
        <div className="flex min-w-0 items-center gap-2">
          {attention > 0 && (
            <Chip color="danger" variant="solid" size="sm" className="shrink-0 font-bold">
              {tr.toHandle(attention)}
            </Chip>
          )}
          {rightSlot}
        </div>
      </div>

      {/* Pesquisa + filtros */}
      <div className="flex min-w-0 flex-col gap-2 border-b border-stone-200 bg-white px-4 py-2.5">
        <div className="flex items-stretch gap-2">
          <Input
            aria-label={tr.searchPlaceholder}
            placeholder={tr.searchPlaceholder}
            value={search}
            onValueChange={onSearch}
            isClearable
            onClear={() => onSearch('')}
            startContent={<Search size={18} className="text-stone-400" />}
            variant="bordered"
            radius="md"
            fullWidth
            className="w-full"
          />
          <Button
            isIconOnly
            variant="bordered"
            radius="md"
            className="h-auto shrink-0"
            aria-label={tr.manageLocals}
            onPress={onOpenLocals}
          >
            <Boxes size={20} />
          </Button>
        </div>

        <Tabs
          aria-label="Categorias"
          selectedKey={filter}
          onSelectionChange={(k) => onFilter(String(k))}
          color="primary"
          variant="solid"
          radius="md"
          classNames={{ base: 'w-full max-w-full', tabList: 'overflow-x-auto flex-nowrap' }}
        >
          <Tab
            key="Todos"
            title={
              <span className="flex items-center gap-1.5">
                <Grid2x2 size={16} />
                {tr.all}
              </span>
            }
          />
          {CATEGORY_KEYS.map((c) => {
            const Icon = CATEGORY_ICON[c];
            return (
              <Tab
                key={c}
                title={
                  <span className="flex items-center gap-1.5">
                    <Icon size={16} />
                    {CATEGORY_LABELS[lang][c]}
                  </span>
                }
              />
            );
          })}
        </Tabs>

        {locations.length > 0 && (
          <div className="-mb-0.5 flex gap-1.5 overflow-x-auto pb-0.5">
            <Chip
              variant={locationFilter === 'Todos' ? 'solid' : 'bordered'}
              color={locationFilter === 'Todos' ? 'primary' : 'default'}
              className="shrink-0 cursor-pointer"
              onClick={() => onLocationFilter('Todos')}
            >
              {tr.all}
            </Chip>
            {locations.map((loc) => (
              <Chip
                key={loc.id}
                variant={locationFilter === loc.id ? 'solid' : 'bordered'}
                color={locationFilter === loc.id ? 'primary' : 'default'}
                className="shrink-0 cursor-pointer"
                onClick={() => onLocationFilter(loc.id)}
              >
                {loc.name}
              </Chip>
            ))}
          </div>
        )}
      </div>
    </header>
  );
}
