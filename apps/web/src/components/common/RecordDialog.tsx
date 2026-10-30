import { useState } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { Input, Textarea, Select } from './Input';
import { useLanguage } from '../../context/LanguageContext';

export type RecordField = { key: string; label: string; value: string; readOnly?: boolean; multiline?: boolean; type?: 'text' | 'number' | 'email'; options?: string[] };

/** Shared metadata form and detail view for administration records. */
export function RecordDialog({ title, fields, onClose, onSave }: {
  title: string; fields: RecordField[]; onClose: () => void;
  onSave?: (values: Record<string, string>) => Promise<void>;
}) {
  const { t } = useLanguage();
  const [values, setValues] = useState(() => Object.fromEntries(fields.map(f => [f.key, f.value])));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const formId = 'record-metadata-form';
  return <Modal isOpen onClose={onClose} title={title} size="md" footer={<>
    <Button variant="outline" onClick={onClose}>{t(onSave ? 'Cancel' : 'Close')}</Button>
    {onSave && <Button type="submit" form={formId} isLoading={saving}>{t('Save Changes')}</Button>}
  </>}>
    <form id={formId} className="space-y-4" onSubmit={async e => {
      e.preventDefault(); if (!onSave || saving) return;
      setSaving(true); setError('');
      try { await onSave(values); onClose(); }
      catch { setError(t('Unable to save changes. Please try again.')); }
      finally { setSaving(false); }
    }}>
      {error && <p role="alert" className="rounded-xl bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}
      {fields.map(f => !onSave ? <div key={f.key} className="space-y-1 border-b border-slate-100 pb-3 last:border-0">
        <p className="text-xs font-semibold text-slate-500">{t(f.label)}</p><p className="text-sm text-slate-900 dark:text-slate-100 whitespace-pre-wrap break-words">{f.value || '—'}</p>
      </div> : f.options ? <Select key={f.key} label={t(f.label)} value={values[f.key]} onChange={e => setValues({ ...values, [f.key]: e.target.value })} options={f.options.map(value => ({ value, label: t(value) }))} />
        : f.multiline ? <Textarea key={f.key} label={t(f.label)} value={values[f.key]} readOnly={f.readOnly} onChange={e => setValues({ ...values, [f.key]: e.target.value })} rows={3} />
        : <Input key={f.key} label={t(f.label)} type={f.type || 'text'} value={values[f.key]} readOnly={f.readOnly} required={!f.readOnly && !f.type} onChange={e => setValues({ ...values, [f.key]: e.target.value })} />)}
    </form>
  </Modal>;
}
