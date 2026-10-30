import { useCallback, useEffect, useRef, useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Modal } from './Modal';
import { Button } from './Button';
import { useLanguage } from '../../context/LanguageContext';

/** An app-styled replacement for window.confirm; dismissing always cancels. */
export function useConfirmDialog() {
  const { t } = useLanguage();
  const [message, setMessage] = useState<string | null>(null);
  const pending = useRef<((accepted: boolean) => void) | null>(null);
  const finish = useCallback((accepted: boolean) => {
    pending.current?.(accepted);
    pending.current = null;
    setMessage(null);
  }, []);
  useEffect(() => () => { pending.current?.(false); }, []);
  const confirm = useCallback((text: string) => new Promise<boolean>((resolve) => {
    pending.current?.(false);
    pending.current = resolve;
    setMessage(text);
  }), []);
  const confirmationDialog = (
    <Modal isOpen={message !== null} onClose={() => finish(false)} title={t('Confirm action')} size="sm"
      footer={<><Button variant="outline" onClick={() => finish(false)}>{t('Cancel')}</Button><Button variant="danger" onClick={() => finish(true)}>{t('Confirm')}</Button></>}>
      <div className="flex items-start gap-3">
        <div className="rounded-xl bg-rose-50 p-2 text-rose-600"><AlertTriangle className="h-5 w-5" /></div>
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-200">{message}</p>
      </div>
    </Modal>
  );
  return { confirm, confirmationDialog };
}
