import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
export default function SecretField({ id, label, value, onChange, readOnly = false, autoComplete = 'off', disabled = false }: { id: string; label: string; value: string; onChange?: (value: string) => void; readOnly?: boolean; autoComplete?: string; disabled?: boolean }) {
  const [visible, setVisible] = useState(false);
  return <div className="space-y-2"><Label htmlFor={id}>{label}</Label><Input id={id} type={visible ? 'text' : 'password'} value={value} onChange={event => onChange?.(event.target.value)} readOnly={readOnly} autoComplete={autoComplete} disabled={disabled} /><Button type="button" variant="ghost" disabled={disabled} aria-pressed={visible} onClick={() => setVisible(!visible)}>{visible ? 'Hide' : 'Show'} {label.toLowerCase()}</Button></div>;
}
