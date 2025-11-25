import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BrandCard } from "@/components/ui/brand-card";
import { Button } from "@/components/ui/button";

interface SavedKit {
  id: number;
  brandName: string;
  taglineOptions: string[];
  colorPalette: Array<{
    name: string;
    hex: string;
    usage: string;
  }>;
}

const Saved = () => {
  const [savedKits, setSavedKits] = useState<SavedKit[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("savedKits") || "[]");
    setSavedKits(saved);
  }, []);

  return (
    <div className="min-h-screen bg-canvas p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 space-y-4">
          <Link to="/">
            <Button variant="outline" size="sm" rounded="pill">
              ← Back to home
            </Button>
          </Link>
          <h1 className="text-4xl">Saved Brand Kits</h1>
          <p className="text-ink/70">
            Your collection of generated brand kits. Click to view details.
          </p>
        </div>

        {savedKits.length === 0 ? (
          <BrandCard className="text-center py-12">
            <p className="text-lg text-ink/70 mb-4">No saved kits yet</p>
            <Link to="/studio">
              <Button rounded="pill">Create your first kit</Button>
            </Link>
          </BrandCard>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {savedKits.map((kit) => (
              <BrandCard key={kit.id} className="space-y-4">
                <div>
                  <h3 className="text-xl font-semibold mb-1">{kit.brandName}</h3>
                  <p className="text-sm text-ink/70">{kit.taglineOptions[0]}</p>
                </div>

                <div className="flex gap-2">
                  {kit.colorPalette.slice(0, 5).map((color) => (
                    <div
                      key={color.hex}
                      className="h-8 w-8 rounded-full border border-ink/10"
                      style={{ backgroundColor: color.hex }}
                    />
                  ))}
                </div>

                <Button
                  variant="outline"
                  rounded="pill"
                  className="w-full"
                  onClick={() => navigate("/studio")}
                >
                  View details
                </Button>
              </BrandCard>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Saved;
