import { useState } from 'react';
import { Input, Button, Tabs, Tab } from '@heroui/react';
import { Home, Lock, Mail, Eye, EyeOff, LogIn, UserPlus, RefreshCw } from 'lucide-react';
import { useSession } from '../lib/session';
import { useLoginCasa, useRegisterCasa } from '../hooks/useAuth';

export default function AuthForm({ tr, onDone }) {
  const { addCasa } = useSession();
  const [mode, setMode] = useState('login'); // 'login' | 'create'
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');

  const login = useLoginCasa();
  const register = useRegisterCasa();
  const pending = login.isPending || register.isPending;

  async function submit(e) {
    e.preventDefault();
    setError('');
    try {
      const res =
        mode === 'login'
          ? await login.mutateAsync({ name, password })
          : await register.mutateAsync({ name, password, email });
      addCasa({ id: res.casa.id, name: res.casa.name, token: res.token });
      onDone?.();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <Tabs
        fullWidth
        color="primary"
        radius="md"
        selectedKey={mode}
        onSelectionChange={(k) => {
          setMode(String(k));
          setError('');
        }}
      >
        <Tab key="login" title={tr.login} />
        <Tab key="create" title={tr.create} />
      </Tabs>

      <Input
        isRequired
        label={tr.casaName}
        placeholder={tr.casaNamePlaceholder}
        description={mode === 'create' ? tr.casaNameHint : undefined}
        value={name}
        // Sem espaços: espaços viram _, e qualquer caráter inválido é removido.
        onValueChange={(v) =>
          setName(v.replace(/\s+/g, '_').replace(/[^A-Za-z0-9_]/g, ''))
        }
        variant="bordered"
        autoComplete="organization"
        labelPlacement="outside"
        startContent={<Home size={18} className="shrink-0 text-stone-400" />}
      />

      <Input
        isRequired
        label={tr.password}
        type={showPw ? 'text' : 'password'}
        value={password}
        onValueChange={setPassword}
        variant="bordered"
        autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
        labelPlacement="outside"
        startContent={<Lock size={18} className="shrink-0 text-stone-400" />}
        endContent={
          <button
            type="button"
            onClick={() => setShowPw((v) => !v)}
            className="text-stone-400 hover:text-stone-600"
            aria-label="toggle"
          >
            {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        }
      />

      {mode === 'create' && (
        <Input
          type="email"
          label={tr.email}
          placeholder={tr.emailPlaceholder}
          value={email}
          onValueChange={setEmail}
          variant="bordered"
          autoComplete="email"
          labelPlacement="outside"
          startContent={<Mail size={18} className="shrink-0 text-stone-400" />}
        />
      )}

      {error && (
        <p className="rounded-md bg-danger-50 px-3 py-2 text-center text-sm text-danger">
          {error}
        </p>
      )}

      <Button
        color="primary"
        type="submit"
        size="lg"
        radius="md"
        isLoading={pending}
        className="font-semibold"
        startContent={!pending && (mode === 'login' ? <LogIn size={18} /> : <UserPlus size={18} />)}
      >
        {mode === 'login' ? tr.login : tr.create}
      </Button>

      <button
        type="button"
        onClick={() => {
          setMode((m) => (m === 'login' ? 'create' : 'login'));
          setError('');
        }}
        className="flex items-center justify-center gap-1.5 text-center text-sm font-medium text-primary underline-offset-4 transition-colors hover:underline"
      >
        <RefreshCw size={14} />
        {mode === 'login' ? tr.toggleToCreate : tr.toggleToLogin}
      </button>
    </form>
  );
}
