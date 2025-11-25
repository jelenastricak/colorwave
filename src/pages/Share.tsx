import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { TopWaveBackground } from "@/components/backgrounds/TopWaveBackground";
import { BrandCard } from "@/components/ui/brand-card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

interface SharedKit {
  id: string;
  brand_name: string;
  tagline_options: string[];
  positioning: string;
  core_message: string;
  tone_of_voice: Array<{ adjective: string; description: string }>;
  color_palette: Array<{
    name: string;
    hex: string;
    usage: string;
  }>;
  typography: {
    headingFont: string;
    bodyFont: string;
    notes: string;
  };
  hero_section: {
    headline: string;
    subheadline: string;
    primaryCTA: string;
    secondaryCTA: string;
  };
}

const Share = () => {
  const { token } = useParams<{ token: string }>();
  const [kit, setKit] = useState<SharedKit | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadSharedKit = async () => {
      if (!token) {
        setError("Invalid share link");
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("brand_kits")
        .select("*")
        .eq("share_token", token)
        .eq("is_public", true)
        .maybeSingle();

      if (error) {
        console.error("Error loading shared kit:", error);
        setError("Failed to load brand kit");
      } else if (!data) {
        setError("Brand kit not found or no longer shared");
      } else {
        setKit(data as any);
      }
      setIsLoading(false);
    };

    loadSharedKit();
  }, [token]);

  if (isLoading) {
    return (
      <TopWaveBackground>
        <div className="space-y-8">
          <div className="text-center py-12">
            <p className="text-ink/70">Loading brand kit...</p>
          </div>
        </div>
      </TopWaveBackground>
    );
  }

  if (error || !kit) {
    return (
      <TopWaveBackground>
        <div className="space-y-8">
          <BrandCard className="text-center py-12 space-y-4">
            <p className="text-ink/70">{error || "Brand kit not found"}</p>
            <Link to="/">
              <Button rounded="pill">Go to home</Button>
            </Link>
          </BrandCard>
        </div>
      </TopWaveBackground>
    );
  }

  return (
    <TopWaveBackground>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl">Shared Brand Kit</h1>
          <Link to="/">
            <Button variant="outline" size="sm" rounded="pill">
              Create your own
            </Button>
          </Link>
        </div>

        <BrandCard className="space-y-6">
          <div>
            <h2 className="text-2xl font-semibold mb-2">{kit.brand_name}</h2>
            <p className="text-ink/70">{kit.tagline_options[0]}</p>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-1">Positioning</h3>
              <p className="text-ink/90">{kit.positioning}</p>
            </div>

            <div>
              <h3 className="font-semibold mb-1">Core Message</h3>
              <p className="text-ink/90">{kit.core_message}</p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Tone of Voice</h3>
              <div className="flex flex-wrap gap-2">
                {kit.tone_of_voice.map((tone, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-canvas/50 border border-ink/25 rounded-full text-sm"
                  >
                    {tone.adjective}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </BrandCard>

        <BrandCard className="space-y-4">
          <h3 className="text-xl font-semibold">Color Palette</h3>
          <div className="grid gap-4">
            {kit.color_palette.map((color, idx) => (
              <div key={idx} className="flex items-center gap-4">
                <div
                  className="w-16 h-16 rounded-lg border border-ink/25 flex-shrink-0"
                  style={{ backgroundColor: color.hex }}
                />
                <div className="flex-1">
                  <p className="font-semibold">{color.name}</p>
                  <p className="text-sm text-ink/70">{color.hex}</p>
                  <p className="text-sm text-ink/60">{color.usage}</p>
                </div>
              </div>
            ))}
          </div>
        </BrandCard>

        <BrandCard className="space-y-4">
          <h3 className="text-xl font-semibold">Typography</h3>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-ink/70">Heading Font</p>
              <p className="font-semibold">{kit.typography.headingFont}</p>
            </div>
            <div>
              <p className="text-sm text-ink/70">Body Font</p>
              <p className="font-semibold">{kit.typography.bodyFont}</p>
            </div>
            {kit.typography.notes && (
              <div>
                <p className="text-sm text-ink/70">Notes</p>
                <p className="text-ink/90">{kit.typography.notes}</p>
              </div>
            )}
          </div>
        </BrandCard>

        <BrandCard className="space-y-4">
          <h3 className="text-xl font-semibold">Hero Section</h3>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-ink/70">Headline</p>
              <p className="text-lg font-semibold">{kit.hero_section.headline}</p>
            </div>
            <div>
              <p className="text-sm text-ink/70">Subheadline</p>
              <p className="text-ink/90">{kit.hero_section.subheadline}</p>
            </div>
            <div className="flex gap-4">
              <div className="flex-1">
                <p className="text-sm text-ink/70">Primary CTA</p>
                <p className="text-ink/90">{kit.hero_section.primaryCTA}</p>
              </div>
              <div className="flex-1">
                <p className="text-sm text-ink/70">Secondary CTA</p>
                <p className="text-ink/90">{kit.hero_section.secondaryCTA}</p>
              </div>
            </div>
          </div>
        </BrandCard>
      </div>
    </TopWaveBackground>
  );
};

export default Share;
