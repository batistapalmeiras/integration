// React
import { useEffect, useState } from 'react';
// Local
import { InstallAction, Prompt } from './styles';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

function isStandalone(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

function isIos(): boolean {
  return /iphone|ipad|ipod/i.test(window.navigator.userAgent);
}

// Rendered as the Login page's footerSlot, right under the "Entrar" button
// — Chrome fires its own install event we can prompt from, but Safari
// (iOS) never exposes an install API at all, so there we just show the
// manual steps as text instead.
export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(isStandalone());

  useEffect(() => {
    const onBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    const onInstalled = () => setInstalled(true);

    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  const ios = isIos();

  if (installed || (!ios && !deferredPrompt)) return null;

  const install = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') setInstalled(true);
    setDeferredPrompt(null);
  };

  return (
    <Prompt>
      {ios ? (
        'Instale o app: toque em Compartilhar e depois em "Adicionar à Tela de Início".'
      ) : (
        <>
          Instale o app na tela inicial do seu celular para acesso rápido.{' '}
          <InstallAction type="button" onClick={install}>
            Instalar
          </InstallAction>
        </>
      )}
    </Prompt>
  );
}
