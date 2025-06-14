
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X, Download } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const InstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    } else {
      console.log('User dismissed the install prompt');
    }
    
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    setDeferredPrompt(null);
  };

  if (!showPrompt || !deferredPrompt) {
    return null;
  }

  return (
    <div className="fixed top-4 left-4 right-4 z-50 bg-white border rounded-lg shadow-lg p-4 flex items-center gap-3">
      <Download className="w-5 h-5 text-primary" />
      <div className="flex-1">
        <p className="text-sm font-medium">Install Everyday Sayings</p>
        <p className="text-xs text-muted-foreground">Get quick access from your home screen</p>
      </div>
      <div className="flex gap-2">
        <Button size="sm" onClick={handleInstall}>
          Install
        </Button>
        <Button size="sm" variant="ghost" onClick={handleDismiss}>
          <X className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default InstallPrompt;
