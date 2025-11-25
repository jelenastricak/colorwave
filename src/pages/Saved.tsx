import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { SideWaveBackground } from "@/components/backgrounds/SideWaveBackground";
import { BrandCard } from "@/components/ui/brand-card";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "@/hooks/use-toast";
import { exportBrandKitAsPDF } from "@/utils/exportBrandKit";

interface SavedKit {
  id: string;
  brandName: string;
  taglineOptions: string[];
  positioning: string;
  coreMessage: string;
  toneOfVoice: string[];
  colorPalette: Array<{
    name: string;
    hex: string;
    usage: string;
  }>;
  typography: {
    headingFont: string;
    bodyFont: string;
    notes: string;
  };
  heroSection: {
    headline: string;
    subheadline: string;
    primaryCTA: string;
    secondaryCTA: string;
  };
}

const Saved = () => {
  const [savedKits, setSavedKits] = useState<SavedKit[]>([]);
  const [kitToDelete, setKitToDelete] = useState<string | null>(null);

  useEffect(() => {
    const kits = JSON.parse(localStorage.getItem("brandKits") || "[]");
    setSavedKits(kits);
  }, []);

  const handleDelete = () => {
    if (!kitToDelete) return;

    const updatedKits = savedKits.filter((kit) => kit.id !== kitToDelete);
    localStorage.setItem("brandKits", JSON.stringify(updatedKits));
    setSavedKits(updatedKits);
    
    toast({
      title: "Success",
      description: "Brand kit deleted successfully.",
    });
    
    setKitToDelete(null);
  };

  return (
    <SideWaveBackground>
      <div className="space-y-8">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Link to="/">
              <Button variant="outline" size="sm" rounded="pill">
                ← Back to home
              </Button>
            </Link>
          </div>
          
          <h1 className="text-2xl sm:text-3xl break-words">Your saved brand kits</h1>

          {savedKits.length === 0 ? (
            <BrandCard className="text-center py-12 space-y-4">
              <p className="text-ink/70">No saved kits yet</p>
              <Link to="/studio">
                <Button rounded="pill">Create your first kit</Button>
              </Link>
            </BrandCard>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {savedKits.map((kit) => (
                <BrandCard key={kit.id} className="space-y-4">
                  <h3 className="text-lg sm:text-xl font-semibold break-words">{kit.brandName}</h3>
                  <p className="text-sm sm:text-base text-ink/70 break-words">{kit.taglineOptions[0]}</p>
                  <div className="flex gap-2 flex-wrap">
                    {kit.colorPalette.slice(0, 5).map((color) => (
                      <div
                        key={color.hex}
                        className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex-shrink-0"
                        style={{ backgroundColor: color.hex }}
                      />
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Link to={`/studio?id=${kit.id}`}>
                      <Button size="sm" variant="outline" rounded="pill" className="whitespace-nowrap">
                        View & Edit
                      </Button>
                    </Link>
                    <Button
                      size="sm"
                      variant="destructive"
                      rounded="pill"
                      onClick={() => setKitToDelete(kit.id)}
                      className="whitespace-nowrap"
                    >
                      Delete
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      rounded="pill"
                      onClick={() => exportBrandKitAsPDF(kit)}
                      className="whitespace-nowrap"
                    >
                      Export PDF
                    </Button>
                  </div>
                </BrandCard>
              ))}
            </div>
          )}
        </div>
      </div>

      <AlertDialog open={!!kitToDelete} onOpenChange={() => setKitToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Brand Kit</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this brand kit? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SideWaveBackground>
  );
};

export default Saved;
