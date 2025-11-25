import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BottomWaveBackground } from "@/components/backgrounds/BottomWaveBackground";
import { BrandCard } from "@/components/ui/brand-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from "@supabase/supabase-js";

interface BrandKit {
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

const Studio = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [formData, setFormData] = useState({
    projectName: "",
    description: "",
    targetAudience: "",
    brandVibe: "",
    industry: "",
    keywords: "",
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [brandKit, setBrandKit] = useState<BrandKit | null>(null);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (!session?.user) {
          navigate("/auth");
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (!session?.user) {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-brand-kit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ formData }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate brand kit');
      }

      const { brandKit: generatedKit } = await response.json();
      setBrandKit(generatedKit);
      
      toast({
        title: "Brand kit generated!",
        description: "Your custom brand identity is ready.",
      });
    } catch (error) {
      console.error('Error generating brand kit:', error);
      toast({
        title: "Generation failed",
        description: error instanceof Error ? error.message : 'Failed to generate brand kit. Please try again.',
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleClear = () => {
    setFormData({
      projectName: "",
      description: "",
      targetAudience: "",
      brandVibe: "",
      industry: "",
      keywords: "",
    });
  };

  const handleSave = async () => {
    if (brandKit && user) {
      try {
        const { error } = await supabase.from("brand_kits").insert({
          user_id: user.id,
          brand_name: brandKit.brandName,
          tagline_options: brandKit.taglineOptions,
          positioning: brandKit.positioning,
          core_message: brandKit.coreMessage,
          tone_of_voice: brandKit.toneOfVoice,
          color_palette: brandKit.colorPalette,
          typography: brandKit.typography,
          hero_section: brandKit.heroSection,
        });

        if (error) throw error;

        toast({
          title: "Brand kit saved!",
          description: "Your brand kit has been saved to your collection.",
        });
      } catch (error) {
        console.error("Error saving brand kit:", error);
        toast({
          title: "Save failed",
          description: "Failed to save brand kit. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const handleCopy = () => {
    if (brandKit) {
      const text = `
Brand: ${brandKit.brandName}
Tagline: ${brandKit.taglineOptions[0]}

Color Palette:
${brandKit.colorPalette.map((c) => `${c.name}: ${c.hex} (${c.usage})`).join("\n")}

Typography:
Heading: ${brandKit.typography.headingFont}
Body: ${brandKit.typography.bodyFont}
      `.trim();

      navigator.clipboard.writeText(text);
      toast({
        title: "Copied to clipboard!",
        description: "Brand kit details have been copied.",
      });
    }
  };

  return (
    <BottomWaveBackground>
      <div className="min-h-screen">
        <div className="grid lg:grid-cols-[40%_60%] min-h-screen">
          {/* Form Panel */}
          <div className="p-8 space-y-6 overflow-y-auto">
            <div className="flex items-center justify-between gap-4 mb-4">
              <Link to="/">
                <Button variant="outline" size="sm" rounded="pill">
                  ← Back to home
                </Button>
              </Link>
              <div className="flex gap-2">
                <Link to="/profile">
                  <Button variant="outline" size="sm" rounded="pill">
                    Profile
                  </Button>
                </Link>
                <Button variant="outline" size="sm" rounded="pill" onClick={handleSignOut}>
                  Sign out
                </Button>
              </div>
            </div>
            
            <div className="space-y-2">
              <h1 className="text-3xl">Colorwave Studio</h1>
              <p className="text-ink/70">You can tweak everything later—this is your starting point.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <BrandCard className="space-y-4">
                <h2 className="text-xl">Describe your project</h2>

                <div className="space-y-2">
                  <Label htmlFor="projectName">Project name</Label>
                  <Input
                    id="projectName"
                    value={formData.projectName}
                    onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
                    placeholder="My Awesome Project"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">What are you building?</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="SaaS tool for HR managers..."
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="targetAudience">Target audience</Label>
                  <Input
                    id="targetAudience"
                    value={formData.targetAudience}
                    onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                    placeholder="Small business owners, freelancers..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="brandVibe">Brand vibe</Label>
                  <Input
                    id="brandVibe"
                    value={formData.brandVibe}
                    onChange={(e) => setFormData({ ...formData, brandVibe: e.target.value })}
                    placeholder="playful, premium, minimal, bold..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="industry">Industry</Label>
                  <Input
                    id="industry"
                    value={formData.industry}
                    onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                    placeholder="tech, coaching, ecommerce..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="keywords">Optional keywords</Label>
                  <Input
                    id="keywords"
                    value={formData.keywords}
                    onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
                    placeholder="growth, innovation, community..."
                  />
                </div>
              </BrandCard>

              <div className="flex gap-3">
                <Button type="submit" className="flex-1" rounded="pill" disabled={isGenerating}>
                  {isGenerating ? "Designing your colors and voice..." : "Generate brand kit"}
                </Button>
                <Button type="button" variant="outline" onClick={handleClear}>
                  Clear form
                </Button>
              </div>
            </form>
          </div>

          {/* Results Panel */}
          <div className="overflow-y-auto">
            {brandKit ? (
              <div className="space-y-6 p-8">
                  <div className="flex justify-between items-center">
                    <h2>Your brand kit</h2>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => setBrandKit(null)}>
                        Regenerate
                      </Button>
                      <Button size="sm" variant="outline" onClick={handleSave}>
                        Save kit
                      </Button>
                      <Button size="sm" onClick={handleCopy}>
                        Copy to clipboard
                      </Button>
                    </div>
                  </div>

                  {/* Brand Overview */}
                  <BrandCard>
                    <h3 className="text-2xl font-semibold mb-2">{brandKit.brandName}</h3>
                    <p className="text-lg text-ink/80 mb-4">{brandKit.taglineOptions[0]}</p>
                    <ul className="space-y-2 text-sm">
                      <li>• {brandKit.positioning}</li>
                      <li>• {brandKit.coreMessage}</li>
                    </ul>
                  </BrandCard>

                  {/* Color Palette */}
                  <BrandCard>
                    <h3 className="text-xl font-semibold mb-4">Color palette</h3>
                    <div className="grid grid-cols-5 gap-4">
                      {brandKit.colorPalette.map((color) => (
                        <div key={color.hex} className="space-y-2">
                          <div
                            className="h-24 rounded-lg"
                            style={{ backgroundColor: color.hex }}
                          />
                          <p className="text-sm font-medium">{color.hex}</p>
                          <p className="text-xs text-ink/60">{color.name}</p>
                          <p className="text-xs text-ink/50">{color.usage}</p>
                        </div>
                      ))}
                    </div>
                  </BrandCard>

                  {/* Typography */}
                  <BrandCard>
                    <h3 className="text-xl font-semibold mb-4">Typography</h3>
                    <div className="space-y-4">
                      <div>
                        <p className="text-2xl font-semibold">{brandKit.typography.headingFont}</p>
                        <p className="text-sm text-ink/60">For headlines and emphasis</p>
                      </div>
                      <div>
                        <p className="text-base">{brandKit.typography.bodyFont}</p>
                        <p className="text-sm text-ink/60">For body text and UI</p>
                      </div>
                      <p className="text-sm text-ink/70">{brandKit.typography.notes}</p>
                    </div>
                  </BrandCard>

                  {/* Brand Voice */}
                  <BrandCard>
                    <h3 className="text-xl font-semibold mb-4">Brand voice</h3>
                    <div className="flex gap-2 mb-4">
                      {brandKit.toneOfVoice.map((tone) => (
                        <span
                          key={tone}
                          className="px-3 py-1 rounded-full border border-ink/25 text-sm"
                        >
                          {tone}
                        </span>
                      ))}
                    </div>
                    <p className="text-sm text-ink/70">
                      Think of this as your creative briefing partner. Keep your tone {brandKit.toneOfVoice.join(", ").toLowerCase()} in all communications.
                    </p>
                  </BrandCard>

                  {/* Hero Section Draft */}
                  <BrandCard>
                    <h3 className="text-xl font-semibold mb-4">Hero section draft</h3>
                    <div className="space-y-4">
                      <div>
                        <p className="text-2xl font-semibold mb-2">{brandKit.heroSection.headline}</p>
                        <p className="text-ink/70">{brandKit.heroSection.subheadline}</p>
                      </div>
                      <div className="flex gap-3">
                        <Button rounded="pill">{brandKit.heroSection.primaryCTA}</Button>
                        <Button variant="ghost" rounded="pill">
                          {brandKit.heroSection.secondaryCTA}
                        </Button>
                      </div>
                    </div>
                  </BrandCard>
                </div>
            ) : (
              <div className="flex items-center justify-center h-full p-8">
                <div className="text-center space-y-4 max-w-md" style={{ marginLeft: '-6cm' }}>
                  <h3 className="text-2xl font-semibold">Ready when you are</h3>
                  <p className="text-ink/70">
                    Fill out the form and hit generate to see your brand kit come to life.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </BottomWaveBackground>
  );
};

export default Studio;
