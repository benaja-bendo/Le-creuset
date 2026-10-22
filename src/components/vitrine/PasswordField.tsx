import { useState, type ChangeEvent, type ReactNode } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { fieldInput, fieldLabel } from './styles';

type PasswordFieldProps = {
  id: string;
  label: string;
  name?: string;
  value: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  autoComplete: 'current-password' | 'new-password';
  describedBy?: string;
  hint?: ReactNode;
};

/** Champ mot de passe avec bouton afficher / masquer. */
export default function PasswordField({ id, label, name, value, onChange, autoComplete, describedBy, hint }: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className={fieldLabel}>
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          name={name}
          type={visible ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          autoComplete={autoComplete}
          aria-describedby={describedBy}
          placeholder="••••••••"
          className={`${fieldInput} pr-12`}
          required
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
          className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-pierre transition-colors hover:text-charbon"
        >
          {visible ? <EyeOff size={18} strokeWidth={1.5} /> : <Eye size={18} strokeWidth={1.5} />}
        </button>
      </div>
      {hint}
    </div>
  );
}
