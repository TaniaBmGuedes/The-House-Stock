import { Card, CardBody, ButtonGroup, Button } from '@heroui/react';
import { LANGS } from '../i18n';
import AuthForm from './AuthForm';

export default function AuthScreen({ tr, lang, onLang }) {
  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-gradient-to-br from-teal-700 via-teal-600 to-emerald-500 p-4">
      {/* Brilhos decorativos */}
      <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-emerald-300/20 blur-3xl" />

      <div className="relative z-10 w-full max-w-sm">
        {/* Seletor de idioma */}
        <div className="mb-5 flex justify-center">
          <ButtonGroup size="sm" radius="md" variant="flat">
            {LANGS.map((l) => (
              <Button
                key={l}
                onPress={() => onLang(l)}
                className={
                  lang === l
                    ? 'bg-white font-bold uppercase text-teal-800'
                    : 'bg-white/20 uppercase text-white'
                }
              >
                {l}
              </Button>
            ))}
          </ButtonGroup>
        </div>

        {/* Marca */}
        <div className="mb-6 flex flex-col items-center gap-3 text-center text-white">
          <img
            src="/icon.png"
            alt=""
            className="h-20 w-20 rounded-md shadow-lg ring-1 ring-white/40"
          />
          <div>
            <h1 className="text-3xl font-bold tracking-tight drop-shadow-sm">{tr.appName}</h1>
            <p className="mt-1 text-sm text-white/80">{tr.welcome}</p>
          </div>
        </div>

        {/* Cartão */}
        <Card className="border border-white/40 shadow-2xl" radius="md">
          <CardBody className="gap-5 p-6 sm:p-7">
            <AuthForm tr={tr} />
          </CardBody>
        </Card>

        <p className="mt-5 text-center text-xs text-white/70">
          🔒 {tr.welcome}
        </p>
      </div>
    </div>
  );
}
