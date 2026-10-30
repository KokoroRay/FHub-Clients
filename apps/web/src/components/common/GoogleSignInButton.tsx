import { useEffect, useRef, useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';

interface CredentialResponse { credential?: string }
interface GoogleIdentity {
  initialize(options: {
    client_id: string;
    callback: (response: CredentialResponse) => void;
    ux_mode: 'popup';
    auto_select: boolean;
    use_fedcm_for_button: boolean;
    button_auto_select: boolean;
  }): void;
  renderButton(parent: HTMLElement, options: {
    type: 'standard'; theme: 'outline'; size: 'large';
    text: 'continue_with'; shape: 'pill'; locale: string; width: number;
  }): void;
}

const scriptUrl = 'https://accounts.google.com/gsi/client';
const getIdentity = () => (window as Window & {
  google?: { accounts?: { id?: GoogleIdentity } };
}).google?.accounts?.id;

let libraryPromise: Promise<GoogleIdentity> | undefined;
let initialized = false;
let credentialHandler: ((response: CredentialResponse) => void) | undefined;

function loadIdentity(): Promise<GoogleIdentity> {
  const identity = getIdentity();
  if (identity) return Promise.resolve(identity);
  if (libraryPromise) return libraryPromise;

  libraryPromise = new Promise<GoogleIdentity>((resolve, reject) => {
    const script = document.querySelector<HTMLScriptElement>(`script[src="${scriptUrl}"]`)
      ?? document.createElement('script');
    const cleanup = () => {
      clearTimeout(timeout);
      script.removeEventListener('load', onLoad);
      script.removeEventListener('error', onError);
    };
    const onError = () => {
      cleanup();
      script.remove();
      reject(new Error('Google Identity Services failed to load'));
    };
    const onLoad = () => {
      const loaded = getIdentity();
      if (!loaded) return onError();
      cleanup();
      resolve(loaded);
    };
    const timeout = window.setTimeout(onError, 15000);
    script.addEventListener('load', onLoad);
    script.addEventListener('error', onError);
    if (!script.isConnected) {
      script.src = scriptUrl;
      script.async = true;
      document.head.appendChild(script);
    }
  }).catch((error: unknown) => {
    libraryPromise = undefined;
    throw error;
  });
  return libraryPromise;
}

export function GoogleSignInButton({ onSuccess, disabled = false }: {
  onSuccess: (idToken: string) => void | Promise<void>;
  disabled?: boolean;
}) {
  const { t, language } = useLanguage();
  const containerRef = useRef<HTMLDivElement>(null);
  const latest = useRef({ onSuccess, disabled });
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [attempt, setAttempt] = useState(0);
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

  useEffect(() => { latest.current = { onSuccess, disabled }; }, [onSuccess, disabled]);

  useEffect(() => {
    if (!clientId) return;
    const container = containerRef.current;
    let active = true;
    const handler = (response: CredentialResponse) => {
      if (active && !latest.current.disabled && response.credential) {
        void latest.current.onSuccess(response.credential);
      }
    };
    loadIdentity().then((identity) => {
      if (!active || !container) return;
      credentialHandler = handler;
      if (!initialized) {
        identity.initialize({
          client_id: clientId,
          callback: (response) => credentialHandler?.(response),
          ux_mode: 'popup',
          auto_select: false,
          // Keep the full Google popup instead of the browser's small FedCM UI.
          use_fedcm_for_button: false,
          button_auto_select: false,
        });
        initialized = true;
      }
      container.replaceChildren();
      identity.renderButton(container, {
        type: 'standard', theme: 'outline', size: 'large',
        text: 'continue_with', shape: 'pill', locale: language,
        width: Math.min(400, container.clientWidth),
      });
      setStatus('ready');
    }).catch(() => { if (active) setStatus('error'); });
    return () => {
      active = false;
      if (credentialHandler === handler) credentialHandler = undefined;
      container?.replaceChildren();
    };
  }, [clientId, language, attempt]);

  return (
    <div className="min-w-0 space-y-2" aria-busy={Boolean(clientId) && (status === 'loading' || disabled)}>
      <div ref={containerRef} inert={disabled} className={`flex min-h-10 justify-center ${disabled ? 'opacity-50' : ''}`} />
      {!clientId ? (
        <p role="alert" className="text-xs text-rose-700">{t('Đăng nhập Google chưa được cấu hình. Vui lòng đăng nhập bằng Email.')}</p>
      ) : status === 'error' ? (
        <div role="alert" className="text-xs text-rose-700">
          <p>{t('Không tải được đăng nhập Google. Vui lòng kiểm tra kết nối và thử lại.')}</p>
          <button type="button" className="mt-1 cursor-pointer underline" onClick={() => {
            setStatus('loading');
            setAttempt((value) => value + 1);
          }}>{t('Thử lại')}</button>
        </div>
      ) : (status === 'loading' || disabled) && (
        <p role="status" className="text-center text-xs text-slate-500">{t('common.loading', 'Loading...')}</p>
      )}
    </div>
  );
}
