import { ButtonGroup, Button } from '@heroui/react';
import { LANGS } from '../i18n';

export default function LanguageToggle({ lang, onChange }) {
  return (
    <ButtonGroup size="sm" radius="md" variant="flat">
      {LANGS.map((l) => (
        <Button
          key={l}
          onPress={() => onChange(l)}
          className={
            lang === l
              ? 'bg-white font-bold uppercase text-primary'
              : 'bg-white/15 uppercase text-white'
          }
        >
          {l}
        </Button>
      ))}
    </ButtonGroup>
  );
}
