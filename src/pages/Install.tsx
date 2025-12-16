import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Header } from "@/components/Header";
import { BottomWaveBackground } from "@/components/backgrounds/BottomWaveBackground";
import { PageTransition } from "@/components/PageTransition";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const Install = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
    }

    // Check if iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(isIOSDevice);

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // Listen for successful install
    window.addEventListener("appinstalled", () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
  };

  return (
    <PageTransition>
    <BottomWaveBackground>
      <div className="min-h-screen">
        <Header />

        <main className="max-w-2xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
          <div className="text-center mb-8 sm:mb-12">
            <h1 className="text-2xl sm:text-3xl font-semibold text-ink mb-4">
              Install Colorwave Studio
            </h1>
            <p className="text-ink/70 text-base sm:text-lg">
              Add the app to your home screen for quick access and offline use.
            </p>
          </div>

          {isInstalled ? (
            <Card className="bg-canvas border-ink/10">
              <CardContent className="p-6 sm:p-8 text-center">
                <div className="text-4xl mb-4">✓</div>
                <h2 className="text-xl font-medium text-ink mb-2">
                  Already Installed
                </h2>
                <p className="text-ink/70 mb-6">
                  Colorwave Studio is installed on your device. You can access it from your home screen.
                </p>
                <Button asChild>
                  <Link to="/studio">Go to Studio</Link>
                </Button>
              </CardContent>
            </Card>
          ) : deferredPrompt ? (
            <Card className="bg-canvas border-ink/10">
              <CardContent className="p-6 sm:p-8 text-center">
                <h2 className="text-xl font-medium text-ink mb-4">
                  Install with One Click
                </h2>
                <p className="text-ink/70 mb-6">
                  Click the button below to add Colorwave Studio to your home screen.
                </p>
                <Button onClick={handleInstall} size="lg">
                  Install App
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {isIOS ? (
                <Card className="bg-canvas border-ink/10">
                  <CardContent className="p-6 sm:p-8">
                    <h2 className="text-xl font-medium text-ink mb-4 text-center">
                      Install on iPhone/iPad
                    </h2>
                    <ol className="space-y-4 text-ink/80">
                      <li className="flex gap-3">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-ink text-canvas flex items-center justify-center text-sm font-medium">1</span>
                        <span>Tap the <strong>Share</strong> button at the bottom of Safari (the square with an arrow pointing up)</span>
                      </li>
                      <li className="flex gap-3">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-ink text-canvas flex items-center justify-center text-sm font-medium">2</span>
                        <span>Scroll down and tap <strong>"Add to Home Screen"</strong></span>
                      </li>
                      <li className="flex gap-3">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-ink text-canvas flex items-center justify-center text-sm font-medium">3</span>
                        <span>Tap <strong>"Add"</strong> in the top right corner</span>
                      </li>
                    </ol>
                  </CardContent>
                </Card>
              ) : (
                <Card className="bg-canvas border-ink/10">
                  <CardContent className="p-6 sm:p-8">
                    <h2 className="text-xl font-medium text-ink mb-4 text-center">
                      Install on Android/Desktop
                    </h2>
                    <ol className="space-y-4 text-ink/80">
                      <li className="flex gap-3">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-ink text-canvas flex items-center justify-center text-sm font-medium">1</span>
                        <span>Open the browser menu (three dots in the top right)</span>
                      </li>
                      <li className="flex gap-3">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-ink text-canvas flex items-center justify-center text-sm font-medium">2</span>
                        <span>Tap <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong></span>
                      </li>
                      <li className="flex gap-3">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-ink text-canvas flex items-center justify-center text-sm font-medium">3</span>
                        <span>Confirm by tapping <strong>"Install"</strong></span>
                      </li>
                    </ol>
                  </CardContent>
                </Card>
              )}

              <div className="text-center">
                <p className="text-ink/60 text-sm mb-4">
                  Already have the app? Open it from your home screen.
                </p>
                <Button asChild variant="ghost">
                  <Link to="/studio">Continue in Browser</Link>
                </Button>
              </div>
            </div>
          )}
        </main>
      </div>
    </BottomWaveBackground>
    </PageTransition>
  );
};

export default Install;
