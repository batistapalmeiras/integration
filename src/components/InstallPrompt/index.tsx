// React
import { useEffect, useState } from 'react';
// Libs
import { Download, Share, X } from 'lucide-react';
// Local
import { Banner, DismissButton, Icon, InstallButton, Text } from './styles';

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

// Shown on Login so volunteers see the "add to home screen" offer every
// time they aren't already using the installed app — Chrome fires its own
// event we can prompt from, but Safari (iOS) never exposes an install API
// at all, so there we just show the manual steps instead.
export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(isStandalone());
  const [dismissed, setDismissed] = useState(false);

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

  if (installed || dismissed || (!ios && !deferredPrompt)) return null;

  const install = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') setInstalled(true);
    setDeferredPrompt(null);
  };

  return (
    <Banner>
      <Icon>{ios ? <Share size={18} /> : <Download size={18} />}</Icon>
      <Text>
        {ios
          ? 'Instale o app: toque em Compartilhar e depois em "Adicionar à Tela de Início".'
          : 'Instale o app na tela inicial do seu celular para acesso rápido.'}
      </Text>
      {!ios && (
        <InstallButton type="button" variant="primary" onClick={install}>
          Instalar
        </InstallButton>
      )}
      <DismissButton type="button" onClick={() => setDismissed(true)} aria-label="Fechar">
        <X size={16} />
      </DismissButton>
    </Banner>
  );
}
